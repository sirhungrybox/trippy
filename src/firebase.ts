import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, where, deleteDoc, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null
let googleProvider: GoogleAuthProvider | null = null

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
}

// Auth
export async function signInWithGoogle() {
  if (!auth || !googleProvider) throw new Error('Firebase not configured')
  return signInWithPopup(auth, googleProvider)
}

export async function logOut() {
  if (!auth) return
  return signOut(auth)
}

export function onAuth(callback: (user: User | null) => void) {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

// Firestore — Trips
export async function saveTrip(tripId: string, data: Record<string, unknown>) {
  if (!db) return
  await setDoc(doc(db, 'trips', tripId), data, { merge: true })
}

export async function loadTrip(tripId: string) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'trips', tripId))
  return snap.exists() ? snap.data() : null
}

export function subscribeTrip(tripId: string, callback: (data: Record<string, unknown> | null) => void) {
  if (!db) return () => {}
  return onSnapshot(doc(db, 'trips', tripId), (snap) => {
    callback(snap.exists() ? (snap.data() as Record<string, unknown>) : null)
  })
}

export async function loadUserTrips(userId: string) {
  if (!db) return []
  const q = query(collection(db, 'trips'), where('ownerId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function subscribeUserTrips(userId: string, callback: (trips: Record<string, unknown>[]) => void) {
  if (!db) return () => {}
  const q = query(collection(db, 'trips'), where('ownerId', '==', userId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function deleteTrip(tripId: string) {
  if (!db) return
  await deleteDoc(doc(db, 'trips', tripId))
}

export { auth, db }
