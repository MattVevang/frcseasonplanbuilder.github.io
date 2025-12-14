import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useStrategies } from '../../hooks/useStrategies'
import { useGamePlans } from '../../hooks/useGamePlans'
import { useStrategyStore } from '../../stores/strategyStore'
import StrategyItem from './StrategyItem'
import StrategyForm from './StrategyForm'
import SortControls from '../capabilities/SortControls'
import PhaseFilter from './PhaseFilter'
import ScoreProjection from './ScoreProjection'
import GamePlanSelector from './GamePlanSelector'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import EmptyState from '../capabilities/EmptyState'

interface StrategyListProps {
  sessionCode: string
}

export default function StrategyList({ sessionCode }: StrategyListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { strategies, reorderStrategies } = useStrategies(sessionCode)
  const { ensureDefaultGamePlan, selectedGamePlan } = useGamePlans(sessionCode)
  const phaseFilter = useStrategyStore((state) => state.phaseFilter)

  // Ensure at least one game plan exists
  useEffect(() => {
    ensureDefaultGamePlan()
  }, [ensureDefaultGamePlan])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderStrategies(active.id as string, over.id as string)
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const filteredStrategies =
    phaseFilter === 'all'
      ? strategies
      : strategies.filter((s) => s.phase === phaseFilter)

  const editingStrategy = editingId
    ? strategies.find((s) => s.id === editingId)
    : null

  return (
    <div className="space-y-4">
      <GamePlanSelector sessionCode={sessionCode} />
      <ScoreProjection />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SortControls type="strategy" sessionCode={sessionCode} />
          <PhaseFilter />
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
          disabled={!selectedGamePlan}
        >
          <Plus className="w-4 h-4" />
          Add Strategy
        </Button>
      </div>

      {strategies.length === 0 ? (
        <EmptyState
          title="No strategies yet"
          description="Plan your match execution by adding strategies for Auto, Teleop, and Endgame phases."
          actionLabel="Add First Strategy"
          onAction={() => setIsFormOpen(true)}
        />
      ) : filteredStrategies.length === 0 ? (
        <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
          No strategies found for this phase filter.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredStrategies.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredStrategies.map((strategy) => (
                <StrategyItem
                  key={strategy.id}
                  strategy={strategy}
                  sessionCode={sessionCode}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingStrategy ? 'Edit Strategy' : 'Add Strategy'}
        size="lg"
      >
        <StrategyForm
          strategy={editingStrategy}
          sessionCode={sessionCode}
          onClose={handleCloseForm}
        />
      </Modal>
    </div>
  )
}
