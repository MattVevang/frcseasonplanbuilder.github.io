import { useCallback, useMemo } from 'react'
import { useStrategyStore } from '../stores/strategyStore'
import { StrategyFormData, StrategySortField, MatchPhase } from '../types/strategy'
import { isFirebaseConfigured } from '../services/firebase'
import * as strategyService from '../services/strategyService'
import toast from 'react-hot-toast'

export function useStrategies(sessionCode: string | null) {
  const rawStrategies = useStrategyStore((s) => s.strategies)
  const sortField = useStrategyStore((s) => s.sortField)
  const sortDirection = useStrategyStore((s) => s.sortDirection)
  const localAdd = useStrategyStore((s) => s.addStrategy)
  const localUpdate = useStrategyStore((s) => s.updateStrategy)
  const localDelete = useStrategyStore((s) => s.deleteStrategy)
  const localReorder = useStrategyStore((s) => s.reorderStrategies)
  const localClear = useStrategyStore((s) => s.clearAll)
  const setStrategies = useStrategyStore((s) => s.setStrategies)
  const localSortByField = useStrategyStore((s) => s.sortByField)
  const getProjectedScore = useStrategyStore((s) => s.getProjectedScore)

  // Compute sorted strategies - useMemo ensures re-render when dependencies change
  const strategies = useMemo(() => {
    const phaseOrder: Record<MatchPhase, number> = {
      auto: 1,
      teleop: 2,
      endgame: 3,
    }

    return [...rawStrategies].sort((a, b) => {
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
  }, [rawStrategies, sortField, sortDirection])

  const addStrategy = useCallback(
    async (data: StrategyFormData) => {
      if (sessionCode && isFirebaseConfigured()) {
        try {
          await strategyService.addStrategy(
            sessionCode,
            data,
            rawStrategies.length + 1
          )
        } catch (error) {
          console.error('Failed to add strategy to Firebase:', error)
          toast.error('Failed to save. Working offline.')
          localAdd(data)
        }
      } else {
        localAdd(data)
      }
    },
    [sessionCode, rawStrategies.length, localAdd]
  )

  const updateStrategy = useCallback(
    async (id: string, data: Partial<StrategyFormData>) => {
      // Optimistic update
      localUpdate(id, data)

      if (sessionCode && isFirebaseConfigured()) {
        try {
          await strategyService.updateStrategy(sessionCode, id, data)
        } catch (error) {
          console.error('Failed to update strategy in Firebase:', error)
          toast.error('Failed to save changes.')
        }
      }
    },
    [sessionCode, localUpdate]
  )

  const deleteStrategy = useCallback(
    async (id: string) => {
      // Optimistic update
      localDelete(id)

      if (sessionCode && isFirebaseConfigured()) {
        try {
          await strategyService.deleteStrategy(sessionCode, id)
        } catch (error) {
          console.error('Failed to delete strategy from Firebase:', error)
          toast.error('Failed to delete.')
        }
      }
    },
    [sessionCode, localDelete]
  )

  const reorderStrategies = useCallback(
    async (activeId: string, overId: string) => {
      // Optimistic update
      localReorder(activeId, overId)

      if (sessionCode && isFirebaseConfigured()) {
        try {
          const reordered = useStrategyStore.getState().strategies
          await strategyService.reorderStrategies(sessionCode, reordered)
        } catch (error) {
          console.error('Failed to reorder strategies in Firebase:', error)
        }
      }
    },
    [sessionCode, localReorder]
  )

  const clearAll = useCallback(async () => {
    localClear()

    if (sessionCode && isFirebaseConfigured()) {
      try {
        await strategyService.clearAllStrategies(sessionCode)
      } catch (error) {
        console.error('Failed to clear strategies in Firebase:', error)
      }
    }
  }, [sessionCode, localClear])

  const handleSort = useCallback(
    (field: StrategySortField) => {
      // Sorting is display-only - it doesn't change the actual priority ranks
      // Only drag-and-drop reordering changes ranks and syncs to Firebase
      localSortByField(field)
    },
    [localSortByField]
  )

  return {
    strategies,
    addStrategy,
    updateStrategy,
    deleteStrategy,
    reorderStrategies,
    clearAll,
    sortByField: handleSort,
    setStrategies,
    getProjectedScore,
  }
}
