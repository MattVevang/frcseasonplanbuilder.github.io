export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'very-low'

export const PRIORITY_CONFIG: Record<Priority, { label: string; weight: number }> = {
  'critical': { label: 'Critical', weight: 5 },
  'high':     { label: 'High',     weight: 4 },
  'medium':   { label: 'Medium',   weight: 3 },
  'low':      { label: 'Low',      weight: 2 },
  'very-low': { label: 'Very Low', weight: 1 },
}

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'very-low', label: 'Very Low' },
]

export interface Capability {
  id: string
  rank: number
  title: string
  description: string
  priority: Priority
  createdAt: Date
  updatedAt: Date
}

export interface CapabilityFormData {
  title: string
  description: string
  priority: Priority
}

export type SortField = 'rank' | 'priority' | 'title'
export type SortDirection = 'asc' | 'desc'
