import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

/** Região das HTTPS callable Functions (igual a `REGION` em `functions/src/index.ts`). */
export const FUNCTIONS_REGION =
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION ?? 'southamerica-east1'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export function getFirebaseFunctions() {
  return getFunctions(app, FUNCTIONS_REGION)
}

/** Analytics só no browser e se `measurementId` estiver definido. */
export async function initAnalytics() {
  if (typeof window === 'undefined') return null
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return null
  if (!(await isSupported())) return null
  return getAnalytics(app)
}
