import { useState } from 'react'
import { X } from 'lucide-react'
import { RetroColumn, RETRO_COLUMN_COLORS } from '../../types/retrospective'
import { cn } from '../../utils/cn'

interface RetroItemFormProps {
  columns: RetroColumn[]
  availableTags: string[]
  initialColumnId?: string
  initialTitle?: string
  initialDescription?: string
  initialTags?: string[]
  onSubmit: (data: { title: string; description: string; columnId: string; tags: string[] }) => void
  onClose: () => void
  isEditing?: boolean
}

export default function RetroItemForm({
  columns,
  availableTags,
  initialColumnId,
  initialTitle = '',
  initialDescription = '',
  initialTags = [],
  onSubmit,
  onClose,
  isEditing = false,
}: RetroItemFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [columnId, setColumnId] = useState(initialColumnId || columns[0]?.id || '')
  const [tags, setTags] = useState<string[]>(initialTags)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description: description.trim(), columnId, tags })
  }

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Item' : 'Add Retro Item'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Column
            </label>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => {
                const colorCfg = RETRO_COLUMN_COLORS[col.color]
                const isSelected = columnId === col.id
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setColumnId(col.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all cursor-pointer',
                      isSelected
                        ? `${colorCfg?.bg} ${colorCfg?.text} ${colorCfg?.border} ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    )}
                  >
                    <span className={cn('w-2.5 h-2.5 rounded-full', colorCfg?.dot)} />
                    {col.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="retro-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="retro-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="retro-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="retro-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="More details (optional)..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags <span className="text-xs font-normal text-gray-400">(click to toggle)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer',
                        isSelected
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent ring-1 ring-indigo-300 dark:ring-indigo-700'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                      )}
                    >
                      #{tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !columnId}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
