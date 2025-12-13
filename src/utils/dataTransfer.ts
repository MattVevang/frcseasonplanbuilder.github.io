import { Capability } from '../types/capability'
import { Strategy } from '../types/strategy'

interface ExportData {
  version: '1.0'
  exportedAt: string
  sessionCode: string
  capabilities: Capability[]
  strategies: Strategy[]
}

export function exportData(
  sessionCode: string,
  capabilities: Capability[],
  strategies: Strategy[]
): void {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    sessionCode,
    capabilities,
    strategies,
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
): Promise<{ capabilities: Capability[]; strategies: Strategy[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as ExportData

        if (!data.version || !data.capabilities || !data.strategies) {
          throw new Error('Invalid file format')
        }

        // Validate capabilities
        const capabilities = data.capabilities.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }))

        // Validate strategies
        const strategies = data.strategies.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }))

        resolve({ capabilities, strategies })
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
