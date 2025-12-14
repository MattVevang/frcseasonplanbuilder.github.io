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
import { Capability, CapabilityFormData } from '../types/capability'
import { incrementSessionVersion } from './sessionService'
import { v4 as uuidv4 } from 'uuid'

function getCapabilitiesCollection(sessionCode: string) {
  const db = getFirebaseDb()
  if (!db) return null
  return collection(db, 'sessions', sessionCode, 'capabilities')
}

export async function getCapabilities(sessionCode: string): Promise<Capability[]> {
  const colRef = getCapabilitiesCollection(sessionCode)
  if (!colRef) return []

  const q = query(colRef, orderBy('rank', 'asc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      rank: data.rank,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  })
}

export async function addCapability(
  sessionCode: string,
  data: CapabilityFormData,
  rank: number
): Promise<Capability> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')

  const id = uuidv4()
  const now = new Date()

  const capability: Capability = {
    id,
    rank,
    ...data,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = doc(db, 'sessions', sessionCode, 'capabilities', id)
  await setDoc(docRef, {
    rank,
    title: data.title,
    description: data.description,
    priority: data.priority,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  })

  await incrementSessionVersion(sessionCode)
  return capability
}

export async function updateCapability(
  sessionCode: string,
  id: string,
  data: Partial<CapabilityFormData>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const docRef = doc(db, 'sessions', sessionCode, 'capabilities', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  })

  await incrementSessionVersion(sessionCode)
}

export async function deleteCapability(
  sessionCode: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const docRef = doc(db, 'sessions', sessionCode, 'capabilities', id)
  await deleteDoc(docRef)

  await incrementSessionVersion(sessionCode)
}

export async function reorderCapabilities(
  sessionCode: string,
  capabilities: Capability[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const batch = writeBatch(db)

  capabilities.forEach((cap, index) => {
    const docRef = doc(db, 'sessions', sessionCode, 'capabilities', cap.id)
    batch.update(docRef, { rank: index + 1 })
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function clearAllCapabilities(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const colRef = getCapabilitiesCollection(sessionCode)
  if (!colRef) return

  const snapshot = await getDocs(colRef)
  const batch = writeBatch(db)

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function importCapabilities(
  sessionCode: string,
  capabilities: Capability[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  // Clear existing capabilities first
  await clearAllCapabilities(sessionCode)

  // Batch write all imported capabilities
  const batch = writeBatch(db)

  capabilities.forEach((cap, index) => {
    const docRef = doc(db, 'sessions', sessionCode, 'capabilities', cap.id)
    batch.set(docRef, {
      rank: index + 1,
      title: cap.title,
      description: cap.description,
      priority: cap.priority,
      createdAt: Timestamp.fromDate(cap.createdAt instanceof Date ? cap.createdAt : new Date(cap.createdAt)),
      updatedAt: Timestamp.fromDate(new Date()),
    })
  })

  await batch.commit()
  await incrementSessionVersion(sessionCode)
}
