import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { RetroItem, RetroColumn, RetroItemFormData, RetroColumnFormData } from '../types/retrospective'

interface RetroState {
  retroItems: RetroItem[]
  retroColumns: RetroColumn[]
  retroTags: string[]

  addItem: (data: RetroItemFormData) => RetroItem
  updateItem: (id: string, data: Partial<RetroItemFormData>) => void
  deleteItem: (id: string) => void
  setRetroItems: (items: RetroItem[]) => void

  addColumn: (data: RetroColumnFormData) => RetroColumn
  updateColumn: (id: string, data: Partial<RetroColumnFormData>) => void
  deleteColumn: (id: string) => void
  setRetroColumns: (columns: RetroColumn[]) => void

  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setRetroTags: (tags: string[]) => void

  toggleVote: (itemId: string, voterId: string) => void

  clearAll: () => void
}

export const useRetroStore = create<RetroState>()(
  persist(
    (set, get) => ({
      retroItems: [],
      retroColumns: [],
      retroTags: [],

      addItem: (data) => {
        const now = new Date()
        const newItem: RetroItem = {
          id: uuidv4(),
          columnId: data.columnId,
          title: data.title,
          description: data.description,
          tags: data.tags || [],
          voterIds: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          retroItems: [...state.retroItems, newItem],
        }))
        return newItem
      },

      updateItem: (id, data) => {
        set((state) => ({
          retroItems: state.retroItems.map((item) =>
            item.id === id
              ? { ...item, ...data, updatedAt: new Date() }
              : item
          ),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          retroItems: state.retroItems.filter((item) => item.id !== id),
        }))
      },

      setRetroItems: (items) => set({ retroItems: items }),

      addColumn: (data) => {
        const now = new Date()
        const columns = get().retroColumns
        const newColumn: RetroColumn = {
          id: uuidv4(),
          name: data.name,
          color: data.color,
          order: columns.length,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          retroColumns: [...state.retroColumns, newColumn],
        }))
        return newColumn
      },

      updateColumn: (id, data) => {
        set((state) => ({
          retroColumns: state.retroColumns.map((col) =>
            col.id === id
              ? { ...col, ...data, updatedAt: new Date() }
              : col
          ),
        }))
      },

      deleteColumn: (id) => {
        set((state) => ({
          retroColumns: state.retroColumns.filter((col) => col.id !== id),
        }))
      },

      setRetroColumns: (columns) => set({ retroColumns: columns }),

      addTag: (tag) => {
        const normalized = tag.trim().toLowerCase()
        if (!normalized) return
        set((state) => ({
          retroTags: state.retroTags.includes(normalized)
            ? state.retroTags
            : [...state.retroTags, normalized].sort(),
        }))
      },

      removeTag: (tag) => {
        set((state) => ({
          retroTags: state.retroTags.filter((t) => t !== tag),
          // Also strip the tag from all items that reference it
          retroItems: state.retroItems.map((item) =>
            (item.tags || []).includes(tag)
              ? { ...item, tags: item.tags.filter((t) => t !== tag), updatedAt: new Date() }
              : item
          ),
        }))
      },

      setRetroTags: (tags) => set({ retroTags: tags }),

      toggleVote:(itemId, voterId) => {
        set((state) => ({
          retroItems: state.retroItems.map((item) => {
            if (item.id !== itemId) return item
            const hasVoted = item.voterIds.includes(voterId)
            return {
              ...item,
              voterIds: hasVoted
                ? item.voterIds.filter((v) => v !== voterId)
                : [...item.voterIds, voterId],
              updatedAt: new Date(),
            }
          }),
        }))
      },

      clearAll: () => set({ retroItems: [], retroColumns: [], retroTags: [] }),
    }),
    {
      name: 'frc-retro',
      partialize: (state) => ({
        retroItems: state.retroItems,
        retroColumns: state.retroColumns,
        retroTags: state.retroTags,
      }),
    }
  )
)
