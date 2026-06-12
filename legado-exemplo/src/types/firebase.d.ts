import { FirebaseApp } from '@firebase/app';
import { Auth } from '@firebase/auth';
import { Firestore } from '@firebase/firestore';

declare global {
  interface Window {
    firebase: {
      app: FirebaseApp;
      auth: Auth;
      firestore: Firestore;
    };
  }
}

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: object;
  }
  export function initializeApp(options: object): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
  }
  export interface Auth {
    currentUser: User | null;
    onAuthStateChanged(observer: (user: User | null) => void): () => void;
  }
  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<any>;
  export function signOut(auth: Auth): Promise<void>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<any>;
  export function deleteUser(user: User): Promise<void>;
}

declare module 'firebase/firestore' {
  export interface Timestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
    toString(): string;
    valueOf(): string;
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
  }
  
  export interface DocumentData {
    [field: string]: any;
  }
  
  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T;
  }
  
  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    exists(): boolean;
    data(): T | undefined;
  }
  
  export interface Firestore {}
  
  export function getFirestore(app?: any): Firestore;
  export function collection(firestore: Firestore, path: string): any;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): any;
  export function getDoc(ref: any): Promise<DocumentSnapshot>;
  export function getDocs(query: any): Promise<{ docs: QueryDocumentSnapshot[] }>;
  export function addDoc(ref: any, data: any): Promise<{ id: string }>;
  export function updateDoc(ref: any, data: any): Promise<void>;
  export function deleteDoc(ref: any): Promise<void>;
  export function query(ref: any, ...queryConstraints: any[]): any;
  export function where(field: string, opStr: string, value: any): any;
  export function orderBy(field: string, directionStr?: string): any;
  export function limit(limit: number): any;
  export function startAfter(doc: any): any;
  export function serverTimestamp(): any;
  export function setDoc(ref: any, data: any, options?: { merge?: boolean }): Promise<void>;
}

declare module 'firebase' {
  export * from 'firebase/app';
  export * from 'firebase/auth';
  export * from 'firebase/firestore';
}

export {}; 