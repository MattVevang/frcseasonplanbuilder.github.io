import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Capability, CapabilityFormData, SortField, SortDirection } from '../types/capability'

interface CapabilityState {
  capabilities: Capability[]
  sortField: SortField
  sortDirection: SortDirection

  addCapability: (data: CapabilityFormData) => void
  updateCapability: (id: string, data: Partial<CapabilityFormData>) => void
  deleteCapability: (id: string) => void
  reorderCapabilities: (activeId: string, overId: string) => void
  setSort: (field: SortField, direction: SortDirection) => void
  sortByField: (field: SortField) => void
  getSortedCapabilities: () => Capability[]
  clearAll: () => void
  setCapabilities: (capabilities: Capability[]) => void
}

export const useCapabilityStore = create<CapabilityState>()(
  persist(
    (set, get) => ({
      capabilities: [],
      sortField: 'rank',
      sortDirection: 'asc',

      addCapability: (data) => {
        const capabilities = get().capabilities
        const newCapability: Capability = {
          id: uuidv4(),
          rank: capabilities.length + 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set({ capabilities: [...capabilities, newCapability] })
      },

      updateCapability: (id, data) => {
        set({
          capabilities: get().capabilities.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          ),
        })
      },

      deleteCapability: (id) => {
        const capabilities = get().capabilities.filter((c) => c.id !== id)
        // Reindex ranks
        const reindexed = capabilities.map((c, index) => ({
          ...c,
          rank: index + 1,
        }))
        set({ capabilities: reindexed })
      },

      reorderCapabilities: (activeId, overId) => {
        const capabilities = [...get().capabilities]
        const activeIndex = capabilities.findIndex((c) => c.id === activeId)
        const overIndex = capabilities.findIndex((c) => c.id === overId)

        if (activeIndex === -1 || overIndex === -1) return

        const [removed] = capabilities.splice(activeIndex, 1)
        capabilities.splice(overIndex, 0, removed!)

        // Update ranks
        const reindexed = capabilities.map((c, index) => ({
          ...c,
          rank: index + 1,
        }))
        set({ capabilities: reindexed })
      },

      setSort: (field, direction) => {
        set({ sortField: field, sortDirection: direction })
      },

      sortByField: (field) => {
        const { sortDirection } = get()
        const newDirection =
          get().sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'

        // Only update the sort field and direction - don't modify the capabilities array
        // The sorted view will be computed when displaying
        set({
          sortField: field,
          sortDirection: newDirection,
        })
      },

      getSortedCapabilities: () => {
        const { capabilities, sortField, sortDirection } = get()
        return [...capabilities].sort((a, b) => {
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
      },

      clearAll: () => {
        set({ capabilities: [] })
      },

      setCapabilities: (capabilities) => {
        set({ capabilities })
      },
    }),
    {
      name: 'frc-capabilities',
      partialize: (state) => ({
        capabilities: state.capabilities,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
      }),
    }
  )
)
