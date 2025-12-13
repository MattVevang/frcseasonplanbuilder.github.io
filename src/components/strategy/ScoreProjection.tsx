import { Calculator } from 'lucide-react'
import { useStrategyStore } from '../../stores/strategyStore'

export default function ScoreProjection() {
  const getProjectedScore = useStrategyStore((state) => state.getProjectedScore)
  const score = getProjectedScore()

  if (score.total === 0) {
    return null
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="font-semibold">Projected Match Score</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
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

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        * Defensive strategies are not included in the projection
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
