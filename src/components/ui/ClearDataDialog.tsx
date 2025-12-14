import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

interface ClearDataDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: {
    clearCapabilities: boolean
    clearStrategies: boolean
    deleteSession: boolean
  }) => void
  capabilityCount: number
  strategyCount: number
  isFirebaseEnabled: boolean
}

export default function ClearDataDialog({
  isOpen,
  onClose,
  onConfirm,
  capabilityCount,
  strategyCount,
  isFirebaseEnabled,
}: ClearDataDialogProps) {
  const [clearCapabilities, setClearCapabilities] = useState(false)
  const [clearStrategies, setClearStrategies] = useState(false)
  const [deleteSession, setDeleteSession] = useState(false)

  // Reset checkboxes when dialog opens
  useEffect(() => {
    if (isOpen) {
      setClearCapabilities(false)
      setClearStrategies(false)
      setDeleteSession(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const nothingSelected = !clearCapabilities && !clearStrategies && !deleteSession
  const hasCapabilities = capabilityCount > 0
  const hasStrategies = strategyCount > 0

  const handleConfirm = () => {
    onConfirm({
      clearCapabilities,
      clearStrategies,
      deleteSession,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Clear Session Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select what to clear:
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <label
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              hasCapabilities
                ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <input
              type="checkbox"
              checked={clearCapabilities}
              onChange={(e) => setClearCapabilities(e.target.checked)}
              disabled={!hasCapabilities}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
            />
            <span className={`text-sm ${!hasCapabilities ? 'text-gray-400' : ''}`}>
              Robot Capabilities ({capabilityCount} {capabilityCount === 1 ? 'item' : 'items'})
            </span>
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              hasStrategies
                ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <input
              type="checkbox"
              checked={clearStrategies}
              onChange={(e) => setClearStrategies(e.target.checked)}
              disabled={!hasStrategies}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
            />
            <span className={`text-sm ${!hasStrategies ? 'text-gray-400' : ''}`}>
              Match Strategies ({strategyCount} {strategyCount === 1 ? 'item' : 'items'} across all game plans)
            </span>
          </label>

          {isFirebaseEnabled && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteSession}
                  onChange={(e) => setDeleteSession(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Delete entire session
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Removes this session from the server completely
                  </p>
                </div>
              </label>
            </>
          )}
        </div>

        <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          These actions cannot be undone.
        </p>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={nothingSelected}
            className="flex-1"
          >
            Clear Selected
          </Button>
        </div>
      </div>
    </div>
  )
}
