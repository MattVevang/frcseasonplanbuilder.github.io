import { useMemo } from 'react'
import { ThumbsUp, Edit2, Trash2, Plus } from 'lucide-react'
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
}

interface TopicSection {
  tag: string
  columns: {
    column: RetroColumn
    items: RetroItem[]
  }[]
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
}: RetroTopicViewProps) {
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
        const hasAnyItems = section.columns.some((c) => c.items.length > 0)
        if (!hasAnyItems) return null

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

              {/* Column items */}
              {section.columns.map(({ column, items }) => (
                <div key={column.id} className="space-y-1.5 min-h-[40px]">
                  {items.map((item) => (
                    <TopicItemCard
                      key={item.id}
                      item={item}
                      voterId={voterId}
                      onVote={() => onVote(item.id)}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Compact card for topic view — no tags shown (the section IS the tag)
function TopicItemCard({
  item,
  voterId,
  onVote,
  onEdit,
  onDelete,
}: {
  item: RetroItem
  voterId: string
  onVote: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const hasVoted = item.voterIds.includes(voterId)
  const voteCount = item.voterIds.length

  return (
    <div className="p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow group">
      <div className="flex items-start gap-1.5">
        {/* Vote */}
        <button
          onClick={onVote}
          className={cn(
            'flex items-center gap-1 flex-shrink-0 rounded px-1.5 py-0.5 transition-colors cursor-pointer text-xs',
            hasVoted
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
          )}
          title={hasVoted ? 'Remove your vote' : 'Upvote'}
        >
          <ThumbsUp className={cn('w-3 h-3', hasVoted && 'fill-current')} />
          <span className="font-bold tabular-nums">{voteCount}</span>
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
  )
}
