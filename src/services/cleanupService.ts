import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

/**
 * Cleans up expired sessions from Firestore.
 * This runs client-side when users load the app.
 * Limited to cleaning up 10 sessions at a time to avoid performance issues.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const db = getFirebaseDb()
  if (!db) return 0

  try {
    const now = Timestamp.fromDate(new Date())
    const sessionsRef = collection(db, 'sessions')
    const expiredQuery = query(
      sessionsRef,
      where('expiresAt', '<', now)
    )

    const snapshot = await getDocs(expiredQuery)

    if (snapshot.empty) {
      return 0
    }

    // Limit cleanup to 10 sessions at a time to avoid blocking
    const sessionsToDelete = snapshot.docs.slice(0, 10)
    let deletedCount = 0

    for (const sessionDoc of sessionsToDelete) {
      const sessionCode = sessionDoc.id

      // Delete capabilities subcollection
      const capabilitiesRef = collection(db, 'sessions', sessionCode, 'capabilities')
      const capSnapshot = await getDocs(capabilitiesRef)
      for (const capDoc of capSnapshot.docs) {
        await deleteDoc(capDoc.ref)
      }

      // Delete strategies subcollection
      const strategiesRef = collection(db, 'sessions', sessionCode, 'strategies')
      const stratSnapshot = await getDocs(strategiesRef)
      for (const stratDoc of stratSnapshot.docs) {
        await deleteDoc(stratDoc.ref)
      }

      // Delete gamePlans subcollection
      const gamePlansRef = collection(db, 'sessions', sessionCode, 'gamePlans')
      const gamePlanSnapshot = await getDocs(gamePlansRef)
      for (const gamePlanDoc of gamePlanSnapshot.docs) {
        await deleteDoc(gamePlanDoc.ref)
      }

      // Delete the session document
      await deleteDoc(doc(db, 'sessions', sessionCode))
      deletedCount++
    }

    console.log(`Cleaned up ${deletedCount} expired sessions`)
    return deletedCount
  } catch (error) {
    // Silently fail - cleanup is not critical
    console.error('Cleanup error:', error)
    return 0
  }
}
