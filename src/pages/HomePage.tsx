import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Users, ListChecks, Target, ArrowRight, Clock, MessageSquare, Loader2, Lock } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import HelpButton from '../components/ui/HelpButton'
import { overviewHelp } from '../content/helpContent'
import { getSession, createSession } from '../services/sessionService'
import { hashPin, validatePin, isValidPin } from '../utils/pinUtils'
import { isFirebaseConfigured } from '../services/firebase'

type Step = 'code' | 'create-pin' | 'enter-pin'

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('code')
  const [isLoading, setIsLoading] = useState(false)
  const [storedPinHash, setStoredPinHash] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSessionCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCode = sessionCode.trim()

    if (!trimmedCode) {
      setError('Please enter a session code')
      return
    }

    if (trimmedCode.length < 2) {
      setError('Session code must be at least 2 characters')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedCode)) {
      setError('Session code can only contain letters, numbers, hyphens, and underscores')
      return
    }

    setError('')
    const normalizedCode = trimmedCode.toLowerCase()

    // If Firebase is not configured, just navigate (local-only mode)
    if (!isFirebaseConfigured()) {
      navigate(`/session/${normalizedCode}`)
      return
    }

    setIsLoading(true)
    try {
      const existingSession = await getSession(normalizedCode)

      if (existingSession) {
        if (existingSession.pinHash) {
          // Session exists with PIN protection
          setStoredPinHash(existingSession.pinHash)
          setStep('enter-pin')
        } else {
          // Legacy session without PIN - allow direct access
          navigate(`/session/${normalizedCode}`)
        }
      } else {
        // New session - need to create with PIN
        setStep('create-pin')
      }
    } catch (err) {
      setError('Failed to check session. Please try again.')
      console.error('Session check error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidPin(pin)) {
      setError('PIN must be exactly 4 digits')
      return
    }

    setError('')
    setIsLoading(true)
    const normalizedCode = sessionCode.trim().toLowerCase()

    try {
      if (step === 'create-pin') {
        // Creating new session with PIN
        const pinHash = await hashPin(pin)
        await createSession(normalizedCode, pinHash)
        navigate(`/session/${normalizedCode}?pin=${pin}`)
      } else {
        // Validating PIN for existing session
        if (storedPinHash && await validatePin(pin, storedPinHash)) {
          navigate(`/session/${normalizedCode}?pin=${pin}`)
        } else {
          setError('Incorrect PIN. Please try again.')
        }
      }
    } catch (err) {
      setError('Failed to process. Please try again.')
      console.error('PIN processing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep('code')
    setPin('')
    setError('')
    setStoredPinHash(null)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
            <Bot className="w-16 h-16 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            FRC Season Plan Builder
          </h1>
          <HelpButton title={overviewHelp.title}>
            {overviewHelp.content}
          </HelpButton>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Collaborate with your team to plan robot capabilities and match strategies for the upcoming season.
        </p>
      </div>

      <div className="card p-6 w-full max-w-md">
        {step === 'code' ? (
          <form onSubmit={handleSessionCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="sessionCode" className="block text-sm font-medium mb-2">
                Enter a Session Code
              </label>
              <Input
                id="sessionCode"
                type="text"
                value={sessionCode}
                onChange={(e) => {
                  setSessionCode(e.target.value)
                  setError('')
                }}
                placeholder="e.g., 1234-turbo-bots or 5678-gear-grinders"
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Start Planning
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-medium">
                {step === 'create-pin' ? 'Create a PIN' : 'Enter PIN'}
              </span>
            </div>

            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Session: </span>
              <span className="font-mono font-medium">{sessionCode.trim().toLowerCase()}</span>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium mb-2">
                {step === 'create-pin'
                  ? 'Choose a 4-digit PIN to protect your session'
                  : 'Enter the 4-digit PIN for this session'
                }
              </label>
              <Input
                id="pin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setPin(value)
                  setError('')
                }}
                placeholder="0000"
                autoFocus
                disabled={isLoading}
                className="text-center text-2xl tracking-widest font-mono"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={isLoading || pin.length !== 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {step === 'create-pin' ? 'Creating...' : 'Joining...'}
                  </>
                ) : (
                  <>
                    {step === 'create-pin' ? 'Create Session' : 'Join Session'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {step === 'create-pin' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Share this PIN with your teammates so they can join.
              </p>
            )}
            {step === 'enter-pin' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Don't know the PIN? Ask the person who created this session.
              </p>
            )}
          </form>
        )}

        {step === 'code' && (
          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Pick something unique to your team. New sessions require a 4-digit PIN for protection.
          </p>
        )}
      </div>

      {/* Data retention notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg max-w-md">
        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">30-Day Data Retention</p>
          <p className="text-amber-700 dark:text-amber-300 mt-1">
            Session data is automatically deleted after 30 days of inactivity. Use <strong>Export</strong> to save a backup, and <strong>Import</strong> to restore it into any session later.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-8">
        <FeatureCard
          icon={<ListChecks className="w-6 h-6" />}
          title="Robot Capabilities"
          description="Plan what your robot should do and prioritize features"
        />
        <FeatureCard
          icon={<Target className="w-6 h-6" />}
          title="Match Strategy"
          description="Plan Auto, Teleop, and Endgame strategies with score projections"
        />
        <FeatureCard
          icon={<Users className="w-6 h-6" />}
          title="Real-time Collaboration"
          description="Work together with your team, synced automatically"
        />
      </div>

      {/* Feedback/Issues link */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
        <MessageSquare className="w-4 h-4" />
        <span>
          Have feedback or found an issue?{' '}
          <a
            href="https://github.com/MattVevang/frcseasonplanbuilder.github.io/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Let us know on GitHub
          </a>
        </span>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card p-4 text-center">
      <div className="flex justify-center mb-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
