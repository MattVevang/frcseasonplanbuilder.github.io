import { useMemo, useState } from 'react'
import { ThumbsUp, Edit2, Trash2, Plus, GripVertical } from 'lucide-react'
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
  closestCorners,
} from '@dnd-kit/core'
import { RetroColumn, RetroItem, RETRO_COLUMN_COLORS } from '../../types/retrospective'
import { cn } from '../../utils/cn'

interface RetroTopicViewProps {
  retroItems: RetroItem[]
  retroColumns: RetroColumn[]
  allTags: string[]
  voterId: string
  onVote: (itemId: string) => void
  onEdit: (item: RetroItem) => void
  onDelete: (itemId: string) => void
  onAddItem: (columnId?: string) => void
  onMoveItem: (itemId: string, updates: { columnId?: string; tags?: string[] }) => void
}

interface TopicSection {
  tag: string
  columns: {
    column: RetroColumn
    items: RetroItem[]
  }[]
}

// Droppable cell: one per (tag × column) intersection
function TopicDropCell({
  droppableId,
  children,
}: {
  droppableId: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-1.5 min-h-[40px] rounded-lg p-1 transition-colors',
        isOver && 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-400/50'
      )}
    >
      {children}
    </div>
  )
}

// Draggable wrapper for topic item cards
function DraggableTopicCard({
  dragId,
  item,
  voterId,
  onVote,
  onEdit,
  onDelete,
}: {
  dragId: string
  item: RetroItem
  voterId: string
  onVote: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      className={cn(isDragging && 'opacity-30')}
    >
      <div className="p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow group">
        <div className="flex items-start gap-1.5">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-0.5 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 touch-none"
            title="Drag to move between columns"
          >
            <GripVertical className="w-3 h-3" />
          </button>

          {/* Vote */}
          <button
            onClick={onVote}
            className={cn(
              'flex items-center gap-1 flex-shrink-0 rounded px-1.5 py-0.5 transition-colors cursor-pointer text-xs',
              item.voterIds.includes(voterId)
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
            )}
            title={item.voterIds.includes(voterId) ? 'Remove your vote' : 'Upvote'}
          >
            <ThumbsUp className={cn('w-3 h-3', item.voterIds.includes(voterId) && 'fill-current')} />
            <span className="font-bold tabular-nums">{item.voterIds.length}</span>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug">
              {item.title}
            </p>
            {item.description && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" title="Edit">
              <Edit2 className="w-3 h-3 text-gray-400" />
            </button>
            <button onClick={onDelete} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer" title="Delete">
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RetroTopicView({
  retroItems,
  retroColumns,
  allTags,
  voterId,
  onVote,
  onEdit,
  onDelete,
  onAddItem,
  onMoveItem,
}: RetroTopicViewProps) {
  const [activeDragItem, setActiveDragItem] = useState<RetroItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const sortedColumns = useMemo(
    () => [...retroColumns].sort((a, b) => a.order - b.order),
    [retroColumns]
  )

  // Build topic sections: one per tag + an "Untagged" catch-all
  const sections = useMemo<TopicSection[]>(() => {
    const tagSections: TopicSection[] = allTags.map((tag) => {
      const tagItems = retroItems.filter((item) => (item.tags || []).includes(tag))
      return {
        tag,
        columns: sortedColumns.map((col) => ({
          column: col,
          items: tagItems
            .filter((item) => item.columnId === col.id)
            .sort((a, b) => b.voterIds.length - a.voterIds.length),
        })),
      }
    })

    // Untagged items
    const untaggedItems = retroItems.filter((item) => !item.tags || item.tags.length === 0)
    if (untaggedItems.length > 0) {
      tagSections.push({
        tag: '',
        columns: sortedColumns.map((col) => ({
          column: col,
          items: untaggedItems
            .filter((item) => item.columnId === col.id)
            .sort((a, b) => b.voterIds.length - a.voterIds.length),
        })),
      })
    }

    return tagSections
  }, [retroItems, allTags, sortedColumns])

  // Use @@ as tag separator since :: is used for column::item
  // Droppable ID format: "tag@@columnId"  (or "__untagged__@@columnId")
  // Draggable ID format: "tag@@columnId::itemId"
  const encodeTag = (tag: string) => tag || '__untagged__'

  const handleDragStart = (event: DragStartEvent) => {
    // Format: "tag@@columnId::itemId"
    const parts = String(event.active.id).split('::')
    const itemId = parts[1]
    const item = retroItems.find((i) => i.id === itemId)
    if (item) setActiveDragItem(item)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null)
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Parse active: "sourceTag@@sourceColId::itemId"
    const [activeTagCol, itemId] = activeId.split('::')
    const [sourceTag, sourceColId] = (activeTagCol ?? '').split('@@')
    if (!itemId) return

    // Parse over: could be droppable "targetTag@@targetColId" or another card "targetTag@@targetColId::otherId"
    const overTagCol = overId.includes('::') ? overId.split('::')[0] : overId
    const [targetTag, targetColId] = (overTagCol ?? '').split('@@')

    if (!targetColId) return

    const colChanged = sourceColId !== targetColId
    const tagChanged = sourceTag !== targetTag
    if (!colChanged && !tagChanged) return

    // Build update payload
    const updates: { columnId?: string; tags?: string[] } = {}
    if (colChanged) updates.columnId = targetColId

    if (tagChanged) {
      const item = retroItems.find((i) => i.id === itemId)
      if (item) {
        const currentTags = [...(item.tags || [])]
        const realSourceTag = sourceTag === '__untagged__' ? '' : sourceTag
        const realTargetTag = targetTag === '__untagged__' ? '' : targetTag

        // Remove old tag, add new tag
        const filtered = realSourceTag
          ? currentTags.filter((t) => t !== realSourceTag)
          : currentTags
        if (realTargetTag && !filtered.includes(realTargetTag)) {
          filtered.push(realTargetTag)
        }
        updates.tags = filtered
      }
    }

    onMoveItem(itemId, updates)
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium">No items yet. Add some to see them grouped by topic.</p>
        <button
          onClick={() => onAddItem()}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1">
        {/* Column headers — sticky across all sections */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `160px repeat(${sortedColumns.length}, 1fr)` }}
        >
          <div /> {/* spacer for topic label */}
          {sortedColumns.map((col) => {
            const colorCfg = RETRO_COLUMN_COLORS[col.color]
            return (
              <div
                key={col.id}
                className={cn(
                  'px-3 py-2 rounded-lg text-center',
                  colorCfg?.headerBg || 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                <span className={cn('text-sm font-semibold', colorCfg?.text || 'text-gray-900 dark:text-white')}>
                  {col.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Topic sections */}
        {sections.map((section) => {
          return (
            <div
              key={section.tag || '__untagged__'}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <div
                className="grid gap-4 p-3"
                style={{ gridTemplateColumns: `160px repeat(${sortedColumns.length}, 1fr)` }}
              >
                {/* Topic label */}
                <div className="flex items-start">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize pt-1">
                    {section.tag || 'Untagged'}
                  </h3>
                </div>

                {/* Column cells — each is a droppable target */}
                {section.columns.map(({ column, items }) => (
                  <TopicDropCell
                    key={column.id}
                    droppableId={`${encodeTag(section.tag)}@@${column.id}`}
                  >
                    {items.map((item) => (
                      <DraggableTopicCard
                        key={item.id}
                        dragId={`${encodeTag(section.tag)}@@${column.id}::${item.id}`}
                        item={item}
                        voterId={voterId}
                        onVote={() => onVote(item.id)}
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item.id)}
                      />
                    ))}
                  </TopicDropCell>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Drag overlay — portaled outside the DOM tree */}
      <DragOverlay>
        {activeDragItem ? (
          <div className="p-2 rounded-lg border border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 shadow-lg opacity-90 max-w-[250px]">
            <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug">
              {activeDragItem.title}
            </p>
            {activeDragItem.description && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {activeDragItem.description}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
