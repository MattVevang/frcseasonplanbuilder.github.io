import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useCapabilities } from '../../hooks/useCapabilities'
import { useStrategies } from '../../hooks/useStrategies'
import { useCapabilityStore } from '../../stores/capabilityStore'
import { useStrategyStore } from '../../stores/strategyStore'
import { cn } from '../../utils/cn'

interface SortControlsProps {
  type: 'capability' | 'strategy'
  sessionCode: string
}

export default function SortControls({ type, sessionCode }: SortControlsProps) {
  const capabilitySortField = useCapabilityStore((state) => state.sortField)
  const capabilitySortDirection = useCapabilityStore((state) => state.sortDirection)
  const { sortByField: sortCapabilities } = useCapabilities(sessionCode)

  const strategySortField = useStrategyStore((state) => state.sortField)
  const strategySortDirection = useStrategyStore((state) => state.sortDirection)
  const { sortByField: sortStrategies } = useStrategies(sessionCode)

  const sortField = type === 'capability' ? capabilitySortField : strategySortField
  const sortDirection = type === 'capability' ? capabilitySortDirection : strategySortDirection

  const handleSort = (field: string) => {
    if (type === 'capability') {
      sortCapabilities(field as 'rank' | 'points' | 'title')
    } else {
      sortStrategies(field as 'rank' | 'expectedPoints' | 'title' | 'phase')
    }
  }

  const buttons = type === 'capability'
    ? [
        { field: 'rank', label: 'Priority' },
        { field: 'points', label: 'Points' },
        { field: 'title', label: 'Title' },
      ]
    : [
        { field: 'rank', label: 'Priority' },
        { field: 'expectedPoints', label: 'Points' },
        { field: 'phase', label: 'Phase' },
        { field: 'title', label: 'Title' },
      ]

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
      <div className="flex gap-1">
        {buttons.map((btn) => (
          <button
            key={btn.field}
            onClick={() => handleSort(btn.field)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-sm rounded-md transition-colors',
              sortField === btn.field
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            {btn.label}
            <SortIcon field={btn.field} />
          </button>
        ))}
      </div>
    </div>
  )
}
