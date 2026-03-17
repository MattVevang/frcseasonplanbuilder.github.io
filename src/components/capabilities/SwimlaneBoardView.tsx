import { useCallback, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type CollisionDetection,
} from '@dnd-kit/core'
import { Edit2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { Capability, CapabilityCategory, Priority, PRIORITY_CONFIG, CATEGORY_COLORS } from '../../types/capability'
import { cn } from '../../utils/cn'

// Prefer card droppables (ID contains "::") over column droppables.
// Without this, closestCenter can pick the column when dragging downward,
// causing within-column reorder to silently fail.
const cardFirstCollision: CollisionDetection = (args) => {
  const collisions = closestCenter(args)
  const cardHits = collisions.filter((c) => String(c.id).includes('::'))
  return cardHits.length > 0 ? cardHits : collisions
}

interface SwimlaneBoardViewProps {
  capabilities: Capability[]
  categories: CapabilityCategory[]
  sessionCode: string
  onEdit: (id: string) => void
  addCategoryToCapability: (capabilityId: string, categoryId: string) => void
  removeCategoryFromCapability: (capabilityId: string, categoryId: string) => void
  reorderCapabilities: (activeId: string, overId: string) => void
}

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  'critical': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  'high':     { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  'medium':   { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  'low':      { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  'very-low': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
}

function SwimlaneColumn({
  columnId,
  title,
  colorConfig,
  items,
  categories,
  onEdit,
  onMoveUp,
  onMoveDown,
  isUncategorized,
}: {
  columnId: string
  title: string
  colorConfig?: typeof CATEGORY_COLORS[string]
  items: Capability[]
  categories: CapabilityCategory[]
  onEdit: (id: string) => void
  onMoveUp: (capId: string) => void
  onMoveDown: (capId: string) => void
  isUncategorized?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border transition-colors min-w-0',
        isOver
          ? 'border-primary-400 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 ring-2 ring-primary-300 dark:ring-primary-600'
          : isUncategorized
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'
            : `${colorConfig?.border || 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800/50`
      )}
    >
      <div
        className={cn(
          'px-3 py-2.5 rounded-t-xl border-b flex items-center justify-between',
          isUncategorized
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            : `${colorConfig?.headerBg || 'bg-gray-100 dark:bg-gray-800'} ${colorConfig?.border || 'border-gray-200 dark:border-gray-700'}`
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {!isUncategorized && colorConfig && (
            <span className={cn('w-3 h-3 rounded-full flex-shrink-0', colorConfig.dot)} />
          )}
          <span className={cn(
            'text-sm font-semibold truncate',
            isUncategorized
              ? 'text-gray-600 dark:text-gray-400'
              : colorConfig?.text || 'text-gray-900 dark:text-white'
          )}>
            {title}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/40 px-1.5 py-0.5 rounded-full flex-shrink-0">
          {items.length}
        </span>
      </div>

      <div className="flex-1 p-2 space-y-2 min-h-[80px] max-h-[60vh] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400 dark:text-gray-500 italic">
            {isUncategorized ? 'All items categorized' : 'Drag items here'}
          </div>
        ) : (
          items.map((cap, index) => (
            <SwimlaneCard
              key={`${columnId}::${cap.id}`}
              capability={cap}
              columnId={columnId}
              categories={categories}
              currentColumnId={columnId}
              onEdit={onEdit}
              onMoveUp={index > 0 ? () => onMoveUp(cap.id) : undefined}
              onMoveDown={index < items.length - 1 ? () => onMoveDown(cap.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}

function SwimlaneCard({
  capability,
  columnId,
  categories,
  currentColumnId,
  onEdit,
  onMoveUp,
  onMoveDown,
}: {
  capability: Capability
  columnId: string
  categories: CapabilityCategory[]
  currentColumnId: string
  onEdit: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const cardId = `${columnId}::${capability.id}`
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: cardId })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: cardId })

  const composedRef = useCallback((node: HTMLElement | null) => {
    setDragRef(node)
    setDropRef(node)
  }, [setDragRef, setDropRef])

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const priorityStyle = priorityColors[capability.priority]
  const priorityLabel = PRIORITY_CONFIG[capability.priority].label

  const otherCategories = (capability.categories || [])
    .filter((catId) => catId !== currentColumnId)
    .map((catId) => categories.find((c) => c.id === catId))
    .filter(Boolean)

  return (
    <div
      ref={composedRef}
      style={style}
      className={cn(
        'p-2 rounded-lg border bg-white dark:bg-gray-800 transition-shadow hover:shadow-md group',
        isDragging
          ? 'opacity-50 shadow-lg border-primary-300 dark:border-primary-600'
          : isOver
            ? 'ring-2 ring-primary-300 dark:ring-primary-500 border-primary-300 dark:border-primary-500 shadow-md'
            : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start gap-1">
        {/* Drag handle + reorder buttons */}
        <div className="flex flex-col items-center flex-shrink-0">
          <button
            onClick={() => onMoveUp?.()}
            disabled={!onMoveUp}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-default"
            aria-label="Move up"
          >
            <ChevronUp className="w-3 h-3 text-gray-400" />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="p-0.5 cursor-grab active:cursor-grabbing touch-none rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Drag to move"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button
            onClick={() => onMoveDown?.()}
            disabled={!onMoveDown}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-default"
            aria-label="Move down"
          >
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="flex-shrink-0 text-xs font-bold text-primary-500 dark:text-primary-400">
              #{capability.rank}
            </span>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {capability.title}
            </h4>
          </div>

          <div className="flex items-center flex-wrap gap-1 mt-1">
            <span className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
              priorityStyle.bg, priorityStyle.text
            )}>
              {priorityLabel}
            </span>
            {otherCategories.map((cat) => {
              const cfg = CATEGORY_COLORS[cat!.color]
              return (
                <span
                  key={cat!.id}
                  className={cn(
                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                    cfg?.bg, cfg?.text
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', cfg?.dot)} />
                  {cat!.name}
                </span>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => onEdit(capability.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-50 group-hover:opacity-100"
          aria-label="Edit capability"
        >
          <Edit2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        </button>
      </div>
    </div>
  )
}

function DragOverlayCard({ capability, categories }: { capability: Capability; categories: CapabilityCategory[] }) {
  const priorityStyle = priorityColors[capability.priority]
  const priorityLabel = PRIORITY_CONFIG[capability.priority].label
  const capCategories = (capability.categories || [])
    .map((catId) => categories.find((c) => c.id === catId))
    .filter(Boolean)

  return (
    <div className="p-2.5 rounded-lg border border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 shadow-xl max-w-[280px] opacity-90">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-primary-500">#{capability.rank}</span>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{capability.title}</h4>
      </div>
      <div className="flex items-center flex-wrap gap-1 mt-1.5">
        <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium', priorityStyle.bg, priorityStyle.text)}>
          {priorityLabel}
        </span>
        {capCategories.map((cat) => {
          const cfg = CATEGORY_COLORS[cat!.color]
          return (
            <span key={cat!.id} className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium', cfg?.bg, cfg?.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', cfg?.dot)} />
              {cat!.name}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function SwimlaneBoardView({
  capabilities,
  categories,
  onEdit,
  addCategoryToCapability,
  removeCategoryFromCapability,
  reorderCapabilities,
}: SwimlaneBoardViewProps) {
  const [activeCard, setActiveCard] = useState<Capability | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const uncategorized = capabilities.filter(
    (cap) => !cap.categories || cap.categories.length === 0
  ).sort((a, b) => a.rank - b.rank)

  const categoryColumns = categories.map((cat) => ({
    category: cat,
    items: capabilities
      .filter((cap) => cap.categories?.includes(cat.id))
      .sort((a, b) => a.rank - b.rank),
  }))

  // Move up/down within a column by swapping with the adjacent item
  const handleMoveInColumn = (items: Capability[], capId: string, direction: 'up' | 'down') => {
    const idx = items.findIndex((c) => c.id === capId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= items.length) return
    const swapItem = items[swapIdx]
    if (swapItem) {
      reorderCapabilities(capId, swapItem.id)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const dragId = event.active.id as string
    const capabilityId = dragId.split('::')[1]
    const cap = capabilities.find((c) => c.id === capabilityId)
    if (cap) setActiveCard(cap)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeParts = activeId.split('::')
    const sourceColumnId = activeParts[0] ?? ''
    const capabilityId = activeParts[1] ?? ''

    if (!capabilityId) return

    // Determine if we dropped on a card (has ::) or a column (no ::)
    const isOverCard = overId.includes('::')
    const targetColumnId = isOverCard ? (overId.split('::')[0] ?? '') : overId
    const targetCapId = isOverCard ? (overId.split('::')[1] ?? '') : null

    if (sourceColumnId === targetColumnId) {
      // Within-column: reorder by swapping with target card
      if (targetCapId && capabilityId !== targetCapId) {
        reorderCapabilities(capabilityId, targetCapId)
      }
      return
    }

    // Cross-column: change category
    if (sourceColumnId === 'uncategorized' && targetColumnId !== 'uncategorized') {
      addCategoryToCapability(capabilityId, targetColumnId)
    } else if (sourceColumnId !== 'uncategorized' && targetColumnId === 'uncategorized') {
      removeCategoryFromCapability(capabilityId, sourceColumnId)
    } else if (sourceColumnId !== 'uncategorized' && targetColumnId !== 'uncategorized') {
      removeCategoryFromCapability(capabilityId, sourceColumnId)
      addCategoryToCapability(capabilityId, targetColumnId)
    }
  }

  if (categories.length === 0 && capabilities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium">No categories defined yet</p>
        <p className="text-xs mt-1">
          Click the <strong>Categories</strong> button above to create categories like "Drivetrain", "Intake", "Scoring", etc.
          Then switch to board view to organize capabilities visually.
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={cardFirstCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="grid gap-3 pb-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))' }}
      >
        {/* Uncategorized column */}
        <SwimlaneColumn
          columnId="uncategorized"
          title="Uncategorized"
          items={uncategorized}
          categories={categories}
          onEdit={onEdit}
          onMoveUp={(capId) => handleMoveInColumn(uncategorized, capId, 'up')}
          onMoveDown={(capId) => handleMoveInColumn(uncategorized, capId, 'down')}
          isUncategorized
        />

        {/* Category columns */}
        {categoryColumns.map(({ category, items }) => {
          const colorConfig = CATEGORY_COLORS[category.color]
          return (
            <SwimlaneColumn
              key={category.id}
              columnId={category.id}
              title={category.name}
              colorConfig={colorConfig}
              items={items}
              categories={categories}
              onEdit={onEdit}
              onMoveUp={(capId) => handleMoveInColumn(items, capId, 'up')}
              onMoveDown={(capId) => handleMoveInColumn(items, capId, 'down')}
            />
          )
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard && <DragOverlayCard capability={activeCard} categories={categories} />}
      </DragOverlay>
    </DndContext>
  )
}
