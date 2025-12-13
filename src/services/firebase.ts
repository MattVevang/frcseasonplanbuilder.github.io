import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function initializeFirebase(): { app: FirebaseApp; db: Firestore } | null {
  // Check if Firebase is configured
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase not configured. Running in local-only mode.')
    return null
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }

  return { app, db: db! }
}

export function getFirebaseDb(): Firestore | null {
  if (!db) {
    const result = initializeFirebase()
    return result?.db ?? null
  }
  return db
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}
