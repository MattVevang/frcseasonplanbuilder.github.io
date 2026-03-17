import { useState, useEffect } from 'react'
import { useCapabilities } from '../../hooks/useCapabilities'
import { Capability, Priority, PRIORITY_OPTIONS, CATEGORY_COLORS } from '../../types/capability'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import { cn } from '../../utils/cn'

interface CapabilityFormProps {
  capability?: Capability | null
  sessionCode: string
  onClose: () => void
}

export default function CapabilityForm({ capability, sessionCode, onClose }: CapabilityFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { addCapability, updateCapability, categories } = useCapabilities(sessionCode)

  useEffect(() => {
    if (capability) {
      setTitle(capability.title)
      setDescription(capability.description)
      setPriority(capability.priority)
      setSelectedCategories(capability.categories || [])
    }
  }, [capability])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
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
      priority,
      categories: selectedCategories,
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

      <Select
        label="Priority"
        id="priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        options={PRIORITY_OPTIONS}
      />

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const colorConfig = CATEGORY_COLORS[cat.color]
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                    isSelected
                      ? `${colorConfig?.bg} ${colorConfig?.text} ${colorConfig?.border} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 ring-current`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full', colorConfig?.dot || 'bg-gray-400')} />
                  {cat.name}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Select which subsystems or areas this capability relates to
          </p>
        </div>
      )}

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
