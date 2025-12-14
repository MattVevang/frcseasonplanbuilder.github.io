import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ListChecks, Target, Download, Upload, Trash2, Wifi, WifiOff, Loader2, Clock } from 'lucide-react'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import CapabilityList from '../components/capabilities/CapabilityList'
import StrategyList from '../components/strategy/StrategyList'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useCapabilities } from '../hooks/useCapabilities'
import { useStrategies } from '../hooks/useStrategies'
import { useFirebaseSync } from '../hooks/useFirebaseSync'
import { exportData, importData } from '../utils/dataTransfer'
import toast from 'react-hot-toast'

type TabType = 'capabilities' | 'strategy'

export default function WorkspacePage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('capabilities')
  const [showClearDialog, setShowClearDialog] = useState(false)

  const { capabilities, clearAll: clearCapabilities, setCapabilities } = useCapabilities(sessionCode ?? null)
  const { strategies, clearAll: clearStrategies, setStrategies } = useStrategies(sessionCode ?? null)
  const { isConnected, isLoading, isFirebaseEnabled } = useFirebaseSync({ sessionCode: sessionCode ?? null })

  useEffect(() => {
    if (!sessionCode) {
      navigate('/')
    }
  }, [sessionCode, navigate])

  if (!sessionCode) {
    return null
  }

  if (isLoading && isFirebaseEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading session data...</p>
      </div>
    )
  }

  const handleExport = () => {
    exportData(sessionCode, capabilities, strategies)
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
        setCapabilities(result.capabilities)
        setStrategies(result.strategies)
        toast.success(`Imported ${result.capabilities.length} capabilities and ${result.strategies.length} strategies`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to import data')
      }
    }
    input.click()
  }

  const handleClearAll = async () => {
    if (activeTab === 'capabilities') {
      await clearCapabilities()
      toast.success('All capabilities cleared')
    } else {
      await clearStrategies()
      toast.success('All strategies cleared')
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

  const currentCount = activeTab === 'capabilities' ? capabilities.length : strategies.length

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
          <span>Data expires after 30 days of inactivity</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as TabType)}
        />

        <div className="flex items-center gap-2">
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
            disabled={currentCount === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        </div>
      </div>

      {activeTab === 'capabilities' ? (
        <CapabilityList sessionCode={sessionCode} />
      ) : (
        <StrategyList sessionCode={sessionCode} />
      )}

      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title={`Clear All ${activeTab === 'capabilities' ? 'Capabilities' : 'Strategies'}?`}
        message={`This will permanently delete all ${currentCount} ${activeTab === 'capabilities' ? 'capabilities' : 'strategies'}. This action cannot be undone.`}
        confirmText="Clear All"
        variant="danger"
      />
    </div>
  )
}
