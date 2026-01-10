import { useMemo } from 'react'
import { useStrategyStore } from '../../stores/strategyStore'
import { MatchPhase } from '../../types/strategy'
import { getMatchPhases } from '../../config/matchTiming'
import { getSessionSeasonVersion } from '../../utils/demoUtils'
import { cn } from '../../utils/cn'

interface PhaseFilterProps {
  sessionCode: string
}

export default function PhaseFilter({ sessionCode }: PhaseFilterProps) {
  const phaseFilter = useStrategyStore((state) => state.phaseFilter)
  const setPhaseFilter = useStrategyStore((state) => state.setPhaseFilter)
  const seasonVersion = getSessionSeasonVersion(sessionCode)
  const phases = getMatchPhases(seasonVersion)

  const filters = useMemo(() => {
    const baseFilters: { value: MatchPhase | 'all'; label: string }[] = [
      { value: 'all', label: 'All' },
      { value: 'auto', label: 'Auto' },
      { value: 'teleop', label: 'Teleop' },
    ]

    // Only include endgame filter if the season has an endgame phase
    if (phases.endgame.duration > 0) {
      baseFilters.push({ value: 'endgame', label: 'Endgame' })
    }

    return baseFilters
  }, [phases.endgame.duration])

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
