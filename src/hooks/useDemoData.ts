import { useEffect, useRef } from 'react'
import { isDemoSession } from '../utils/demoUtils'
import { demoCapabilities, demoStrategies, demoGamePlans, demoCategories, demoRetroItems, demoRetroColumns, demoRetroTags } from '../data/demoData'
import { useCapabilityStore } from '../stores/capabilityStore'
import { useStrategyStore } from '../stores/strategyStore'
import { useRetroStore } from '../stores/retroStore'

/**
 * Hook that initializes stores with demo data when in demo mode.
 * Demo data is loaded fresh each time the demo page is mounted,
 * ensuring each visitor gets an isolated experience.
 */
export function useDemoData(sessionCode: string | null) {
  const initialized = useRef(false)
  const setCapabilities = useCapabilityStore((s) => s.setCapabilities)
  const setCategories = useCapabilityStore((s) => s.setCategories)
  const setStrategies = useStrategyStore((s) => s.setStrategies)
  const setGamePlans = useStrategyStore((s) => s.setGamePlans)
  const setRetroItems = useRetroStore((s) => s.setRetroItems)
  const setRetroColumns = useRetroStore((s) => s.setRetroColumns)
  const setRetroTags = useRetroStore((s) => s.setRetroTags)

  useEffect(() => {
    if (isDemoSession(sessionCode) && !initialized.current) {
      // Load demo data into stores
      setCapabilities(demoCapabilities)
      setCategories(demoCategories)
      setGamePlans(demoGamePlans)
      setStrategies(demoStrategies)
      setRetroItems(demoRetroItems)
      setRetroColumns(demoRetroColumns)
      setRetroTags(demoRetroTags)
      initialized.current = true
    }
  }, [sessionCode, setCapabilities, setCategories, setStrategies, setGamePlans, setRetroItems, setRetroColumns, setRetroTags])

  // Reset initialization flag when leaving demo mode
  useEffect(() => {
    return () => {
      if (isDemoSession(sessionCode)) {
        initialized.current = false
      }
    }
  }, [sessionCode])
}
