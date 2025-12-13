import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Strategy, StrategyFormData, StrategySortField, MatchPhase } from '../types/strategy'
import { SortDirection } from '../types/capability'

interface StrategyState {
  strategies: Strategy[]
  sortField: StrategySortField
  sortDirection: SortDirection
  phaseFilter: MatchPhase | 'all'

  addStrategy: (data: StrategyFormData) => void
  updateStrategy: (id: string, data: Partial<StrategyFormData>) => void
  deleteStrategy: (id: string) => void
  reorderStrategies: (activeId: string, overId: string) => void
  setSort: (field: StrategySortField, direction: SortDirection) => void
  sortByField: (field: StrategySortField) => void
  getSortedStrategies: () => Strategy[]
  setPhaseFilter: (phase: MatchPhase | 'all') => void
  clearAll: () => void
  setStrategies: (strategies: Strategy[]) => void
  getProjectedScore: () => { auto: number; teleop: number; endgame: number; total: number }
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      strategies: [],
      sortField: 'rank',
      sortDirection: 'asc',
      phaseFilter: 'all',

      addStrategy: (data) => {
        const strategies = get().strategies
        const newStrategy: Strategy = {
          id: uuidv4(),
          rank: strategies.length + 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set({ strategies: [...strategies, newStrategy] })
      },

      updateStrategy: (id, data) => {
        set({
          strategies: get().strategies.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: new Date() } : s
          ),
        })
      },

      deleteStrategy: (id) => {
        const strategies = get().strategies.filter((s) => s.id !== id)
        const reindexed = strategies.map((s, index) => ({
          ...s,
          rank: index + 1,
        }))
        set({ strategies: reindexed })
      },

      reorderStrategies: (activeId, overId) => {
        const strategies = [...get().strategies]
        const activeIndex = strategies.findIndex((s) => s.id === activeId)
        const overIndex = strategies.findIndex((s) => s.id === overId)

        if (activeIndex === -1 || overIndex === -1) return

        const [removed] = strategies.splice(activeIndex, 1)
        strategies.splice(overIndex, 0, removed!)

        const reindexed = strategies.map((s, index) => ({
          ...s,
          rank: index + 1,
        }))
        set({ strategies: reindexed })
      },

      setSort: (field, direction) => {
        set({ sortField: field, sortDirection: direction })
      },

      sortByField: (field) => {
        const { sortDirection } = get()
        const newDirection =
          get().sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'

        // Only update the sort field and direction - don't modify the strategies array
        // The sorted view will be computed when displaying
        set({
          sortField: field,
          sortDirection: newDirection,
        })
      },

      getSortedStrategies: () => {
        const { strategies, sortField, sortDirection } = get()

        const phaseOrder: Record<MatchPhase, number> = {
          auto: 1,
          teleop: 2,
          endgame: 3,
        }

        return [...strategies].sort((a, b) => {
          let comparison = 0
          switch (sortField) {
            case 'rank':
              comparison = a.rank - b.rank
              break
            case 'expectedPoints':
              comparison = a.expectedPoints - b.expectedPoints
              break
            case 'title':
              comparison = a.title.localeCompare(b.title)
              break
            case 'phase':
              comparison = phaseOrder[a.phase] - phaseOrder[b.phase]
              break
          }
          return sortDirection === 'asc' ? comparison : -comparison
        })
      },

      setPhaseFilter: (phase) => {
        set({ phaseFilter: phase })
      },

      clearAll: () => {
        set({ strategies: [] })
      },

      setStrategies: (strategies) => {
        set({ strategies })
      },

      getProjectedScore: () => {
        const strategies = get().strategies.filter((s) => !s.isDefensive)

        let auto = 0
        let teleop = 0
        let endgame = 0

        for (const strategy of strategies) {
          const points = strategy.cyclesPerMatch
            ? strategy.expectedPoints * strategy.cyclesPerMatch
            : strategy.expectedPoints

          switch (strategy.phase) {
            case 'auto':
              auto += points
              break
            case 'teleop':
              teleop += points
              break
            case 'endgame':
              endgame += points
              break
          }
        }

        return { auto, teleop, endgame, total: auto + teleop + endgame }
      },
    }),
    {
      name: 'frc-strategies',
      partialize: (state) => ({
        strategies: state.strategies,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        phaseFilter: state.phaseFilter,
      }),
    }
  )
)
