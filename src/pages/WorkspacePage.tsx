import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ListChecks, Target, Download, Upload, Trash2, Wifi, WifiOff, Loader2, Clock, AlertTriangle } from 'lucide-react'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import HelpButton from '../components/ui/HelpButton'
import { capabilitiesHelp, strategyHelp } from '../content/helpContent'
import CapabilityList from '../components/capabilities/CapabilityList'
import StrategyList from '../components/strategy/StrategyList'
import ClearDataDialog from '../components/ui/ClearDataDialog'
import { useCapabilities } from '../hooks/useCapabilities'
import { useStrategies } from '../hooks/useStrategies'
import { useGamePlans } from '../hooks/useGamePlans'
import { useFirebaseSync } from '../hooks/useFirebaseSync'
import { getSession, deleteSession } from '../services/sessionService'
import { validatePin } from '../utils/pinUtils'
import { isFirebaseConfigured } from '../services/firebase'
import { exportData, importData } from '../utils/dataTransfer'
import toast from 'react-hot-toast'

type TabType = 'capabilities' | 'strategy'

export default function WorkspacePage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('capabilities')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [pinValidated, setPinValidated] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  // Get PIN from URL
  const pin = searchParams.get('pin')

  const { capabilities, clearAll: clearCapabilities, importCapabilities } = useCapabilities(sessionCode ?? null)
  const { strategies, clearAll: clearStrategies, importStrategies } = useStrategies(sessionCode ?? null)
  const { gamePlans, importGamePlans } = useGamePlans(sessionCode ?? null)
  const { isConnected, isLoading, isFirebaseEnabled, sessionNotFound } = useFirebaseSync({ sessionCode: sessionCode ?? null })

  // Validate PIN on mount
  useEffect(() => {
    if (!sessionCode) {
      navigate('/')
      return
    }

    // Skip PIN validation if Firebase is not configured (local mode)
    if (!isFirebaseConfigured()) {
      setPinValidated(true)
      return
    }

    const validateAccess = async () => {
      try {
        const session = await getSession(sessionCode.toLowerCase())

        if (!session) {
          // Session doesn't exist - redirect to HomePage to create it
          navigate('/', { replace: true })
          return
        }

        if (session.pinHash) {
          // Session has PIN protection
          if (!pin) {
            // No PIN provided - redirect to HomePage
            setPinError('This session requires a PIN')
            return
          }

          const isValid = await validatePin(pin, session.pinHash)
          if (!isValid) {
            setPinError('Invalid PIN')
            return
          }
        }

        // PIN validated (or no PIN required)
        setPinValidated(true)
      } catch (err) {
        console.error('PIN validation error:', err)
        setPinError('Failed to validate access')
      }
    }

    validateAccess()
  }, [sessionCode, pin, navigate])

  // Handle session not found from Firebase sync
  useEffect(() => {
    if (sessionNotFound && isFirebaseConfigured()) {
      navigate('/', { replace: true })
    }
  }, [sessionNotFound, navigate])

  if (!sessionCode) {
    return null
  }

  // Show PIN error state
  if (pinError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{pinError}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please go back and enter the correct PIN to access this session.
        </p>
        <Button onClick={() => navigate('/', { replace: true })}>
          Back to Home
        </Button>
      </div>
    )
  }

  // Show loading while validating PIN or loading data
  if (!pinValidated || (isLoading && isFirebaseEnabled)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-gray-600 dark:text-gray-400">
          {!pinValidated ? 'Validating access...' : 'Loading session data...'}
        </p>
      </div>
    )
  }

  const handleExport = () => {
    exportData(sessionCode, capabilities, gamePlans, strategies)
    toast.success('Data exported successfully!')
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const result = await importData(file)
        // Import to Firebase (these functions sync to server if configured)
        await importCapabilities(result.capabilities)
        await importGamePlans(result.gamePlans)
        await importStrategies(result.strategies)
        toast.success(`Imported ${result.capabilities.length} capabilities, ${result.gamePlans.length} game plans, and ${result.strategies.length} strategies`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to import data')
      }
    }
    input.click()
  }

  const handleClearAll = async (options: {
    clearCapabilities: boolean
    clearStrategies: boolean
    deleteSession: boolean
  }) => {
    if (options.deleteSession) {
      await deleteSession(sessionCode)
      toast.success('Session deleted')
      navigate('/', { replace: true })
      return
    }

    const cleared: string[] = []

    if (options.clearCapabilities && capabilities.length > 0) {
      await clearCapabilities()
      cleared.push('capabilities')
    }

    if (options.clearStrategies && strategies.length > 0) {
      await clearStrategies()
      cleared.push('strategies')
    }

    if (cleared.length > 0) {
      toast.success(`Cleared ${cleared.join(' and ')}`)
    }
    setShowClearDialog(false)
  }

  const tabs = [
    {
      id: 'capabilities' as const,
      label: 'Robot Capabilities',
      icon: <ListChecks className="w-4 h-4" />,
    },
    {
      id: 'strategy' as const,
      label: 'Match Strategy',
      icon: <Target className="w-4 h-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Connection status and data retention notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          {isFirebaseEnabled ? (
            isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Connected - Changes sync in real-time</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400">Offline - Changes saved locally</span>
              </>
            )
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Local mode - Data stored in browser only</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Data expires after 30 days - Export to backup, Import to restore</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as TabType)}
        />

        <div className="flex items-center gap-2">
          <HelpButton title={activeTab === 'capabilities' ? capabilitiesHelp.title : strategyHelp.title}>
            {activeTab === 'capabilities' ? capabilitiesHelp.content : strategyHelp.content}
          </HelpButton>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleImport}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Data</span>
          </Button>
        </div>
      </div>

      {activeTab === 'capabilities' ? (
        <CapabilityList sessionCode={sessionCode} />
      ) : (
        <StrategyList sessionCode={sessionCode} />
      )}

      <ClearDataDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        capabilityCount={capabilities.length}
        strategyCount={strategies.length}
        isFirebaseEnabled={isFirebaseEnabled}
      />
    </div>
  )
}
