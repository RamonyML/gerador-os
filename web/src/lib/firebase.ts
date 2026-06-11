import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

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
export const storage = getStorage(app)

/** Liga aos emuladores locais quando `VITE_USE_FIREBASE_EMULATORS=true`. */
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(storage, '127.0.0.1', 9199)
}

export function getFirebaseFunctions() {
  const functions = getFunctions(app, FUNCTIONS_REGION)
  if (useEmulators) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  }
  return functions
}

/** Analytics só no browser e se `measurementId` estiver definido. */
export async function initAnalytics() {
  if (typeof window === 'undefined') return null
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return null
  if (!(await isSupported())) return null
  return getAnalytics(app)
}
