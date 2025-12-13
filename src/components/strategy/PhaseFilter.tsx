import { useStrategyStore } from '../../stores/strategyStore'
import { MatchPhase } from '../../types/strategy'
import { cn } from '../../utils/cn'

export default function PhaseFilter() {
  const phaseFilter = useStrategyStore((state) => state.phaseFilter)
  const setPhaseFilter = useStrategyStore((state) => state.setPhaseFilter)

  const filters: { value: MatchPhase | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'auto', label: 'Auto' },
    { value: 'teleop', label: 'Teleop' },
    { value: 'endgame', label: 'Endgame' },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
      <div className="flex gap-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setPhaseFilter(filter.value)}
            className={cn(
              'px-2 py-1 text-sm rounded-md transition-colors',
              phaseFilter === filter.value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
