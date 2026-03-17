import { useState, useEffect, useMemo } from 'react'
import { Plus, ThumbsUp, Trash2, Edit2, Settings, X, Check, Tag, Columns, Rows3, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { useRetro } from '../../hooks/useRetro'
import { RetroColumn, RetroItem, RETRO_COLUMN_COLORS } from '../../types/retrospective'
import RetroItemForm from './RetroItemForm'
import RetroTopicView from './RetroTopicView'
import { cn } from '../../utils/cn'

type RetroViewMode = 'column' | 'topic'

interface RetroBoardProps {
  sessionCode: string
}

const AVAILABLE_COLORS = Object.keys(RETRO_COLUMN_COLORS)

export default function RetroBoard({ sessionCode }: RetroBoardProps) {
  const {
    retroItems,
    retroColumns,
    retroTags,
    voterId,
    addItem,
    updateItem,
    deleteItem,
    toggleVote,
    addColumn,
    updateColumn,
    deleteColumn,
    addTag,
    removeTag,
    initializeDefaults,
  } = useRetro(sessionCode)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<RetroItem | null>(null)
  const [addToColumnId, setAddToColumnId] = useState<string | undefined>()
  const [viewMode, setViewMode] = useState<RetroViewMode>('column')
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnColor, setNewColumnColor] = useState('purple')
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editColumnName, setEditColumnName] = useState('')
  const [editColumnColor, setEditColumnColor] = useState('')
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)
  const [newTagInput, setNewTagInput] = useState('')
  const [activeDragItem, setActiveDragItem] = useState<RetroItem | null>(null)

  // DnD sensors
  const retroSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Collect all unique tags: combine registry + any tags on items not yet in registry
  const allTags = useMemo(() => {
    const tagSet = new Set<string>(retroTags)
    retroItems.forEach((item) => (item.tags || []).forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [retroItems, retroTags])

  // Initialize default columns on first render if none exist
  useEffect(() => {
    initializeDefaults()
  }, [initializeDefaults])

  const sortedColumns = [...retroColumns].sort((a, b) => a.order - b.order)

  const getItemsForColumn = (columnId: string) =>
    retroItems
      .filter((item) => item.columnId === columnId)
      .filter((item) => !activeTagFilter || (item.tags || []).includes(activeTagFilter))
      .sort((a, b) => b.voterIds.length - a.voterIds.length) // Most votes first

  const handleAddItem = (data: { title: string; description: string; columnId: string; tags: string[] }) => {
    addItem(data)
    setShowAddForm(false)
    setAddToColumnId(undefined)
  }

  const handleEditItem = (data: { title: string; description: string; columnId: string; tags: string[] }) => {
    if (!editingItem) return
    updateItem(editingItem.id, data)
    setEditingItem(null)
  }

  // DnD handlers for retro column view
  const handleRetroDragStart = (event: DragStartEvent) => {
    const itemId = String(event.active.id).split('::')[1]
    const item = retroItems.find((i) => i.id === itemId)
    if (item) setActiveDragItem(item)
  }

  const handleRetroDragOver = (_event: DragOverEvent) => {
    // Placeholder — closestCorners handles detection continuously
  }

  const handleRetroDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null)
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const itemId = activeId.split('::')[1] ?? ''
    const sourceColId = activeId.split('::')[0] ?? ''
    const targetColId = overId.includes('::') ? (overId.split('::')[0] ?? '') : overId

    if (!itemId || sourceColId === targetColId) return

    // Move item to new column
    updateItem(itemId, { columnId: targetColId })
  }

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return
    addColumn({ name: newColumnName.trim(), color: newColumnColor })
    setNewColumnName('')
    setNewColumnColor('purple')
  }

  const startEditColumn = (col: RetroColumn) => {
    setEditingColumnId(col.id)
    setEditColumnName(col.name)
    setEditColumnColor(col.color)
  }

  const saveEditColumn = () => {
    if (!editingColumnId || !editColumnName.trim()) return
    updateColumn(editingColumnId, { name: editColumnName.trim(), color: editColumnColor })
    setEditingColumnId(null)
  }

  const itemsInColumn = (columnId: string) => retroItems.filter((i) => i.columnId === columnId).length

  const handleAddTag = () => {
    const parts = newTagInput.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    parts.forEach((t) => addTag(t))
    setNewTagInput('')
  }

  const itemsUsingTag = (tag: string) => retroItems.filter((i) => (i.tags || []).includes(tag)).length

  if (retroColumns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-sm font-medium">Setting up your retro board...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAddToColumnId(undefined); setShowAddForm(true) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={() => setShowColumnManager(!showColumnManager)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer',
              showColumnManager
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Settings className="w-4 h-4" />
            {viewMode === 'topic' ? 'Sentiments' : 'Columns'}
          </button>
          <button
            onClick={() => setShowTagManager(!showTagManager)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer',
              showTagManager
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <Tag className="w-4 h-4" />
            {viewMode === 'topic' ? 'Topics' : 'Tags'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {retroItems.length} item{retroItems.length !== 1 ? 's' : ''}
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('column')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors cursor-pointer',
                viewMode === 'column'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              title="Column view — group by sentiment"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              onClick={() => setViewMode('topic')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors cursor-pointer',
                viewMode === 'topic'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
              title="Topic view — group by tag/subsystem"
            >
              <Rows3 className="w-4 h-4" />
              <span className="hidden sm:inline">Topics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tag Filter — column view only */}
      {viewMode === 'column' && allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setActiveTagFilter(null)}
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
              !activeTagFilter
                ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-800 border-transparent'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
            )}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                activeTagFilter === tag
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent'
                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Column Manager */}
      {showColumnManager && (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {viewMode === 'topic' ? 'Manage Sentiments' : 'Manage Columns'}
            </h4>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {viewMode === 'topic'
                ? 'These are the sentiment categories shown across the top of each topic section (e.g. What Went Well, What Could Be Better).'
                : 'These are the vertical swimlane columns items are placed into.'}
            </p>
          </div>

          {/* Existing columns */}
          <div className="space-y-2">
            {sortedColumns.map((col) => {
              const colColorCfg = RETRO_COLUMN_COLORS[col.color]
              const count = itemsInColumn(col.id)
              const isEditing = editingColumnId === col.id

              return (
                <div key={col.id} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <input
                        value={editColumnName}
                        onChange={(e) => setEditColumnName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {AVAILABLE_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setEditColumnColor(c)}
                            className={cn(
                              'w-5 h-5 rounded-full cursor-pointer',
                              RETRO_COLUMN_COLORS[c]?.dot,
                              editColumnColor === c ? 'ring-2 ring-offset-1 ring-gray-900 dark:ring-white' : ''
                            )}
                          />
                        ))}
                      </div>
                      <button onClick={saveEditColumn} className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer">
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button onClick={() => setEditingColumnId(null)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={cn('w-3 h-3 rounded-full flex-shrink-0', colColorCfg?.dot)} />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{col.name}</span>
                      <span className="text-xs text-gray-400">{count} item{count !== 1 ? 's' : ''}</span>
                      <button onClick={() => startEditColumn(col)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteColumn(col.id)}
                        disabled={count > 0}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={count > 0 ? 'Remove items from this column first' : 'Delete column'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add new column */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="New column name..."
              className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
            />
            <div className="flex gap-1">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColumnColor(c)}
                  className={cn(
                    'w-5 h-5 rounded-full cursor-pointer',
                    RETRO_COLUMN_COLORS[c]?.dot,
                    newColumnColor === c ? 'ring-2 ring-offset-1 ring-gray-900 dark:ring-white' : ''
                  )}
                />
              ))}
            </div>
            <button
              onClick={handleAddColumn}
              disabled={!newColumnName.trim()}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tag Manager */}
      {showTagManager && (
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {viewMode === 'topic' ? 'Manage Topics' : 'Manage Tags'}
            </h4>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {viewMode === 'topic'
                ? 'Topics are the subsystem sections (e.g. Drivetrain, Intake). Each topic gets its own row in the topic view.'
                : 'Tags link related items across columns. In Topic view, these become the section rows.'}
            </p>
          </div>

          {/* Existing tags */}
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const count = itemsUsingTag(tag)
                return (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    <span>#{tag}</span>
                    <span className="text-indigo-400 dark:text-indigo-500 text-[10px]">({count})</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 cursor-pointer transition-colors"
                      title={count > 0 ? `Remove #${tag} from ${count} item${count !== 1 ? 's' : ''} and delete` : `Delete #${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              {viewMode === 'topic'
                ? 'No topics yet. Add subsystem names below (e.g. drivetrain, intake, shooter).'
                : 'No tags yet. Add some below to get started.'}
            </p>
          )}

          {/* Add new tags */}
          <div className="flex items-center gap-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
            <input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder={viewMode === 'topic' ? 'New topic name...' : 'New tag name...'}
              className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              disabled={!newTagInput.trim()}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            Tip: Add multiple at once by separating with commas (e.g. "drivetrain, intake, shooter")
          </p>
        </div>
      )}

      {/* Column Board View */}
      {viewMode === 'column' && (
        <DndContext
          sensors={retroSensors}
          collisionDetection={closestCorners}
          onDragStart={handleRetroDragStart}
          onDragOver={handleRetroDragOver}
          onDragEnd={handleRetroDragEnd}
        >
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, 280px), 1fr))` }}
          >
            {sortedColumns.map((col) => {
              const colorCfg = RETRO_COLUMN_COLORS[col.color]
              const items = getItemsForColumn(col.id)

              return (
                <RetroDropColumn key={col.id} columnId={col.id} colorCfg={colorCfg}>
                  {/* Column header */}
                  <div
                    className={cn(
                      'px-3 py-2.5 rounded-t-xl border-b flex items-center justify-between',
                      `${colorCfg?.headerBg || 'bg-gray-100 dark:bg-gray-800'} ${colorCfg?.border || 'border-gray-200 dark:border-gray-700'}`
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn('w-3 h-3 rounded-full flex-shrink-0', colorCfg?.dot)} />
                      <span className={cn('text-sm font-semibold truncate', colorCfg?.text || 'text-gray-900 dark:text-white')}>
                        {col.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/40 px-1.5 py-0.5 rounded-full">
                        {items.length}
                      </span>
                      <button
                        onClick={() => { setAddToColumnId(col.id); setShowAddForm(true) }}
                        className="p-0.5 rounded hover:bg-white/60 dark:hover:bg-gray-900/40 cursor-pointer"
                        title={`Add item to ${col.name}`}
                      >
                        <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 p-2 space-y-2 min-h-[80px] max-h-[60vh] overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="flex items-center justify-center h-16 text-xs text-gray-400 dark:text-gray-500 italic">
                        Drag items here
                      </div>
                    ) : (
                      items.map((item) => (
                        <DraggableRetroCard
                          key={item.id}
                          item={item}
                          columnId={col.id}
                          voterId={voterId}
                          onVote={() => toggleVote(item.id)}
                          onEdit={() => setEditingItem(item)}
                          onDelete={() => deleteItem(item.id)}
                          onTagClick={(tag) => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                          activeTagFilter={activeTagFilter}
                        />
                      ))
                    )}
                  </div>
                </RetroDropColumn>
              )
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDragItem && (
              <div className="p-2.5 rounded-lg border border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 shadow-xl max-w-[280px] opacity-90">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activeDragItem.title}</h4>
                {activeDragItem.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{activeDragItem.description}</p>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Topic View */}
      {viewMode === 'topic' && (
        <RetroTopicView
          retroItems={retroItems}
          retroColumns={retroColumns}
          allTags={allTags}
          voterId={voterId}
          onVote={(id) => toggleVote(id)}
          onEdit={(item) => setEditingItem(item)}
          onDelete={(id) => deleteItem(id)}
          onAddItem={(colId) => { setAddToColumnId(colId); setShowAddForm(true) }}
          onMoveItem={(itemId, updates) => updateItem(itemId, updates)}
        />
      )}

      {/* Add Item Modal */}
      {showAddForm && (
        <RetroItemForm
          columns={sortedColumns}
          availableTags={allTags}
          initialColumnId={addToColumnId}
          onSubmit={handleAddItem}
          onClose={() => { setShowAddForm(false); setAddToColumnId(undefined) }}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <RetroItemForm
          columns={sortedColumns}
          availableTags={allTags}
          initialColumnId={editingItem.columnId}
          initialTitle={editingItem.title}
          initialDescription={editingItem.description}
          initialTags={editingItem.tags || []}
          onSubmit={handleEditItem}
          onClose={() => setEditingItem(null)}
          isEditing
        />
      )}
    </div>
  )
}

// ── DnD Helpers for Retro Column View ──

function RetroDropColumn({
  columnId,
  colorCfg,
  children,
}: {
  columnId: string
  colorCfg?: typeof RETRO_COLUMN_COLORS[string]
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border min-w-0 transition-colors',
        isOver
          ? 'border-primary-400 dark:border-primary-500 ring-2 ring-primary-300 dark:ring-primary-600'
          : `${colorCfg?.border || 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800/50`
      )}
    >
      {children}
    </div>
  )
}

function DraggableRetroCard({
  item,
  columnId,
  voterId,
  onVote,
  onEdit,
  onDelete,
  onTagClick,
  activeTagFilter,
}: {
  item: RetroItem
  columnId: string
  voterId: string
  onVote: () => void
  onEdit: () => void
  onDelete: () => void
  onTagClick: (tag: string) => void
  activeTagFilter: string | null
}) {
  const cardId = `${columnId}::${item.id}`
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: cardId })

  return (
    <div ref={setNodeRef} className={cn(isDragging && 'opacity-30')}>
      <div className="flex items-start gap-1">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 mt-1 cursor-grab active:cursor-grabbing touch-none rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Drag to move"
        >
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <RetroItemCard
            item={item}
            voterId={voterId}
            onVote={onVote}
            onEdit={onEdit}
            onDelete={onDelete}
            onTagClick={onTagClick}
            activeTagFilter={activeTagFilter}
          />
        </div>
      </div>
    </div>
  )
}

// ── Item Card ──

function RetroItemCard({
  item,
  voterId,
  onVote,
  onEdit,
  onDelete,
  onTagClick,
  activeTagFilter,
}: {
  item: RetroItem
  voterId: string
  onVote: () => void
  onEdit: () => void
  onDelete: () => void
  onTagClick: (tag: string) => void
  activeTagFilter: string | null
}) {
  const hasVoted = item.voterIds.includes(voterId)
  const voteCount = item.voterIds.length
  const tags = item.tags || []

  return (
    <div className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow group">
      <div className="flex items-start gap-2">
        {/* Vote button */}
        <button
          onClick={onVote}
          className={cn(
            'flex flex-col items-center gap-0.5 pt-0.5 flex-shrink-0 rounded-lg px-1.5 py-1 transition-colors cursor-pointer',
            hasVoted
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
          )}
          title={hasVoted ? 'Remove your vote' : 'Upvote this item'}
        >
          <ThumbsUp className={cn('w-4 h-4', hasVoted && 'fill-current')} />
          <span className="text-xs font-bold tabular-nums">{voteCount}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-3">
              {item.description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={cn(
                    'px-1.5 py-0 rounded-full text-[10px] font-medium border cursor-pointer transition-colors',
                    activeTagFilter === tag
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            title="Edit item"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
