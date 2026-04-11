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

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  profileMissing: boolean
  initializing: boolean
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
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

  const profileMissing = user !== null && profile === null

  const value = useMemo(
    () => ({
      user,
      profile,
      profileMissing,
      initializing,
      signIn,
      logOut,
    }),
    [user, profile, profileMissing, initializing, signIn, logOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
