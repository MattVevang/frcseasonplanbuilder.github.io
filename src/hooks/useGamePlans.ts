import { useCallback } from 'react'
import { useStrategyStore } from '../stores/strategyStore'
import { GamePlan, GamePlanFormData } from '../types/strategy'
import { isFirebaseConfigured } from '../services/firebase'
import * as gamePlanService from '../services/gamePlanService'
import toast from 'react-hot-toast'

export function useGamePlans(sessionCode: string | null) {
  const gamePlans = useStrategyStore((s) => s.gamePlans)
  const selectedGamePlanId = useStrategyStore((s) => s.selectedGamePlanId)
  const localAddGamePlan = useStrategyStore((s) => s.addGamePlan)
  const localUpdateGamePlan = useStrategyStore((s) => s.updateGamePlan)
  const localDeleteGamePlan = useStrategyStore((s) => s.deleteGamePlan)
  const selectGamePlan = useStrategyStore((s) => s.selectGamePlan)
  const setGamePlans = useStrategyStore((s) => s.setGamePlans)

  const addGamePlan = useCallback(
    async (data: GamePlanFormData) => {
      if (sessionCode && isFirebaseConfigured()) {
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

      if (sessionCode && isFirebaseConfigured()) {
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

      if (sessionCode && isFirebaseConfigured()) {
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

      // Sync to Firebase if configured
      if (sessionCode && isFirebaseConfigured()) {
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

  const selectedGamePlan = gamePlans.find((gp) => gp.id === selectedGamePlanId) || gamePlans[0] || null

  return {
    gamePlans,
    selectedGamePlan,
    selectedGamePlanId,
    addGamePlan,
    updateGamePlan,
    deleteGamePlan,
    selectGamePlan,
    setGamePlans,
    importGamePlans,
    ensureDefaultGamePlan,
  }
}
