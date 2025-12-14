import { useState } from 'react'
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
import { useCapabilities } from '../../hooks/useCapabilities'
import CapabilityItem from './CapabilityItem'
import CapabilityForm from './CapabilityForm'
import SortControls from './SortControls'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import EmptyState from './EmptyState'

interface CapabilityListProps {
  sessionCode: string
}

export default function CapabilityList({ sessionCode }: CapabilityListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { capabilities, reorderCapabilities } = useCapabilities(sessionCode)

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
      reorderCapabilities(active.id as string, over.id as string)
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

  const editingCapability = editingId
    ? capabilities.find((c) => c.id === editingId)
    : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SortControls type="capability" sessionCode={sessionCode} />
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Capability
        </Button>
      </div>

      {capabilities.length === 0 ? (
        <EmptyState
          title="No capabilities yet"
          description="Start by adding your first robot capability. What should your robot be able to do?"
          actionLabel="Add First Capability"
          onAction={() => setIsFormOpen(true)}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={capabilities.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {capabilities.map((capability) => (
                <CapabilityItem
                  key={capability.id}
                  capability={capability}
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
        title={editingCapability ? 'Edit Capability' : 'Add Capability'}
      >
        <CapabilityForm
          capability={editingCapability}
          sessionCode={sessionCode}
          onClose={handleCloseForm}
        />
      </Modal>
    </div>
  )
}
