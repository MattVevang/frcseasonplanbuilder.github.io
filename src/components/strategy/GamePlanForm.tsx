import { useState } from 'react'
import { GamePlan } from '../../types/strategy'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface GamePlanFormProps {
  gamePlan: GamePlan | null
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  onCancel: () => void
}

export default function GamePlanForm({ gamePlan, onSubmit, onCancel }: GamePlanFormProps) {
  const [name, setName] = useState(gamePlan?.name || '')
  const [description, setDescription] = useState(gamePlan?.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Plan name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      })
    } catch {
      setError('Failed to save game plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Plan Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Aggressive Scoring, Defensive Focus"
        required
      />

      <Textarea
        label="Description (optional)"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of this game plan's strategy..."
        rows={3}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : gamePlan ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
