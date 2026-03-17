import { Capability, CapabilityCategory } from '../types/capability'
import { Strategy, GamePlan } from '../types/strategy'
import { RetroItem, RetroColumn } from '../types/retrospective'

interface ExportData {
  version: '5.0'
  exportedAt: string
  sessionCode: string
  capabilities: Capability[]
  gamePlans: GamePlan[]
  strategies: Strategy[]
  categories: CapabilityCategory[]
  retroItems: RetroItem[]
  retroColumns: RetroColumn[]
  retroTags: string[]
}

// Support for older versions
interface LegacyExportData {
  version: '2.0' | '3.0' | '4.0' | string
  exportedAt: string
  sessionCode: string
  capabilities: Capability[]
  gamePlans?: GamePlan[]
  strategies: Strategy[]
  categories?: CapabilityCategory[]
  retroItems?: RetroItem[]
  retroColumns?: RetroColumn[]
  retroTags?: string[]
}

export interface ImportResult {
  capabilities: Capability[]
  gamePlans: GamePlan[]
  strategies: Strategy[]
  categories: CapabilityCategory[]
  retroItems: RetroItem[]
  retroColumns: RetroColumn[]
  retroTags: string[]
}

export function exportData(
  sessionCode: string,
  capabilities: Capability[],
  gamePlans: GamePlan[],
  strategies: Strategy[],
  categories: CapabilityCategory[],
  retroItems: RetroItem[],
  retroColumns: RetroColumn[],
  retroTags: string[]
): void {
  const data: ExportData = {
    version: '5.0',
    exportedAt: new Date().toISOString(),
    sessionCode,
    capabilities,
    gamePlans,
    strategies,
    categories,
    retroItems,
    retroColumns,
    retroTags,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `frc-plan-${sessionCode}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const rawData = JSON.parse(content)

        if (!rawData.version || !rawData.capabilities) {
          throw new Error('Invalid file format')
        }

        // Validate capabilities (ensure categories field exists)
        const capabilities = rawData.capabilities.map((c: Capability) => ({
          ...c,
          categories: c.categories || [],
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }))

        // Parse retro data (present in v5.0+)
        const retroItems: RetroItem[] = (rawData.retroItems || []).map((item: RetroItem) => ({
          ...item,
          tags: item.tags || [],
          voterIds: item.voterIds || [],
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }))

        const retroColumns: RetroColumn[] = (rawData.retroColumns || []).map((col: RetroColumn) => ({
          ...col,
          createdAt: new Date(col.createdAt),
          updatedAt: new Date(col.updatedAt),
        }))

        const retroTags: string[] = rawData.retroTags || []

        if (rawData.version === '5.0' || rawData.version === '4.0') {
          // Handle v5.0 (with retro) and v4.0 (with categories)
          const gamePlans = (rawData.gamePlans || []).map((gp: GamePlan) => ({
            ...gp,
            createdAt: new Date(gp.createdAt),
            updatedAt: new Date(gp.updatedAt),
          }))

          const strategies = (rawData.strategies || []).map((s: Strategy) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }))

          const categories: CapabilityCategory[] = rawData.categories || []

          resolve({ capabilities, gamePlans, strategies, categories, retroItems, retroColumns, retroTags })
        } else if (rawData.version === '3.0' && rawData.gamePlans) {
          // Handle v3.0 with game plans but no categories
          const gamePlans = rawData.gamePlans.map((gp: GamePlan) => ({
            ...gp,
            createdAt: new Date(gp.createdAt),
            updatedAt: new Date(gp.updatedAt),
          }))

          const strategies = rawData.strategies.map((s: Strategy) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }))

          resolve({ capabilities, gamePlans, strategies, categories: [], retroItems: [], retroColumns: [], retroTags: [] })
        } else {
          // Handle legacy v2.0 format
          const legacyData = rawData as LegacyExportData

          if (!legacyData.strategies) {
            throw new Error('Invalid file format')
          }

          const defaultGamePlan: GamePlan = {
            id: 'imported-default',
            name: 'Imported Plan',
            description: 'Imported from legacy format',
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const strategies = legacyData.strategies.map((s) => ({
            ...s,
            gamePlanId: defaultGamePlan.id,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }))

          resolve({
            capabilities,
            gamePlans: [defaultGamePlan],
            strategies,
            categories: [],
            retroItems: [],
            retroColumns: [],
            retroTags: [],
          })
        }
      } catch {
        reject(new Error('Failed to parse import file. Please check the file format.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
