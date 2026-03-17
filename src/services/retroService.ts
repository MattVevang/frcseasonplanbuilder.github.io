import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { incrementSessionVersion } from './sessionService'
import { RetroItem, RetroColumn, RetroItemFormData, RetroColumnFormData } from '../types/retrospective'
import { v4 as uuidv4 } from 'uuid'

// ── Retro Items ──

function getRetroItemsCollection(sessionCode: string) {
  const db = getFirebaseDb()
  if (!db) return null
  return collection(db, 'sessions', sessionCode, 'retroItems')
}

export async function getRetroItems(sessionCode: string): Promise<RetroItem[]> {
  const colRef = getRetroItemsCollection(sessionCode)
  if (!colRef) return []
  const q = query(colRef, orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => {
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
}

export async function addRetroItem(
  sessionCode: string,
  data: RetroItemFormData
): Promise<RetroItem> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')
  const id = uuidv4()
  const now = new Date()
  const item: RetroItem = {
    id,
    columnId: data.columnId,
    title: data.title,
    description: data.description,
    tags: data.tags || [],
    voterIds: [],
    createdAt: now,
    updatedAt: now,
  }
  const docRef = doc(db, 'sessions', sessionCode, 'retroItems', id)
  await setDoc(docRef, {
    columnId: data.columnId,
    title: data.title,
    description: data.description,
    tags: data.tags || [],
    voterIds: [],
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  })
  await incrementSessionVersion(sessionCode)
  return item
}

export async function updateRetroItem(
  sessionCode: string,
  id: string,
  data: Partial<RetroItemFormData>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const docRef = doc(db, 'sessions', sessionCode, 'retroItems', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  })
  await incrementSessionVersion(sessionCode)
}

export async function deleteRetroItem(
  sessionCode: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const docRef = doc(db, 'sessions', sessionCode, 'retroItems', id)
  await deleteDoc(docRef)
  await incrementSessionVersion(sessionCode)
}

export async function voteRetroItem(
  sessionCode: string,
  itemId: string,
  voterId: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const docRef = doc(db, 'sessions', sessionCode, 'retroItems', itemId)
  await updateDoc(docRef, {
    voterIds: arrayUnion(voterId),
    updatedAt: Timestamp.fromDate(new Date()),
  })
  await incrementSessionVersion(sessionCode)
}

export async function unvoteRetroItem(
  sessionCode: string,
  itemId: string,
  voterId: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const docRef = doc(db, 'sessions', sessionCode, 'retroItems', itemId)
  await updateDoc(docRef, {
    voterIds: arrayRemove(voterId),
    updatedAt: Timestamp.fromDate(new Date()),
  })
  await incrementSessionVersion(sessionCode)
}

export async function importRetroItems(
  sessionCode: string,
  items: RetroItem[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  await clearAllRetroItems(sessionCode)
  const batch = writeBatch(db)
  items.forEach((item) => {
    const docRef = doc(db, 'sessions', sessionCode, 'retroItems', item.id)
    batch.set(docRef, {
      columnId: item.columnId,
      title: item.title,
      description: item.description,
      tags: item.tags || [],
      voterIds: item.voterIds || [],
      createdAt: Timestamp.fromDate(item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt)),
      updatedAt: Timestamp.fromDate(new Date()),
    })
  })
  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function clearAllRetroItems(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const colRef = collection(db, 'sessions', sessionCode, 'retroItems')
  const snapshot = await getDocs(colRef)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

// ── Retro Columns ──

function getRetroColumnsCollection(sessionCode: string) {
  const db = getFirebaseDb()
  if (!db) return null
  return collection(db, 'sessions', sessionCode, 'retroColumns')
}

export async function getRetroColumns(sessionCode: string): Promise<RetroColumn[]> {
  const colRef = getRetroColumnsCollection(sessionCode)
  if (!colRef) return []
  const q = query(colRef, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => {
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
}

export async function addRetroColumn(
  sessionCode: string,
  data: RetroColumnFormData,
  order: number
): Promise<RetroColumn> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')
  const id = uuidv4()
  const now = new Date()
  const column: RetroColumn = {
    id,
    name: data.name,
    color: data.color,
    order,
    createdAt: now,
    updatedAt: now,
  }
  const docRef = doc(db, 'sessions', sessionCode, 'retroColumns', id)
  await setDoc(docRef, {
    name: data.name,
    color: data.color,
    order,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  })
  await incrementSessionVersion(sessionCode)
  return column
}

export async function updateRetroColumn(
  sessionCode: string,
  id: string,
  data: Partial<RetroColumnFormData>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const docRef = doc(db, 'sessions', sessionCode, 'retroColumns', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  })
  await incrementSessionVersion(sessionCode)
}

export async function deleteRetroColumn(
  sessionCode: string,
  id: string
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const docRef = doc(db, 'sessions', sessionCode, 'retroColumns', id)
  await deleteDoc(docRef)
  await incrementSessionVersion(sessionCode)
}

export async function importRetroColumns(
  sessionCode: string,
  columns: RetroColumn[]
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  await clearAllRetroColumns(sessionCode)
  const batch = writeBatch(db)
  columns.forEach((col) => {
    const docRef = doc(db, 'sessions', sessionCode, 'retroColumns', col.id)
    batch.set(docRef, {
      name: col.name,
      color: col.color,
      order: col.order,
      createdAt: Timestamp.fromDate(col.createdAt instanceof Date ? col.createdAt : new Date(col.createdAt)),
      updatedAt: Timestamp.fromDate(new Date()),
    })
  })
  await batch.commit()
  await incrementSessionVersion(sessionCode)
}

export async function clearAllRetroColumns(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const colRef = collection(db, 'sessions', sessionCode, 'retroColumns')
  const snapshot = await getDocs(colRef)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
