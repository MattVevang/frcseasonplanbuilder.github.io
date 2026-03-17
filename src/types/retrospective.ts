import { CATEGORY_COLORS } from './capability'

export interface RetroColumn {
  id: string
  name: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface RetroItem {
  id: string
  columnId: string
  title: string
  description: string
  tags: string[]
  voterIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface RetroItemFormData {
  title: string
  description: string
  columnId: string
  tags: string[]
}

export interface RetroColumnFormData {
  name: string
  color: string
}

// Reuse the capability color palette
export { CATEGORY_COLORS as RETRO_COLUMN_COLORS }

export const DEFAULT_RETRO_COLUMNS: Omit<RetroColumn, 'createdAt' | 'updatedAt'>[] = [
  { id: 'went-well', name: 'What Went Well', color: 'green', order: 0 },
  { id: 'needs-improvement', name: 'What Needs Improvement', color: 'orange', order: 1 },
  { id: 'action-items', name: 'Action Items', color: 'blue', order: 2 },
]
