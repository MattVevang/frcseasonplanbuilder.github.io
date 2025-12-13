export interface Capability {
  id: string
  rank: number
  title: string
  description: string
  points: number
  createdAt: Date
  updatedAt: Date
}

export interface CapabilityFormData {
  title: string
  description: string
  points: number
}

export type SortField = 'rank' | 'points' | 'title'
export type SortDirection = 'asc' | 'desc'
