import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let db: ReturnType<typeof getFirestore> | null = null

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

export { db, isFirebaseConfigured }

const TRIP_DOC_ID = 'europe-summer-2026'

export async function saveToFirestore(collection: string, data: unknown) {
  if (!db) return
  try {
    await setDoc(doc(db, collection, TRIP_DOC_ID), { data, updatedAt: new Date().toISOString() })
  } catch (e) {
    console.error('Firestore save error:', e)
  }
}

export function subscribeToFirestore(collection: string, callback: (data: unknown) => void) {
  if (!db) return () => {}
  return onSnapshot(doc(db, collection, TRIP_DOC_ID), (snap) => {
    if (snap.exists()) {
      callback(snap.data().data)
    }
  })
}

export async function loadFromFirestore(collection: string) {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, collection, TRIP_DOC_ID))
    return snap.exists() ? snap.data().data : null
  } catch {
    return null
  }
}
