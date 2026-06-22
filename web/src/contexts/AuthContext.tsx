import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { parseUserProfile, type UserProfile } from '../types/profile'
import { upsertMyPublicProfile } from '../lib/usersPublic'

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  profileMissing: boolean
  initializing: boolean
  /** Foto de perfil atual (Firebase Auth `photoURL`). */
  photoURL: string | null
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  /** Recarrega o usuário do Auth (ex.: após atualizar a foto de perfil). */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [photoURL, setPhotoURL] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      setPhotoURL(nextUser?.photoURL ?? null)
      if (!nextUser) {
        setProfile(null)
        setInitializing(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', nextUser.uid))
        if (!snap.exists()) {
          setProfile(null)
          return
        }
        const parsed = parseUserProfile(snap.data() as Record<string, unknown>)
        setProfile(parsed)
        const publicName =
          parsed?.displayName?.trim() ||
          nextUser.displayName ||
          nextUser.email?.split('@')[0] ||
          null
        void upsertMyPublicProfile(db, nextUser.uid, {
          displayName: publicName,
          photoURL: nextUser.photoURL ?? null,
          sector: parsed?.sector ?? '',
          hierarchy: parsed?.hierarchy ?? '',
        }).catch(() => {
          /* cartão público é best-effort; ignora falha */
        })
      } finally {
        setInitializing(false)
      }
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password)
  }, [])

  const logOut = useCallback(async () => {
    await signOut(auth)
  }, [])

  const refreshUser = useCallback(async () => {
    const current = auth.currentUser
    if (!current) return
    await current.reload()
    setUser(auth.currentUser)
    setPhotoURL(auth.currentUser?.photoURL ?? null)
  }, [])

  const profileMissing = user !== null && profile === null

  const value = useMemo(
    () => ({
      user,
      profile,
      profileMissing,
      initializing,
      photoURL,
      signIn,
      logOut,
      refreshUser,
    }),
    [user, profile, profileMissing, initializing, photoURL, signIn, logOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
