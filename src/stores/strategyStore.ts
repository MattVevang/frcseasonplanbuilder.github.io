import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Strategy, StrategyFormData, StrategySortField, MatchPhase, GamePlan, GamePlanFormData } from '../types/strategy'
import { SortDirection } from '../types/capability'

interface StrategyState {
  strategies: Strategy[]
  gamePlans: GamePlan[]
  selectedGamePlanId: string | null
  sortField: StrategySortField
  sortDirection: SortDirection
  phaseFilter: MatchPhase | 'all'

  // Game Plan actions
  addGamePlan: (data: GamePlanFormData) => GamePlan
  updateGamePlan: (id: string, data: Partial<GamePlanFormData>) => void
  deleteGamePlan: (id: string) => void
  selectGamePlan: (id: string) => void
  setGamePlans: (gamePlans: GamePlan[]) => void

  // Strategy actions
  addStrategy: (data: StrategyFormData, gamePlanId: string) => void
  updateStrategy: (id: string, data: Partial<StrategyFormData>) => void
  deleteStrategy: (id: string) => void
  reorderStrategies: (activeId: string, overId: string) => void
  setSort: (field: StrategySortField, direction: SortDirection) => void
  sortByField: (field: StrategySortField) => void
  getSortedStrategies: () => Strategy[]
  getStrategiesForGamePlan: (gamePlanId: string) => Strategy[]
  setPhaseFilter: (phase: MatchPhase | 'all') => void
  clearAll: () => void
  setStrategies: (strategies: Strategy[]) => void
  getProjectedScore: (gamePlanId?: string) => { auto: number; teleop: number; endgame: number; total: number }
}

export const useStrategyStore = create<StrategyState>()(
  persist(
    (set, get) => ({
      strategies: [],
      gamePlans: [],
      selectedGamePlanId: null,
      sortField: 'rank',
      sortDirection: 'asc',
      phaseFilter: 'all',

      // Game Plan actions
      addGamePlan: (data) => {
        const newGamePlan: GamePlan = {
          id: uuidv4(),
          name: data.name,
          description: data.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          gamePlans: [...state.gamePlans, newGamePlan],
          selectedGamePlanId: state.selectedGamePlanId || newGamePlan.id,
        }))
        return newGamePlan
      },

      updateGamePlan: (id, data) => {
        set({
          gamePlans: get().gamePlans.map((gp) =>
            gp.id === id ? { ...gp, ...data, updatedAt: new Date() } : gp
          ),
        })
      },

      deleteGamePlan: (id) => {
        const { gamePlans, strategies, selectedGamePlanId } = get()
        const remainingPlans = gamePlans.filter((gp) => gp.id !== id)
        const remainingStrategies = strategies.filter((s) => s.gamePlanId !== id)

        // If deleting selected plan, select the first remaining plan
        const newSelectedId = selectedGamePlanId === id
          ? (remainingPlans[0]?.id || null)
          : selectedGamePlanId

        set({
          gamePlans: remainingPlans,
          strategies: remainingStrategies,
          selectedGamePlanId: newSelectedId,
        })
      },

      selectGamePlan: (id) => {
        set({ selectedGamePlanId: id })
      },

      setGamePlans: (gamePlans) => {
        const { selectedGamePlanId } = get()
        // Auto-select first plan if none selected
        const newSelectedId = selectedGamePlanId && gamePlans.some(gp => gp.id === selectedGamePlanId)
          ? selectedGamePlanId
          : (gamePlans[0]?.id || null)
        set({ gamePlans, selectedGamePlanId: newSelectedId })
      },

      // Strategy actions
      addStrategy: (data, gamePlanId) => {
        const strategies = get().strategies.filter(s => s.gamePlanId === gamePlanId)
        const newStrategy: Strategy = {
          id: uuidv4(),
          gamePlanId,
          rank: strategies.length + 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({ strategies: [...state.strategies, newStrategy] }))
      },

      updateStrategy: (id, data) => {
        set({
          strategies: get().strategies.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: new Date() } : s
          ),
        })
      },

      deleteStrategy: (id) => {
        const strategy = get().strategies.find(s => s.id === id)
        if (!strategy) return

        const gamePlanId = strategy.gamePlanId
        const strategies = get().strategies.filter((s) => s.id !== id)

        // Re-index only strategies in the same game plan
        const reindexed = strategies.map((s) => {
          if (s.gamePlanId !== gamePlanId) return s
          const sameGamePlanStrategies = strategies.filter(st => st.gamePlanId === gamePlanId)
          const newRank = sameGamePlanStrategies.findIndex(st => st.id === s.id) + 1
          return { ...s, rank: newRank }
        })
        set({ strategies: reindexed })
      },

      reorderStrategies: (activeId, overId) => {
        const strategies = [...get().strategies]
        const activeStrategy = strategies.find((s) => s.id === activeId)
        if (!activeStrategy) return

        const gamePlanId = activeStrategy.gamePlanId
        const gamePlanStrategies = strategies.filter(s => s.gamePlanId === gamePlanId)
        const otherStrategies = strategies.filter(s => s.gamePlanId !== gamePlanId)

        const activeIndex = gamePlanStrategies.findIndex((s) => s.id === activeId)
        const overIndex = gamePlanStrategies.findIndex((s) => s.id === overId)

        if (activeIndex === -1 || overIndex === -1) return

        const [removed] = gamePlanStrategies.splice(activeIndex, 1)
        gamePlanStrategies.splice(overIndex, 0, removed!)

        const reindexed = gamePlanStrategies.map((s, index) => ({
          ...s,
          rank: index + 1,
        }))

        set({ strategies: [...otherStrategies, ...reindexed] })
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

      getStrategiesForGamePlan: (gamePlanId) => {
        return get().strategies.filter(s => s.gamePlanId === gamePlanId)
      },

      getSortedStrategies: () => {
        const { strategies, sortField, sortDirection, selectedGamePlanId } = get()

        // Filter by selected game plan
        const filtered = selectedGamePlanId
          ? strategies.filter(s => s.gamePlanId === selectedGamePlanId)
          : strategies

        const phaseOrder: Record<MatchPhase, number> = {
          auto: 1,
          teleop: 2,
          endgame: 3,
        }

        return [...filtered].sort((a, b) => {
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
        const { selectedGamePlanId } = get()
        // Only clear strategies for the selected game plan
        if (selectedGamePlanId) {
          set((state) => ({
            strategies: state.strategies.filter(s => s.gamePlanId !== selectedGamePlanId)
          }))
        } else {
          set({ strategies: [] })
        }
      },

      setStrategies: (strategies) => {
        set({ strategies })
      },

      getProjectedScore: (gamePlanId) => {
        const { strategies, selectedGamePlanId } = get()
        const targetGamePlanId = gamePlanId || selectedGamePlanId

        const filtered = targetGamePlanId
          ? strategies.filter((s) => s.gamePlanId === targetGamePlanId && !s.isDefensive)
          : strategies.filter((s) => !s.isDefensive)

        let auto = 0
        let teleop = 0
        let endgame = 0

        for (const strategy of filtered) {
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
        gamePlans: state.gamePlans,
        selectedGamePlanId: state.selectedGamePlanId,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        phaseFilter: state.phaseFilter,
      }),
    }
  )
)
