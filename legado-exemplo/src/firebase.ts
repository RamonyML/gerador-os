import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCHd3AxwHT9BVgWxJWrX2tOMH4TKKifMOM",
  authDomain: "mz-gerador.firebaseapp.com",
  projectId: "mz-gerador",
  storageBucket: "mz-gerador.appspot.com",
  messagingSenderId: "540125085029",
  appId: "1:540125085029:web:9ff4c3d01925850902358c",
  measurementId: "G-2MNWWQB287"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 