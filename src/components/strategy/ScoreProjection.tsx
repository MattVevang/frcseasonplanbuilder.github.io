import { Calculator, Clock } from 'lucide-react'
import { useStrategyStore } from '../../stores/strategyStore'

export default function ScoreProjection() {
  const getProjectedScore = useStrategyStore((state) => state.getProjectedScore)
  const getTimeBudget = useStrategyStore((state) => state.getTimeBudget)
  const score = getProjectedScore()
  const timeBudget = getTimeBudget()

  const hasScore = score.total > 0
  const hasTime = timeBudget.total.used > 0

  if (!hasScore && !hasTime) {
    return null
  }

  return (
    <div className="card p-4 space-y-4">
      {/* Score Projection */}
      {hasScore && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold">Projected Score</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <ScoreBlock
              label="Auto"
              value={score.auto}
              color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            />
            <ScoreBlock
              label="Teleop"
              value={score.teleop}
              color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            />
            <ScoreBlock
              label="Endgame"
              value={score.endgame}
              color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            />
            <ScoreBlock
              label="Total"
              value={score.total}
              color="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
              isTotal
            />
          </div>
        </div>
      )}

      {/* Time Budget */}
      {hasTime && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold">Time Budget</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <TimeBlock
              label="Auto"
              used={timeBudget.auto.used}
              available={timeBudget.auto.available}
              color="green"
            />
            <TimeBlock
              label="Teleop"
              used={timeBudget.teleop.used}
              available={timeBudget.teleop.available}
              color="blue"
            />
            <TimeBlock
              label="Endgame"
              used={timeBudget.endgame.used}
              available={timeBudget.endgame.available}
              color="purple"
            />
            <TimeBlock
              label="Total"
              used={timeBudget.total.used}
              available={timeBudget.total.available}
              color="primary"
              isTotal
            />
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        * Defensive strategies excluded from score. Time based on cycle time × cycles.
      </p>
    </div>
  )
}

interface ScoreBlockProps {
  label: string
  value: number
  color: string
  isTotal?: boolean
}

function ScoreBlock({ label, value, color, isTotal }: ScoreBlockProps) {
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className={`font-bold ${isTotal ? 'text-2xl' : 'text-xl'}`}>
        {value}
      </p>
    </div>
  )
}

interface TimeBlockProps {
  label: string
  used: number
  available: number
  color: 'green' | 'blue' | 'purple' | 'primary'
  isTotal?: boolean
}

function TimeBlock({ label, used, available, color, isTotal }: TimeBlockProps) {
  const remaining = available - used
  const percentUsed = Math.min((used / available) * 100, 100)
  const isOver = used > available

  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    primary: 'bg-primary-100 dark:bg-primary-900/30',
  }

  const textColorClasses = {
    green: 'text-green-700 dark:text-green-300',
    blue: 'text-blue-700 dark:text-blue-300',
    purple: 'text-purple-700 dark:text-purple-300',
    primary: 'text-primary-700 dark:text-primary-300',
  }

  const barColorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    primary: 'bg-primary-500',
  }

  return (
    <div className={`rounded-lg p-3 text-center ${colorClasses[color]} ${textColorClasses[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className={`font-bold ${isTotal ? 'text-lg' : 'text-base'}`}>
        {used}s <span className="font-normal opacity-70">/ {available}s</span>
      </p>
      {/* Progress bar */}
      <div className="mt-1.5 h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : barColorClasses[color]}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      <p className={`text-xs mt-1 ${isOver ? 'text-red-600 dark:text-red-400 font-medium' : 'opacity-70'}`}>
        {isOver ? `${Math.abs(remaining)}s over` : `${remaining}s left`}
      </p>
    </div>
  )
}
