import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC5lVSPNUcIrsfPkZ63u5g7absL7s_H9Rk',
  authDomain: 'gerador-de-os-3ba02.firebaseapp.com',
  projectId: 'gerador-de-os-3ba02',
  storageBucket: 'gerador-de-os-3ba02.firebasestorage.app',
  messagingSenderId: '956727124260',
  appId: '1:956727124260:web:dcde5a7e7b55b3ce3713b1',
}

export const app = initializeApp(firebaseConfig)
export const auth = initializeAuth(app, { persistence: browserLocalPersistence })
export const db = getFirestore(app)
