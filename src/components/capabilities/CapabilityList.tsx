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
import { Plus, List, LayoutGrid, Tags } from 'lucide-react'
import { useCapabilities } from '../../hooks/useCapabilities'
import CapabilityItem from './CapabilityItem'
import CapabilityForm from './CapabilityForm'
import CategoryManager from './CategoryManager'
import SwimlaneBoardView from './SwimlaneBoardView'
import SortControls from './SortControls'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import EmptyState from './EmptyState'
import { cn } from '../../utils/cn'

interface CapabilityListProps {
  sessionCode: string
}

export default function CapabilityList({ sessionCode }: CapabilityListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  const {
    capabilities,
    categories,
    viewMode,
    reorderCapabilities,
    addCategoryToCapability,
    removeCategoryFromCapability,
    setViewMode,
  } = useCapabilities(sessionCode)

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
        <div className="flex items-center gap-3">
          {viewMode === 'list' && (
            <SortControls type="capability" sessionCode={sessionCode} />
          )}
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors',
                viewMode === 'board'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              aria-label="Board view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Tags className="w-4 h-4" />
            <span className="hidden sm:inline">Categories</span>
            {categories.length > 0 && (
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {categories.length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Capability
          </Button>
        </div>
      </div>

      {capabilities.length === 0 ? (
        <EmptyState
          title="No capabilities yet"
          description="Start by adding your first robot capability. What should your robot be able to do?"
          actionLabel="Add First Capability"
          onAction={() => setIsFormOpen(true)}
        />
      ) : viewMode === 'board' ? (
        <SwimlaneBoardView
          capabilities={capabilities}
          categories={categories}
          sessionCode={sessionCode}
          onEdit={handleEdit}
          addCategoryToCapability={addCategoryToCapability}
          removeCategoryFromCapability={removeCategoryFromCapability}
          reorderCapabilities={reorderCapabilities}
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

      <Modal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        title="Manage Categories"
      >
        <CategoryManager sessionCode={sessionCode} />
      </Modal>
    </div>
  )
}
