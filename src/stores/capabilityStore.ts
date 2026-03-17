import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Capability, CapabilityCategory, CapabilityFormData, SortField, SortDirection, ViewMode, PRIORITY_CONFIG } from '../types/capability'

function normalizeCapability(cap: Record<string, unknown>): Capability {
  return {
    ...(cap as unknown as Capability),
    categories: Array.isArray(cap.categories) ? (cap.categories as string[]) : [],
  }
}

interface CapabilityState {
  capabilities: Capability[]
  categories: CapabilityCategory[]
  viewMode: ViewMode
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

  addCategory: (name: string, color: string) => void
  updateCategory: (id: string, data: { name?: string; color?: string }) => void
  deleteCategory: (id: string) => void
  setCategories: (categories: CapabilityCategory[]) => void

  addCategoryToCapability: (capabilityId: string, categoryId: string) => void
  removeCategoryFromCapability: (capabilityId: string, categoryId: string) => void

  setViewMode: (mode: ViewMode) => void
}

export const useCapabilityStore = create<CapabilityState>()(
  persist(
    (set, get) => ({
      capabilities: [],
      categories: [],
      viewMode: 'list',
      sortField: 'rank',
      sortDirection: 'asc',

      addCapability: (data) => {
        const capabilities = get().capabilities
        const newCapability: Capability = {
          id: uuidv4(),
          rank: capabilities.length + 1,
          ...data,
          categories: data.categories || [],
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
            case 'priority':
              comparison = PRIORITY_CONFIG[a.priority].weight - PRIORITY_CONFIG[b.priority].weight
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
        set({ capabilities: capabilities.map(c => normalizeCapability(c as unknown as Record<string, unknown>)) })
      },

      addCategory: (name, color) => {
        const newCategory: CapabilityCategory = { id: uuidv4(), name, color }
        set({ categories: [...get().categories, newCategory] })
      },

      updateCategory: (id, data) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })
      },

      deleteCategory: (id) => {
        const capabilities = get().capabilities.map((cap) => ({
          ...cap,
          categories: cap.categories.filter((catId) => catId !== id),
        }))
        set({
          categories: get().categories.filter((c) => c.id !== id),
          capabilities,
        })
      },

      setCategories: (categories) => {
        set({ categories })
      },

      addCategoryToCapability: (capabilityId, categoryId) => {
        set({
          capabilities: get().capabilities.map((cap) =>
            cap.id === capabilityId && !cap.categories.includes(categoryId)
              ? { ...cap, categories: [...cap.categories, categoryId], updatedAt: new Date() }
              : cap
          ),
        })
      },

      removeCategoryFromCapability: (capabilityId, categoryId) => {
        set({
          capabilities: get().capabilities.map((cap) =>
            cap.id === capabilityId
              ? { ...cap, categories: cap.categories.filter((id) => id !== categoryId), updatedAt: new Date() }
              : cap
          ),
        })
      },

      setViewMode: (mode) => {
        set({ viewMode: mode })
      },
    }),
    {
      name: 'frc-capabilities',
      partialize: (state) => ({
        capabilities: state.capabilities,
        categories: state.categories,
        viewMode: state.viewMode,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
      }),
    }
  )
)
