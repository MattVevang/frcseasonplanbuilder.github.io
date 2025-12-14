import { useCallback } from 'react'
import { useStrategyStore } from '../stores/strategyStore'
import { GamePlan, GamePlanFormData } from '../types/strategy'
import { isFirebaseConfigured } from '../services/firebase'
import { isDemoSession } from '../utils/demoUtils'
import * as gamePlanService from '../services/gamePlanService'
import toast from 'react-hot-toast'

export function useGamePlans(rawSessionCode: string | null) {
  // Normalize session code to lowercase for case-insensitive matching
  const sessionCode = rawSessionCode?.toLowerCase() ?? null

  const gamePlans = useStrategyStore((s) => s.gamePlans)
  const selectedGamePlanId = useStrategyStore((s) => s.selectedGamePlanId)
  const localAddGamePlan = useStrategyStore((s) => s.addGamePlan)
  const localUpdateGamePlan = useStrategyStore((s) => s.updateGamePlan)
  const localDeleteGamePlan = useStrategyStore((s) => s.deleteGamePlan)
  const selectGamePlan = useStrategyStore((s) => s.selectGamePlan)
  const setGamePlans = useStrategyStore((s) => s.setGamePlans)

  const addGamePlan = useCallback(
    async (data: GamePlanFormData) => {
      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          const gamePlan = await gamePlanService.addGamePlan(sessionCode, data)
          return gamePlan
        } catch (error) {
          console.error('Failed to add game plan to Firebase:', error)
          toast.error('Failed to save. Working offline.')
          return localAddGamePlan(data)
        }
      } else {
        return localAddGamePlan(data)
      }
    },
    [sessionCode, localAddGamePlan]
  )

  const updateGamePlan = useCallback(
    async (id: string, data: Partial<GamePlanFormData>) => {
      // Optimistic update
      localUpdateGamePlan(id, data)

      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          await gamePlanService.updateGamePlan(sessionCode, id, data)
        } catch (error) {
          console.error('Failed to update game plan in Firebase:', error)
          toast.error('Failed to save changes.')
        }
      }
    },
    [sessionCode, localUpdateGamePlan]
  )

  const deleteGamePlan = useCallback(
    async (id: string) => {
      // Don't allow deleting the last game plan
      if (gamePlans.length <= 1) {
        toast.error('Cannot delete the only game plan.')
        return
      }

      // Optimistic update
      localDeleteGamePlan(id)

      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          await gamePlanService.deleteGamePlan(sessionCode, id)
        } catch (error) {
          console.error('Failed to delete game plan from Firebase:', error)
          toast.error('Failed to delete.')
        }
      }
    },
    [sessionCode, localDeleteGamePlan, gamePlans.length]
  )

  // Ensure at least one game plan exists
  const ensureDefaultGamePlan = useCallback(async () => {
    if (gamePlans.length === 0) {
      await addGamePlan({ name: 'Default Plan', description: 'Your primary game strategy' })
    }
  }, [gamePlans.length, addGamePlan])

  const importGamePlans = useCallback(
    async (plans: GamePlan[]) => {
      // Update local state immediately
      setGamePlans(plans)

      // Sync to Firebase if configured (skip for demo mode)
      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          await gamePlanService.importGamePlans(sessionCode, plans)
        } catch (error) {
          console.error('Failed to import game plans to Firebase:', error)
          toast.error('Failed to sync imported data to server.')
        }
      }
    },
    [sessionCode, setGamePlans]
  )

  const duplicateGamePlan = useCallback(
    async (sourcePlanId: string, newName: string) => {
      if (sessionCode && isFirebaseConfigured() && !isDemoSession(sessionCode)) {
        try {
          const newPlan = await gamePlanService.duplicateGamePlan(sessionCode, sourcePlanId, newName)
          // Firebase listeners will update the store automatically
          return newPlan
        } catch (error) {
          console.error('Failed to duplicate game plan:', error)
          toast.error('Failed to duplicate game plan.')
          return null
        }
      } else {
        // Local-only duplication (used in demo mode and offline)
        const sourcePlan = gamePlans.find((gp) => gp.id === sourcePlanId)
        if (!sourcePlan) return null

        const newPlan = localAddGamePlan({ name: newName, description: sourcePlan.description })
        // Note: strategies won't be duplicated in local-only mode without more work
        toast.success('Plan created (strategies not copied in offline mode)')
        return newPlan
      }
    },
    [sessionCode, gamePlans, localAddGamePlan]
  )

  const selectedGamePlan = gamePlans.find((gp) => gp.id === selectedGamePlanId) || gamePlans[0] || null

  return {
    gamePlans,
    selectedGamePlan,
    selectedGamePlanId,
    addGamePlan,
    updateGamePlan,
    deleteGamePlan,
    duplicateGamePlan,
    selectGamePlan,
    setGamePlans,
    importGamePlans,
    ensureDefaultGamePlan,
  }
}
