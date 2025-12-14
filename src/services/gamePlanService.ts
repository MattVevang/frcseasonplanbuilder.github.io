import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { GamePlan, GamePlanFormData } from '../types/strategy'
import { incrementSessionVersion } from './sessionService'
import { v4 as uuidv4 } from 'uuid'

function getGamePlansCollection(sessionCode: string) {
  const db = getFirebaseDb()
  if (!db) return null
  return collection(db, 'sessions', sessionCode, 'gamePlans')
}

export async function getGamePlans(sessionCode: string): Promise<GamePlan[]> {
  const colRef = getGamePlansCollection(sessionCode)
  if (!colRef) return []

  const q = query(colRef, orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  })
}

export async function addGamePlan(
  sessionCode: string,
  data: GamePlanFormData
): Promise<GamePlan> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')

  const id = uuidv4()
  const now = new Date()

  const gamePlan: GamePlan = {
    id,
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = doc(db, 'sessions', sessionCode, 'gamePlans', id)
  await setDoc(docRef, {
    name: data.name,
    description: data.description || null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  })

  await incrementSessionVersion(sessionCode)
  return gamePlan
}

export async function updateGamePlan(
  sessionCode: string,
  id: string,
  data: Partial<GamePlanFormData>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const now = new Date()
  const docRef = doc(db, 'sessions', sessionCode, 'gamePlans', id)

  try {
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.fromDate(now),
    })
  } catch {
    // Document may not exist yet (e.g., after import) - create it
    await setDoc(docRef, {
      name: data.name || 'Untitled Plan',
      description: data.description || null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    })
  }

  await incrementSessionVersion(sessionCode)
}

export async function deleteGamePlan(
  sessionCode: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const docRef = doc(db, 'sessions', sessionCode, 'gamePlans', id)
  await deleteDoc(docRef)

  await incrementSessionVersion(sessionCode)
}

// Create a default game plan for new sessions
export async function ensureDefaultGamePlan(sessionCode: string): Promise<GamePlan> {
  const existingPlans = await getGamePlans(sessionCode)
  const firstPlan = existingPlans[0]

  if (firstPlan) {
    return firstPlan
  }

  return addGamePlan(sessionCode, {
    name: 'Default Plan',
    description: 'Your primary game strategy',
  })
}

export async function duplicateGamePlan(
  sessionCode: string,
  sourcePlanId: string,
  newName: string
): Promise<GamePlan> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')

  // Get the source strategies
  const strategiesCol = collection(db, 'sessions', sessionCode, 'strategies')
  const stratQuery = query(strategiesCol, orderBy('rank', 'asc'))
  const stratSnapshot = await getDocs(stratQuery)

  const sourceStrategies = stratSnapshot.docs
    .filter((docSnap) => docSnap.data().gamePlanId === sourcePlanId)
    .map((docSnap) => docSnap.data())

  // Create new game plan
  const newPlanId = uuidv4()
  const now = new Date()

  const newGamePlan: GamePlan = {
    id: newPlanId,
    name: newName,
    description: undefined,
    createdAt: now,
    updatedAt: now,
  }

  const batch = writeBatch(db)

  // Add new game plan
  const planDocRef = doc(db, 'sessions', sessionCode, 'gamePlans', newPlanId)
  batch.set(planDocRef, {
    name: newName,
    description: null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  })

  // Duplicate all strategies with new IDs
  sourceStrategies.forEach((strat) => {
    const newStratId = uuidv4()
    const stratDocRef = doc(db, 'sessions', sessionCode, 'strategies', newStratId)
    batch.set(stratDocRef, {
      gamePlanId: newPlanId,
      rank: strat.rank,
      phase: strat.phase,
      title: strat.title,
      description: strat.description,
      expectedPoints: strat.expectedPoints,
      cycleTime: strat.cycleTime || null,
      cyclesPerMatch: strat.cyclesPerMatch || null,
      isDefensive: strat.isDefensive,
      notes: strat.notes,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    })
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)

  return newGamePlan
}

export async function clearAllGamePlans(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const colRef = getGamePlansCollection(sessionCode)
  if (!colRef) return

  const snapshot = await getDocs(colRef)
  const batch = writeBatch(db)

  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref)
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function importGamePlans(
  sessionCode: string,
  gamePlans: GamePlan[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  // Clear existing game plans first
  await clearAllGamePlans(sessionCode)

  // Batch write all imported game plans
  const batch = writeBatch(db)

  gamePlans.forEach((gp) => {
    const docRef = doc(db, 'sessions', sessionCode, 'gamePlans', gp.id)
    batch.set(docRef, {
      name: gp.name,
      description: gp.description || null,
      createdAt: Timestamp.fromDate(gp.createdAt instanceof Date ? gp.createdAt : new Date(gp.createdAt)),
      updatedAt: Timestamp.fromDate(new Date()),
    })
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}
