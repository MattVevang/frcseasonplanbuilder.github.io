import { Capability, CapabilityCategory } from '../types/capability'
import { Strategy, GamePlan } from '../types/strategy'

interface ExportData {
  version: '4.0'
  exportedAt: string
  sessionCode: string
  capabilities: Capability[]
  gamePlans: GamePlan[]
  strategies: Strategy[]
  categories: CapabilityCategory[]
}

// Support for older versions
interface LegacyExportData {
  version: '2.0' | '3.0' | string
  exportedAt: string
  sessionCode: string
  capabilities: Capability[]
  gamePlans?: GamePlan[]
  strategies: Strategy[]
  categories?: CapabilityCategory[]
}

export function exportData(
  sessionCode: string,
  capabilities: Capability[],
  gamePlans: GamePlan[],
  strategies: Strategy[],
  categories: CapabilityCategory[]
): void {
  const data: ExportData = {
    version: '4.0',
    exportedAt: new Date().toISOString(),
    sessionCode,
    capabilities,
    gamePlans,
    strategies,
    categories,
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

export async function importData(
  file: File
): Promise<{ capabilities: Capability[]; gamePlans: GamePlan[]; strategies: Strategy[]; categories: CapabilityCategory[] }> {
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

        // Handle v4.0 with categories
        if (rawData.version === '4.0') {
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

          resolve({ capabilities, gamePlans, strategies, categories })
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

          resolve({ capabilities, gamePlans, strategies, categories: [] })
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
