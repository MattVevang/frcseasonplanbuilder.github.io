import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Capability, Priority, PRIORITY_CONFIG } from '../../types/capability'
import { useCapabilities } from '../../hooks/useCapabilities'
import ConfirmDialog from '../ui/ConfirmDialog'
import { cn } from '../../utils/cn'

interface CapabilityItemProps {
  capability: Capability
  sessionCode: string
  onEdit: (id: string) => void
}

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  'critical': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
  },
  'high': {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
  },
  'medium': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
  },
  'low': {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
  },
  'very-low': {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-400',
  },
}

export default function CapabilityItem({ capability, sessionCode, onEdit }: CapabilityItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { capabilities, deleteCapability, reorderCapabilities } = useCapabilities(sessionCode)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: capability.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleMoveUp = () => {
    const currentIndex = capabilities.findIndex((c) => c.id === capability.id)
    if (currentIndex > 0) {
      const prevId = capabilities[currentIndex - 1]?.id
      if (prevId) {
        reorderCapabilities(capability.id, prevId)
      }
    }
  }

  const handleMoveDown = () => {
    const currentIndex = capabilities.findIndex((c) => c.id === capability.id)
    if (currentIndex < capabilities.length - 1) {
      const nextId = capabilities[currentIndex + 1]?.id
      if (nextId) {
        reorderCapabilities(capability.id, nextId)
      }
    }
  }

  const handleDelete = async () => {
    await deleteCapability(capability.id)
    setShowDeleteDialog(false)
  }

  const currentIndex = capabilities.findIndex((c) => c.id === capability.id)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === capabilities.length - 1

  const priorityStyle = priorityColors[capability.priority]
  const priorityLabel = PRIORITY_CONFIG[capability.priority].label

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'card p-4 flex items-start gap-3',
          isDragging && 'opacity-50 shadow-lg'
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="drag-handle p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex flex-col sm:hidden">
            <button
              onClick={handleMoveUp}
              disabled={isFirst}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              aria-label="Move up"
            >
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={isLast}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              aria-label="Move down"
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {capability.rank}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {capability.title}
              </h3>
              {capability.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {capability.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold',
                  priorityStyle.bg,
                  priorityStyle.text
                )}
              >
                {priorityLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(capability.id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Edit capability"
          >
            <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Delete capability"
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Capability?"
        message={`Are you sure you want to delete "${capability.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}
