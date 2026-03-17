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

export interface CapabilityCategory {
  id: string
  name: string
  color: string
}

export const CATEGORY_COLORS: Record<string, {
  label: string; hex: string; bg: string; text: string;
  border: string; headerBg: string; dot: string
}> = {
  blue:   { label: 'Blue',   hex: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800', headerBg: 'bg-blue-100 dark:bg-blue-900/40', dot: 'bg-blue-500' },
  green:  { label: 'Green',  hex: '#22C55E', bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-700 dark:text-green-300',  border: 'border-green-200 dark:border-green-800', headerBg: 'bg-green-100 dark:bg-green-900/40', dot: 'bg-green-500' },
  purple: { label: 'Purple', hex: '#A855F7', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', headerBg: 'bg-purple-100 dark:bg-purple-900/40', dot: 'bg-purple-500' },
  orange: { label: 'Orange', hex: '#F97316', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', headerBg: 'bg-orange-100 dark:bg-orange-900/40', dot: 'bg-orange-500' },
  pink:   { label: 'Pink',   hex: '#EC4899', bg: 'bg-pink-50 dark:bg-pink-900/20',     text: 'text-pink-700 dark:text-pink-300',    border: 'border-pink-200 dark:border-pink-800', headerBg: 'bg-pink-100 dark:bg-pink-900/40', dot: 'bg-pink-500' },
  teal:   { label: 'Teal',   hex: '#14B8A6', bg: 'bg-teal-50 dark:bg-teal-900/20',     text: 'text-teal-700 dark:text-teal-300',    border: 'border-teal-200 dark:border-teal-800', headerBg: 'bg-teal-100 dark:bg-teal-900/40', dot: 'bg-teal-500' },
  red:    { label: 'Red',    hex: '#EF4444', bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-300',      border: 'border-red-200 dark:border-red-800', headerBg: 'bg-red-100 dark:bg-red-900/40', dot: 'bg-red-500' },
  yellow: { label: 'Yellow', hex: '#EAB308', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', headerBg: 'bg-yellow-100 dark:bg-yellow-900/40', dot: 'bg-yellow-500' },
}

export interface Capability {
  id: string
  rank: number
  title: string
  description: string
  priority: Priority
  categories: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CapabilityFormData {
  title: string
  description: string
  priority: Priority
  categories: string[]
}

export type SortField = 'rank' | 'priority' | 'title'
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'list' | 'board'
