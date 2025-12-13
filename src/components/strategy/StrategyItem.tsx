import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Shield,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { Strategy, MatchPhase } from '../../types/strategy'
import { useStrategies } from '../../hooks/useStrategies'
import ConfirmDialog from '../ui/ConfirmDialog'
import { cn } from '../../utils/cn'

interface StrategyItemProps {
  strategy: Strategy
  sessionCode: string
  onEdit: (id: string) => void
}

const phaseColors: Record<MatchPhase, { bg: string; text: string; label: string }> = {
  auto: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    label: 'Auto',
  },
  teleop: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'Teleop',
  },
  endgame: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Endgame',
  },
}

export default function StrategyItem({ strategy, sessionCode, onEdit }: StrategyItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { strategies, deleteStrategy, reorderStrategies } = useStrategies(sessionCode)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: strategy.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleMoveUp = () => {
    const currentIndex = strategies.findIndex((s) => s.id === strategy.id)
    if (currentIndex > 0) {
      const prevId = strategies[currentIndex - 1]?.id
      if (prevId) {
        reorderStrategies(strategy.id, prevId)
      }
    }
  }

  const handleMoveDown = () => {
    const currentIndex = strategies.findIndex((s) => s.id === strategy.id)
    if (currentIndex < strategies.length - 1) {
      const nextId = strategies[currentIndex + 1]?.id
      if (nextId) {
        reorderStrategies(strategy.id, nextId)
      }
    }
  }

  const handleDelete = async () => {
    await deleteStrategy(strategy.id)
    setShowDeleteDialog(false)
  }

  const currentIndex = strategies.findIndex((s) => s.id === strategy.id)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === strategies.length - 1

  const phaseStyle = phaseColors[strategy.phase]
  const totalPoints = strategy.cyclesPerMatch
    ? strategy.expectedPoints * strategy.cyclesPerMatch
    : strategy.expectedPoints

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
            {strategy.rank}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                phaseStyle.bg,
                phaseStyle.text
              )}
            >
              {phaseStyle.label}
            </span>
            {strategy.isDefensive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                <Shield className="w-3 h-3" />
                Defense
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white">
            {strategy.title}
          </h3>

          {strategy.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {strategy.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            {strategy.cycleTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {strategy.cycleTime}s/cycle
              </span>
            )}
            {strategy.cyclesPerMatch && (
              <span className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                {strategy.cyclesPerMatch} cycles
              </span>
            )}
          </div>

          {strategy.notes && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
              {strategy.notes}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {totalPoints} pts
          </span>
          {strategy.cyclesPerMatch && strategy.cyclesPerMatch > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              ({strategy.expectedPoints} × {strategy.cyclesPerMatch})
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(strategy.id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Edit strategy"
          >
            <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Delete strategy"
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Strategy?"
        message={`Are you sure you want to delete "${strategy.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  )
}
