import { useCallback, useMemo } from 'react'
import { useCapabilityStore } from '../stores/capabilityStore'
import { CapabilityFormData } from '../types/capability'
import { isFirebaseConfigured } from '../services/firebase'
import * as capabilityService from '../services/capabilityService'
import toast from 'react-hot-toast'

export function useCapabilities(sessionCode: string | null) {
  const rawCapabilities = useCapabilityStore((s) => s.capabilities)
  const sortField = useCapabilityStore((s) => s.sortField)
  const sortDirection = useCapabilityStore((s) => s.sortDirection)
  const localAdd = useCapabilityStore((s) => s.addCapability)
  const localUpdate = useCapabilityStore((s) => s.updateCapability)
  const localDelete = useCapabilityStore((s) => s.deleteCapability)
  const localReorder = useCapabilityStore((s) => s.reorderCapabilities)
  const localClear = useCapabilityStore((s) => s.clearAll)
  const setCapabilities = useCapabilityStore((s) => s.setCapabilities)
  const localSortByField = useCapabilityStore((s) => s.sortByField)

  // Compute sorted capabilities - useMemo ensures re-render when dependencies change
  const capabilities = useMemo(() => {
    return [...rawCapabilities].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'rank':
          comparison = a.rank - b.rank
          break
        case 'points':
          comparison = a.points - b.points
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [rawCapabilities, sortField, sortDirection])

  const addCapability = useCallback(
    async (data: CapabilityFormData) => {
      if (sessionCode && isFirebaseConfigured()) {
        try {
          await capabilityService.addCapability(
            sessionCode,
            data,
            rawCapabilities.length + 1
          )
        } catch (error) {
          console.error('Failed to add capability to Firebase:', error)
          toast.error('Failed to save. Working offline.')
          localAdd(data)
        }
      } else {
        localAdd(data)
      }
    },
    [sessionCode, rawCapabilities.length, localAdd]
  )

  const updateCapability = useCallback(
    async (id: string, data: Partial<CapabilityFormData>) => {
      // Optimistic update
      localUpdate(id, data)

      if (sessionCode && isFirebaseConfigured()) {
        try {
          await capabilityService.updateCapability(sessionCode, id, data)
        } catch (error) {
          console.error('Failed to update capability in Firebase:', error)
          toast.error('Failed to save changes.')
        }
      }
    },
    [sessionCode, localUpdate]
  )

  const deleteCapability = useCallback(
    async (id: string) => {
      // Optimistic update
      localDelete(id)

      if (sessionCode && isFirebaseConfigured()) {
        try {
          await capabilityService.deleteCapability(sessionCode, id)
        } catch (error) {
          console.error('Failed to delete capability from Firebase:', error)
          toast.error('Failed to delete.')
        }
      }
    },
    [sessionCode, localDelete]
  )

  const reorderCapabilities = useCallback(
    async (activeId: string, overId: string) => {
      // Optimistic update
      localReorder(activeId, overId)

      if (sessionCode && isFirebaseConfigured()) {
        try {
          const reordered = useCapabilityStore.getState().capabilities
          await capabilityService.reorderCapabilities(sessionCode, reordered)
        } catch (error) {
          console.error('Failed to reorder capabilities in Firebase:', error)
        }
      }
    },
    [sessionCode, localReorder]
  )

  const clearAll = useCallback(async () => {
    localClear()

    if (sessionCode && isFirebaseConfigured()) {
      try {
        await capabilityService.clearAllCapabilities(sessionCode)
      } catch (error) {
        console.error('Failed to clear capabilities in Firebase:', error)
      }
    }
  }, [sessionCode, localClear])

  const handleSort = useCallback(
    (field: 'rank' | 'points' | 'title') => {
      // Sorting is display-only - it doesn't change the actual priority ranks
      // Only drag-and-drop reordering changes ranks and syncs to Firebase
      localSortByField(field)
    },
    [localSortByField]
  )

  return {
    capabilities,
    addCapability,
    updateCapability,
    deleteCapability,
    reorderCapabilities,
    clearAll,
    sortByField: handleSort,
    setCapabilities,
  }
}
