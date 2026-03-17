import { useCallback, useMemo } from 'react'
import { useRetroStore } from '../stores/retroStore'
import { isFirebaseConfigured } from '../services/firebase'
import { isDemoSession } from '../utils/demoUtils'
import { getVoterId } from '../utils/voterId'
import * as retroService from '../services/retroService'
import { RetroItemFormData, RetroColumnFormData, DEFAULT_RETRO_COLUMNS } from '../types/retrospective'
import toast from 'react-hot-toast'

export function useRetro(rawSessionCode: string | null) {
  const sessionCode = rawSessionCode?.toLowerCase() ?? null
  const voterId = useMemo(() => getVoterId(), [])

  const retroItems = useRetroStore((s) => s.retroItems)
  const retroColumns = useRetroStore((s) => s.retroColumns)
  const retroTags = useRetroStore((s) => s.retroTags)
  const localAddItem = useRetroStore((s) => s.addItem)
  const localUpdateItem = useRetroStore((s) => s.updateItem)
  const localDeleteItem = useRetroStore((s) => s.deleteItem)
  const localToggleVote = useRetroStore((s) => s.toggleVote)
  const localAddColumn = useRetroStore((s) => s.addColumn)
  const localUpdateColumn = useRetroStore((s) => s.updateColumn)
  const localDeleteColumn = useRetroStore((s) => s.deleteColumn)
  const localAddTag = useRetroStore((s) => s.addTag)
  const localRemoveTag = useRetroStore((s) => s.removeTag)
  const setRetroItems = useRetroStore((s) => s.setRetroItems)
  const setRetroColumns = useRetroStore((s) => s.setRetroColumns)
  const setRetroTags = useRetroStore((s) => s.setRetroTags)
  const localClearAll = useRetroStore((s) => s.clearAll)

  const isFirebase = sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)

  // Initialize default columns if none exist
  const initializeDefaults = useCallback(async () => {
    if (retroColumns.length > 0) return
    const now = new Date()
    const defaults = DEFAULT_RETRO_COLUMNS.map((col) => ({
      ...col,
      createdAt: now,
      updatedAt: now,
    }))

    if (isFirebase) {
      try {
        for (const col of defaults) {
          await retroService.addRetroColumn(sessionCode, { name: col.name, color: col.color }, col.order)
        }
      } catch (error) {
        console.error('Failed to initialize default retro columns:', error)
        setRetroColumns(defaults)
      }
    } else {
      setRetroColumns(defaults)
    }
  }, [retroColumns.length, isFirebase, sessionCode, setRetroColumns])

  const addItem = useCallback(async (data: RetroItemFormData) => {
    if (isFirebase) {
      try {
        await retroService.addRetroItem(sessionCode, data)
      } catch (error) {
        console.error('Failed to add retro item to Firebase:', error)
        toast.error('Failed to save. Working offline.')
        localAddItem(data)
      }
    } else {
      localAddItem(data)
    }
  }, [sessionCode, isFirebase, localAddItem])

  const updateItem = useCallback(async (id: string, data: Partial<RetroItemFormData>) => {
    localUpdateItem(id, data)
    if (isFirebase) {
      try {
        await retroService.updateRetroItem(sessionCode, id, data)
      } catch (error) {
        console.error('Failed to update retro item:', error)
        toast.error('Failed to save changes.')
      }
    }
  }, [sessionCode, isFirebase, localUpdateItem])

  const deleteItem = useCallback(async (id: string) => {
    localDeleteItem(id)
    if (isFirebase) {
      try {
        await retroService.deleteRetroItem(sessionCode, id)
      } catch (error) {
        console.error('Failed to delete retro item:', error)
        toast.error('Failed to delete.')
      }
    }
  }, [sessionCode, isFirebase, localDeleteItem])

  const toggleVote = useCallback(async (itemId: string) => {
    localToggleVote(itemId, voterId)
    if (isFirebase) {
      try {
        const item = retroItems.find((i) => i.id === itemId)
        const hasVoted = item?.voterIds.includes(voterId)
        if (hasVoted) {
          await retroService.unvoteRetroItem(sessionCode, itemId, voterId)
        } else {
          await retroService.voteRetroItem(sessionCode, itemId, voterId)
        }
      } catch (error) {
        console.error('Failed to toggle vote:', error)
        // Revert optimistic update
        localToggleVote(itemId, voterId)
      }
    }
  }, [sessionCode, isFirebase, voterId, retroItems, localToggleVote])

  const addColumn = useCallback(async (data: RetroColumnFormData) => {
    if (isFirebase) {
      try {
        await retroService.addRetroColumn(sessionCode, data, retroColumns.length)
      } catch (error) {
        console.error('Failed to add retro column:', error)
        toast.error('Failed to save. Working offline.')
        localAddColumn(data)
      }
    } else {
      localAddColumn(data)
    }
  }, [sessionCode, isFirebase, retroColumns.length, localAddColumn])

  const updateColumn = useCallback(async (id: string, data: Partial<RetroColumnFormData>) => {
    localUpdateColumn(id, data)
    if (isFirebase) {
      try {
        await retroService.updateRetroColumn(sessionCode, id, data)
      } catch (error) {
        console.error('Failed to update retro column:', error)
        toast.error('Failed to save changes.')
      }
    }
  }, [sessionCode, isFirebase, localUpdateColumn])

  const deleteColumn = useCallback(async (id: string) => {
    const itemsInColumn = retroItems.filter((i) => i.columnId === id)
    if (itemsInColumn.length > 0) {
      toast.error('Cannot delete a column that still has items. Remove the items first.')
      return
    }
    localDeleteColumn(id)
    if (isFirebase) {
      try {
        await retroService.deleteRetroColumn(sessionCode, id)
      } catch (error) {
        console.error('Failed to delete retro column:', error)
        toast.error('Failed to delete.')
      }
    }
  }, [sessionCode, isFirebase, retroItems, localDeleteColumn])

  const clearAll = useCallback(async (force = false) => {
    if (!force && retroItems.length > 0) {
      toast.error('Cannot clear the retro board while it has items. Delete items individually first.')
      return
    }
    localClearAll()
    if (isFirebase) {
      try {
        await retroService.clearAllRetroItems(sessionCode)
        await retroService.clearAllRetroColumns(sessionCode)
      } catch (error) {
        console.error('Failed to clear retro data:', error)
      }
    }
  }, [sessionCode, isFirebase, retroItems.length, localClearAll])

  const addTag = useCallback((tag: string) => {
    localAddTag(tag)
  }, [localAddTag])

  const removeTag = useCallback((tag: string) => {
    localRemoveTag(tag)
  }, [localRemoveTag])

  const importRetro = useCallback(async (items: RetroItemFormData extends never ? never : any[], columns: any[], tags?: string[]) => {
    setRetroItems(items)
    setRetroColumns(columns)
    if (tags) setRetroTags(tags)
    if (isFirebase) {
      try {
        await retroService.importRetroItems(sessionCode, items)
        await retroService.importRetroColumns(sessionCode, columns)
      } catch (error) {
        console.error('Failed to import retro data:', error)
        toast.error('Failed to import retro data.')
      }
    }
  }, [sessionCode, isFirebase, setRetroItems, setRetroColumns, setRetroTags])

  return {
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
    clearAll,
    setRetroItems,
    setRetroColumns,
    setRetroTags,
    importRetro,
    initializeDefaults,
  }
}
