import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Users, ListChecks, Target, ArrowRight, Clock, MessageSquare } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import HelpButton from '../components/ui/HelpButton'
import { overviewHelp } from '../content/helpContent'

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleJoinSession = (e: React.FormEvent) => {
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
    navigate(`/session/${trimmedCode.toLowerCase()}`)
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
        <form onSubmit={handleJoinSession} className="space-y-4">
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
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full flex items-center justify-center gap-2">
            Start Planning
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          Pick something unique to your team—anyone with the code can view and edit. Share it with teammates to collaborate.
        </p>
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
