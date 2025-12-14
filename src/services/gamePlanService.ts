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

  const docRef = doc(db, 'sessions', sessionCode, 'gamePlans', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  })

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
