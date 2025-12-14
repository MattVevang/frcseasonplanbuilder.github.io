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
import { Strategy, StrategyFormData } from '../types/strategy'
import { incrementSessionVersion } from './sessionService'
import { v4 as uuidv4 } from 'uuid'

function getStrategiesCollection(sessionCode: string) {
  const db = getFirebaseDb()
  if (!db) return null
  return collection(db, 'sessions', sessionCode, 'strategies')
}

export async function getStrategies(sessionCode: string): Promise<Strategy[]> {
  const colRef = getStrategiesCollection(sessionCode)
  if (!colRef) return []

  const q = query(colRef, orderBy('rank', 'asc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
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
}

export async function addStrategy(
  sessionCode: string,
  data: StrategyFormData,
  rank: number,
  gamePlanId: string
): Promise<Strategy> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')

  const id = uuidv4()
  const now = new Date()

  const strategy: Strategy = {
    id,
    gamePlanId,
    rank,
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = doc(db, 'sessions', sessionCode, 'strategies', id)
  await setDoc(docRef, {
    gamePlanId,
    rank,
    phase: data.phase,
    title: data.title,
    description: data.description,
    expectedPoints: data.expectedPoints,
    cycleTime: data.cycleTime || null,
    cyclesPerMatch: data.cyclesPerMatch || null,
    isDefensive: data.isDefensive,
    notes: data.notes,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  })

  await incrementSessionVersion(sessionCode)
  return strategy
}

export async function updateStrategy(
  sessionCode: string,
  id: string,
  data: Partial<StrategyFormData>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const docRef = doc(db, 'sessions', sessionCode, 'strategies', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  })

  await incrementSessionVersion(sessionCode)
}

export async function deleteStrategy(
  sessionCode: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const docRef = doc(db, 'sessions', sessionCode, 'strategies', id)
  await deleteDoc(docRef)

  await incrementSessionVersion(sessionCode)
}

export async function reorderStrategies(
  sessionCode: string,
  strategies: Strategy[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const batch = writeBatch(db)

  strategies.forEach((strat, index) => {
    const docRef = doc(db, 'sessions', sessionCode, 'strategies', strat.id)
    batch.update(docRef, { rank: index + 1 })
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function clearAllStrategies(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const colRef = getStrategiesCollection(sessionCode)
  if (!colRef) return

  const snapshot = await getDocs(colRef)
  const batch = writeBatch(db)

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function importStrategies(
  sessionCode: string,
  strategies: Strategy[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  // Clear existing strategies first
  await clearAllStrategies(sessionCode)

  // Batch write all imported strategies
  const batch = writeBatch(db)

  strategies.forEach((strat) => {
    const docRef = doc(db, 'sessions', sessionCode, 'strategies', strat.id)
    batch.set(docRef, {
      gamePlanId: strat.gamePlanId,
      rank: strat.rank,
      phase: strat.phase,
      title: strat.title,
      description: strat.description,
      expectedPoints: strat.expectedPoints,
      cycleTime: strat.cycleTime || null,
      cyclesPerMatch: strat.cyclesPerMatch || null,
      isDefensive: strat.isDefensive,
      notes: strat.notes,
      createdAt: Timestamp.fromDate(strat.createdAt instanceof Date ? strat.createdAt : new Date(strat.createdAt)),
      updatedAt: Timestamp.fromDate(new Date()),
    })
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}
