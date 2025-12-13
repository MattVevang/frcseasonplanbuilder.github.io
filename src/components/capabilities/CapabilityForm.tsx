import { useState, useEffect } from 'react'
import { useCapabilities } from '../../hooks/useCapabilities'
import { Capability } from '../../types/capability'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

interface CapabilityFormProps {
  capability?: Capability | null
  sessionCode: string
  onClose: () => void
}

export default function CapabilityForm({ capability, sessionCode, onClose }: CapabilityFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { addCapability, updateCapability } = useCapabilities(sessionCode)

  useEffect(() => {
    if (capability) {
      setTitle(capability.title)
      setDescription(capability.description)
      setPoints(capability.points.toString())
    }
  }, [capability])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    const pointsNum = parseFloat(points)
    if (isNaN(pointsNum)) {
      newErrors.points = 'Points must be a number'
    } else if (pointsNum < 0) {
      newErrors.points = 'Points cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data = {
      title: title.trim(),
      description: description.trim(),
      points: parseFloat(points) || 0,
    }

    if (capability) {
      await updateCapability(capability.id, data)
    } else {
      await addCapability(data)
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Floor Intake"
        error={errors.title}
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe this capability in detail..."
        rows={3}
        error={errors.description}
      />

      <Input
        label="Points"
        id="points"
        type="number"
        step="0.5"
        min="0"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        placeholder="e.g., 5"
        error={errors.points}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {capability ? 'Update' : 'Add'} Capability
        </Button>
      </div>
    </form>
  )
}
