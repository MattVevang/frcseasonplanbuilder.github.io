import { useState } from 'react'
import { Edit2, Trash2, Plus, X } from 'lucide-react'
import { CapabilityCategory, CATEGORY_COLORS } from '../../types/capability'
import { useCapabilities } from '../../hooks/useCapabilities'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ConfirmDialog from '../ui/ConfirmDialog'
import { cn } from '../../utils/cn'

interface CategoryManagerProps {
  sessionCode: string
}

const colorOptions = Object.entries(CATEGORY_COLORS)

export default function CategoryManager({ sessionCode }: CategoryManagerProps) {
  const { categories, capabilities, addCategory, updateCategory, deleteCategory } = useCapabilities(sessionCode)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('blue')
  const [deleteTarget, setDeleteTarget] = useState<CapabilityCategory | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setName('')
    setColor('blue')
    setErrors({})
    setIsAdding(false)
    setEditingId(null)
  }

  const startEditing = (cat: CapabilityCategory) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color)
    setIsAdding(false)
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    // Check for duplicate names (excluding current editing item)
    const duplicate = categories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingId
    )
    if (duplicate) {
      newErrors.name = 'A category with this name already exists'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    addCategory(name.trim(), color)
    resetForm()
  }

  const handleUpdate = () => {
    if (!editingId || !validate()) return
    updateCategory(editingId, { name: name.trim(), color })
    resetForm()
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCategory(deleteTarget.id)
    setDeleteTarget(null)
  }

  const getUsageCount = (categoryId: string) => {
    return capabilities.filter((cap) => cap.categories?.includes(categoryId)).length
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Define categories (subsystems) to organize your robot capabilities. Each capability can belong to multiple categories.
      </p>

      {/* Category list */}
      {categories.length > 0 ? (
        <div className="space-y-2">
          {categories.map((cat) => {
            const colorConfig = CATEGORY_COLORS[cat.color]
            const usageCount = getUsageCount(cat.id)
            const isEditing = editingId === cat.id

            if (isEditing) {
              return (
                <div key={cat.id} className="p-3 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10 space-y-3">
                  <Input
                    label="Name"
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    autoFocus
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(([key, cfg]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setColor(key)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all',
                            cfg.dot,
                            color === key
                              ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-400'
                              : 'border-transparent hover:scale-110'
                          )}
                          aria-label={cfg.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={resetForm}>Cancel</Button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('w-4 h-4 rounded-full', colorConfig?.dot || 'bg-gray-400')} />
                  <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({usageCount} {usageCount === 1 ? 'capability' : 'capabilities'})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditing(cat)}
                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No categories defined yet.</p>
          <p className="text-xs mt-1">Add categories like "Drivetrain", "Intake", "Scoring", etc.</p>
        </div>
      )}

      {/* Add form */}
      {isAdding ? (
        <div className="p-3 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10 space-y-3">
          <Input
            label="Name"
            id="new-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Drivetrain"
            error={errors.name}
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    cfg.dot,
                    color === key
                      ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-400'
                      : 'border-transparent hover:scale-110'
                  )}
                  aria-label={cfg.label}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
            <Button size="sm" variant="secondary" onClick={resetForm} className="flex items-center gap-1">
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => { resetForm(); setIsAdding(true) }}
          className="flex items-center gap-1.5 w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? ${getUsageCount(deleteTarget.id)} capabilities will be untagged from this category. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
