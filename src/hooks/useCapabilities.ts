import { useCallback, useMemo } from 'react'
import { useCapabilityStore } from '../stores/capabilityStore'
import { Capability, CapabilityFormData, SortField, PRIORITY_CONFIG } from '../types/capability'
import { isFirebaseConfigured } from '../services/firebase'
import { isDemoSession } from '../utils/demoUtils'
import * as capabilityService from '../services/capabilityService'
import toast from 'react-hot-toast'

export function useCapabilities(rawSessionCode: string | null) {
  const sessionCode = rawSessionCode?.toLowerCase() ?? null

  const rawCapabilities = useCapabilityStore((s) => s.capabilities)
  const categories = useCapabilityStore((s) => s.categories)
  const viewMode = useCapabilityStore((s) => s.viewMode)
  const sortField = useCapabilityStore((s) => s.sortField)
  const sortDirection = useCapabilityStore((s) => s.sortDirection)
  const localAdd = useCapabilityStore((s) => s.addCapability)
  const localUpdate = useCapabilityStore((s) => s.updateCapability)
  const localDelete = useCapabilityStore((s) => s.deleteCapability)
  const localReorder = useCapabilityStore((s) => s.reorderCapabilities)
  const localClear = useCapabilityStore((s) => s.clearAll)
  const setCapabilities = useCapabilityStore((s) => s.setCapabilities)
  const localSortByField = useCapabilityStore((s) => s.sortByField)

  const localAddCategory = useCapabilityStore((s) => s.addCategory)
  const localUpdateCategory = useCapabilityStore((s) => s.updateCategory)
  const localDeleteCategory = useCapabilityStore((s) => s.deleteCategory)
  const setCategories = useCapabilityStore((s) => s.setCategories)
  const localAddCategoryToCap = useCapabilityStore((s) => s.addCategoryToCapability)
  const localRemoveCategoryFromCap = useCapabilityStore((s) => s.removeCategoryFromCapability)
  const setViewMode = useCapabilityStore((s) => s.setViewMode)

  const capabilities = useMemo(() => {
    return [...rawCapabilities].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'rank':
          comparison = a.rank - b.rank
          break
        case 'priority':
          comparison = PRIORITY_CONFIG[a.priority].weight - PRIORITY_CONFIG[b.priority].weight
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
      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
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
      localUpdate(id, data)

      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
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
      localDelete(id)

      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
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
      localReorder(activeId, overId)

      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
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

    if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
      try {
        await capabilityService.clearAllCapabilities(sessionCode)
      } catch (error) {
        console.error('Failed to clear capabilities in Firebase:', error)
      }
    }
  }, [sessionCode, localClear])

  const handleSort = useCallback(
    (field: SortField) => {
      localSortByField(field)
    },
    [localSortByField]
  )

  const importCapabilities = useCallback(
    async (caps: Capability[]) => {
      setCapabilities(caps)

      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          await capabilityService.importCapabilities(sessionCode, caps)
        } catch (error) {
          console.error('Failed to import capabilities to Firebase:', error)
          toast.error('Failed to sync imported data to server.')
        }
      }
    },
    [sessionCode, setCapabilities]
  )

  // Category CRUD (local-only for now; Firebase sync can be added later)
  const addCategory = useCallback(
    (name: string, color: string) => { localAddCategory(name, color) },
    [localAddCategory]
  )

  const updateCategory = useCallback(
    (id: string, data: { name?: string; color?: string }) => { localUpdateCategory(id, data) },
    [localUpdateCategory]
  )

  const deleteCategory = useCallback(
    (id: string) => { localDeleteCategory(id) },
    [localDeleteCategory]
  )

  // Category assignment on capabilities (syncs capability change to Firebase)
  const addCategoryToCapability = useCallback(
    async (capabilityId: string, categoryId: string) => {
      localAddCategoryToCap(capabilityId, categoryId)
      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          const cap = useCapabilityStore.getState().capabilities.find(c => c.id === capabilityId)
          if (cap) {
            await capabilityService.updateCapability(sessionCode, capabilityId, { categories: cap.categories })
          }
        } catch (error) {
          console.error('Failed to sync category assignment:', error)
        }
      }
    },
    [sessionCode, localAddCategoryToCap]
  )

  const removeCategoryFromCapability = useCallback(
    async (capabilityId: string, categoryId: string) => {
      localRemoveCategoryFromCap(capabilityId, categoryId)
      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          const cap = useCapabilityStore.getState().capabilities.find(c => c.id === capabilityId)
          if (cap) {
            await capabilityService.updateCapability(sessionCode, capabilityId, { categories: cap.categories })
          }
        } catch (error) {
          console.error('Failed to sync category removal:', error)
        }
      }
    },
    [sessionCode, localRemoveCategoryFromCap]
  )

  return {
    capabilities,
    categories,
    viewMode,
    addCapability,
    updateCapability,
    deleteCapability,
    reorderCapabilities,
    clearAll,
    sortByField: handleSort,
    setCapabilities,
    importCapabilities,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    addCategoryToCapability,
    removeCategoryFromCapability,
    setViewMode,
  }
}
