import { useEffect, useRef, useCallback, useState } from 'react'
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore'
import { getFirebaseDb, isFirebaseConfigured } from '../services/firebase'
import { getSessionAndRefresh } from '../services/sessionService'
import { useCapabilityStore } from '../stores/capabilityStore'
import { useStrategyStore } from '../stores/strategyStore'
import { useRetroStore } from '../stores/retroStore'
import { Capability } from '../types/capability'
import { Strategy, GamePlan } from '../types/strategy'
import { RetroItem, RetroColumn } from '../types/retrospective'
import { isDemoSession } from '../utils/demoUtils'
import toast from 'react-hot-toast'

interface UseFirebaseSyncOptions {
  sessionCode: string | null
}

export function useFirebaseSync({ sessionCode: rawSessionCode }: UseFirebaseSyncOptions) {
  // Normalize session code to lowercase for case-insensitive matching
  const sessionCode = rawSessionCode?.toLowerCase() ?? null

  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasRemoteUpdate, setHasRemoteUpdate] = useState(false)
  const [sessionNotFound, setSessionNotFound] = useState(false)
  const lastVersionRef = useRef<number>(0)
  const isInitialLoadRef = useRef(true)

  const setCapabilities = useCapabilityStore((s) => s.setCapabilities)
  const setStrategies = useStrategyStore((s) => s.setStrategies)
  const setGamePlans = useStrategyStore((s) => s.setGamePlans)
  const setRetroItems = useRetroStore((s) => s.setRetroItems)
  const setRetroColumns = useRetroStore((s) => s.setRetroColumns)

  const loadRemoteData = useCallback(() => {
    setHasRemoteUpdate(false)
  }, [])

  useEffect(() => {
    // Skip Firebase entirely for demo mode
    if (isDemoSession(sessionCode)) {
      setIsLoading(false)
      return
    }

    if (!sessionCode || !isFirebaseConfigured()) {
      setIsLoading(false)
      return
    }

    const db = getFirebaseDb()
    if (!db) {
      setIsLoading(false)
      return
    }

    let unsubSession: (() => void) | null = null
    let unsubCapabilities: (() => void) | null = null
    let unsubStrategies: (() => void) | null = null
    let unsubGamePlans: (() => void) | null = null
    let unsubRetroItems: (() => void) | null = null
    let unsubRetroColumns: (() => void) | null = null

    const setupListeners = async () => {
      try {
        // Check if session exists (don't auto-create - that happens in HomePage with PIN)
        const session = await getSessionAndRefresh(sessionCode)
        if (!session) {
          setSessionNotFound(true)
          setIsLoading(false)
          return
        }
        setIsConnected(true)

        // Listen to session for version changes
        const sessionRef = doc(db, 'sessions', sessionCode)
        unsubSession = onSnapshot(sessionRef, (snapshot) => {
          if (snapshot.exists()) {
            const version = snapshot.data().version || 0
            if (!isInitialLoadRef.current && version > lastVersionRef.current) {
              setHasRemoteUpdate(true)
            }
            lastVersionRef.current = version
          }
        })

        // Listen to capabilities
        const capQuery = query(
          collection(db, 'sessions', sessionCode, 'capabilities'),
          orderBy('rank', 'asc')
        )
        unsubCapabilities = onSnapshot(capQuery, (snapshot) => {
          const capabilities: Capability[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              rank: data.rank,
              title: data.title,
              description: data.description,
              priority: data.priority || 'medium',
              categories: data.categories || [],
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            }
          })
          setCapabilities(capabilities)
          if (isInitialLoadRef.current) {
            setIsLoading(false)
            isInitialLoadRef.current = false
          }
        })

        // Listen to game plans
        const gamePlansQuery = query(
          collection(db, 'sessions', sessionCode, 'gamePlans'),
          orderBy('createdAt', 'asc')
        )
        unsubGamePlans = onSnapshot(gamePlansQuery, (snapshot) => {
          const gamePlans: GamePlan[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              name: data.name,
              description: data.description,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            }
          })
          setGamePlans(gamePlans)
        })

        // Listen to strategies
        const stratQuery = query(
          collection(db, 'sessions', sessionCode, 'strategies'),
          orderBy('rank', 'asc')
        )
        unsubStrategies = onSnapshot(stratQuery, (snapshot) => {
          const strategies: Strategy[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              gamePlanId: data.gamePlanId || 'default',
              rank: data.rank,
              phase: data.phase,
              title: data.title,
              description: data.description,
              expectedPoints: data.expectedPoints,
              cycleTime: data.cycleTime,
              cyclesPerMatch: data.cyclesPerMatch,
              isDefensive: data.isDefensive,
              notes: data.notes,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            }
          })
          setStrategies(strategies)
        })

        // Listen to retro items
        const retroItemsQuery = query(
          collection(db, 'sessions', sessionCode, 'retroItems'),
          orderBy('createdAt', 'asc')
        )
        unsubRetroItems = onSnapshot(retroItemsQuery, (snapshot) => {
          const items: RetroItem[] = snapshot.docs.map((d) => {
            const data = d.data()
            return {
              id: d.id,
              columnId: data.columnId || '',
              title: data.title || '',
              description: data.description || '',
              tags: data.tags || [],
              voterIds: data.voterIds || [],
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            }
          })
          setRetroItems(items)
        })

        // Listen to retro columns
        const retroColumnsQuery = query(
          collection(db, 'sessions', sessionCode, 'retroColumns'),
          orderBy('order', 'asc')
        )
        unsubRetroColumns = onSnapshot(retroColumnsQuery, (snapshot) => {
          const columns: RetroColumn[] = snapshot.docs.map((d) => {
            const data = d.data()
            return {
              id: d.id,
              name: data.name || '',
              color: data.color || 'blue',
              order: data.order ?? 0,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            }
          })
          setRetroColumns(columns)
        })
      } catch (error) {
        console.error('Firebase sync error:', error)
        toast.error('Failed to connect to server. Working in offline mode.')
        setIsConnected(false)
        setIsLoading(false)
      }
    }

    setupListeners()

    return () => {
      unsubSession?.()
      unsubCapabilities?.()
      unsubStrategies?.()
      unsubGamePlans?.()
      unsubRetroItems?.()
      unsubRetroColumns?.()
    }
  }, [sessionCode, setCapabilities, setStrategies, setGamePlans, setRetroItems, setRetroColumns])

  return {
    isConnected,
    isLoading,
    hasRemoteUpdate,
    loadRemoteData,
    isFirebaseEnabled: isFirebaseConfigured(),
    sessionNotFound,
    isDemoMode: isDemoSession(sessionCode),
  }
}
