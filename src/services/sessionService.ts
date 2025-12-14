import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { Session } from '../types/session'

export async function getSession(sessionCode: string): Promise<Session | null> {
  const db = getFirebaseDb()
  if (!db) return null

  const sessionRef = doc(db, 'sessions', sessionCode)
  const snapshot = await getDoc(sessionRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()
  return {
    sessionCode: data.sessionCode,
    pinHash: data.pinHash || null,  // null for legacy sessions without PIN
    createdAt: data.createdAt?.toDate() || new Date(),
    lastModifiedAt: data.lastModifiedAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate() || new Date(),
    version: data.version || 0,
  }
}

export async function createSession(sessionCode: string, pinHash: string): Promise<Session> {
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not configured')
  }

  const now = new Date()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  const session: Session = {
    sessionCode,
    pinHash,
    createdAt: now,
    lastModifiedAt: now,
    expiresAt,
    version: 0,
  }

  const sessionRef = doc(db, 'sessions', sessionCode)
  await setDoc(sessionRef, {
    sessionCode,
    pinHash,
    createdAt: Timestamp.fromDate(now),
    lastModifiedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    version: 0,
  })

  return session
}

/**
 * Gets an existing session and refreshes its expiry.
 * Returns null if session doesn't exist (caller should redirect to HomePage for creation).
 * Note: createSession should be called from HomePage with a PIN.
 */
export async function getSessionAndRefresh(sessionCode: string): Promise<Session | null> {
  const existing = await getSession(sessionCode)
  if (existing) {
    // Refresh the expiry date on access
    await refreshSessionExpiry(sessionCode)
    return existing
  }
  return null
}

export async function refreshSessionExpiry(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const sessionRef = doc(db, 'sessions', sessionCode)
  await updateDoc(sessionRef, {
    lastModifiedAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  })
}

export async function incrementSessionVersion(sessionCode: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const session = await getSession(sessionCode)
  if (!session) return

  const sessionRef = doc(db, 'sessions', sessionCode)
  await updateDoc(sessionRef, {
    version: session.version + 1,
    lastModifiedAt: serverTimestamp(),
  })
}
