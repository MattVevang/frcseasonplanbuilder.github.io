import { useState, useEffect } from 'react'
import { useStrategies } from '../../hooks/useStrategies'
import { Strategy, MatchPhase } from '../../types/strategy'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'

interface StrategyFormProps {
  strategy?: Strategy | null
  sessionCode: string
  onClose: () => void
}

export default function StrategyForm({ strategy, sessionCode, onClose }: StrategyFormProps) {
  const [phase, setPhase] = useState<MatchPhase>('teleop')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expectedPoints, setExpectedPoints] = useState('')
  const [cycleTime, setCycleTime] = useState('')
  const [cyclesPerMatch, setCyclesPerMatch] = useState('')
  const [isDefensive, setIsDefensive] = useState(false)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { addStrategy, updateStrategy } = useStrategies(sessionCode)

  useEffect(() => {
    if (strategy) {
      setPhase(strategy.phase)
      setTitle(strategy.title)
      setDescription(strategy.description)
      setExpectedPoints(strategy.expectedPoints.toString())
      setCycleTime(strategy.cycleTime?.toString() || '')
      setCyclesPerMatch(strategy.cyclesPerMatch?.toString() || '')
      setIsDefensive(strategy.isDefensive)
      setNotes(strategy.notes)
    }
  }, [strategy])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    const pointsNum = parseFloat(expectedPoints)
    if (isNaN(pointsNum)) {
      newErrors.expectedPoints = 'Points must be a number'
    } else if (pointsNum < 0) {
      newErrors.expectedPoints = 'Points cannot be negative'
    }

    if (cycleTime) {
      const cycleTimeNum = parseFloat(cycleTime)
      if (isNaN(cycleTimeNum) || cycleTimeNum <= 0) {
        newErrors.cycleTime = 'Cycle time must be a positive number'
      }
    }

    if (cyclesPerMatch) {
      const cyclesNum = parseInt(cyclesPerMatch)
      if (isNaN(cyclesNum) || cyclesNum <= 0) {
        newErrors.cyclesPerMatch = 'Cycles must be a positive whole number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data = {
      phase,
      title: title.trim(),
      description: description.trim(),
      expectedPoints: parseFloat(expectedPoints) || 0,
      cycleTime: cycleTime ? parseFloat(cycleTime) : undefined,
      cyclesPerMatch: cyclesPerMatch ? parseInt(cyclesPerMatch) : undefined,
      isDefensive,
      notes: notes.trim(),
    }

    if (strategy) {
      await updateStrategy(strategy.id, data)
    } else {
      await addStrategy(data)
    }

    onClose()
  }

  const phaseOptions = [
    { value: 'auto', label: 'Autonomous (15s)' },
    { value: 'teleop', label: 'Teleop (2:15)' },
    { value: 'endgame', label: 'Endgame (20s)' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Match Phase"
          id="phase"
          value={phase}
          onChange={(e) => setPhase(e.target.value as MatchPhase)}
          options={phaseOptions}
        />

        <Input
          label="Expected Points"
          id="expectedPoints"
          type="number"
          step="0.5"
          min="0"
          value={expectedPoints}
          onChange={(e) => setExpectedPoints(e.target.value)}
          placeholder="e.g., 5"
          error={errors.expectedPoints}
        />
      </div>

      <Input
        label="Strategy Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Score 2 game pieces in auto"
        error={errors.title}
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the execution details..."
        rows={2}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Cycle Time (seconds)"
          id="cycleTime"
          type="number"
          step="0.5"
          min="0"
          value={cycleTime}
          onChange={(e) => setCycleTime(e.target.value)}
          placeholder="e.g., 8"
          error={errors.cycleTime}
        />

        <Input
          label="Cycles per Phase"
          id="cyclesPerMatch"
          type="number"
          min="1"
          value={cyclesPerMatch}
          onChange={(e) => setCyclesPerMatch(e.target.value)}
          placeholder="e.g., 10"
          error={errors.cyclesPerMatch}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefensive"
          checked={isDefensive}
          onChange={(e) => setIsDefensive(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="isDefensive" className="text-sm text-gray-700 dark:text-gray-300">
          This is a defensive strategy (won't count toward score projection)
        </label>
      </div>

      <Textarea
        label="Notes (optional)"
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Conditions, contingencies, fallback plans..."
        rows={2}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {strategy ? 'Update' : 'Add'} Strategy
        </Button>
      </div>
    </form>
  )
}
