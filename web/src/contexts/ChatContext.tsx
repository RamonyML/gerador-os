import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { db } from '../lib/firebase'
import { setPresence, subscribePresence } from '../lib/presenceFirestore'
import { getChatId, markAsRead, subscribeMyChats } from '../lib/chatFirestore'
import { subscribeUsersPublic, type PublicProfile } from '../lib/usersPublic'
import type { Chat, UserPresence, UserStatus } from '../types/chat'

type OpenConv = { uid: string; chatId: string }

type ChatContextValue = {
  myStatus: UserStatus
  setMyStatus: (s: UserStatus) => void
  presence: UserPresence[]
  openConversations: OpenConv[]
  openChat: (otherUid: string) => void
  closeChat: (otherUid: string) => void
  chats: Chat[]
  totalUnread: number
  isWidgetOpen: boolean
  setWidgetOpen: (v: boolean) => void
  activeConvUid: string | null
  setActiveConvUid: (uid: string | null) => void
}

const STALE_MS     = 3 * 60 * 1000  // considera offline após 3 min sem heartbeat
const HEARTBEAT_MS = 60 * 1000      // escreve presença a cada 1 min
const AWAY_AFTER_MS = 5 * 60 * 1000 // marca ausente após 5 min com aba oculta

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, profile, photoURL } = useAuth()
  const [myStatus, setMyStatusState] = useState<UserStatus>('online')
  const [presenceRaw, setPresenceRaw] = useState<UserPresence[]>([])
  const [directory, setDirectory] = useState<Record<string, PublicProfile>>({})
  const [openConversations, setOpenConversations] = useState<OpenConv[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [isWidgetOpen, setWidgetOpen] = useState(false)
  const [activeConvUid, setActiveConvUid] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const statusRef = useRef<UserStatus>('online')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevChatsRef = useRef<Chat[]>([])
  const chatInitializedRef = useRef(false)
  const isWidgetOpenRef = useRef(false)
  const activeConvUidRef = useRef<string | null>(null)
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasVisibilityForcedRef = useRef(false)
  const setMyStatusRef = useRef<(s: UserStatus) => void>(() => {})

  const pushPresence = useCallback(
    (status: UserStatus) => {
      if (!user || !profile) return
      const displayName = profile.displayName?.trim() || user.email || ''
      void setPresence(user.uid, status, displayName, photoURL, profile.sector)
    },
    [user, profile, photoURL],
  )

  const setMyStatus = useCallback(
    (s: UserStatus) => {
      statusRef.current = s
      setMyStatusState(s)
      pushPresence(s)
    },
    [pushPresence],
  )

  // Mantém ref atualizada para uso em efeitos com deps mínimas
  useEffect(() => { setMyStatusRef.current = setMyStatus }, [setMyStatus])

  // Presença: online ao logar, offline ao fechar/esconder aba
  useEffect(() => {
    if (!user || !profile) return
    pushPresence('online')

    const handleBeforeUnload = () => pushPresence('offline')
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      pushPresence('offline')
    }
  }, [user?.uid, profile?.displayName])  // eslint-disable-line react-hooks/exhaustive-deps

  // Heartbeat: renova presença a cada 60s para não ficar stale
  useEffect(() => {
    if (!user || !profile) return
    const id = setInterval(() => pushPresence(statusRef.current), HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [user?.uid, profile?.displayName])  // eslint-disable-line react-hooks/exhaustive-deps

  // Tick: força reavaliação de staleness a cada 60s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [])

  // Visibilidade: ausente após 5 min com aba oculta, online ao voltar
  useEffect(() => {
    if (!user) return
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        visibilityTimerRef.current = setTimeout(() => {
          if (statusRef.current === 'online') {
            wasVisibilityForcedRef.current = true
            setMyStatusRef.current('em_pausa')
          }
        }, AWAY_AFTER_MS)
      } else {
        if (visibilityTimerRef.current) {
          clearTimeout(visibilityTimerRef.current)
          visibilityTimerRef.current = null
        }
        if (wasVisibilityForcedRef.current) {
          wasVisibilityForcedRef.current = false
          setMyStatusRef.current('online')
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current)
    }
  }, [user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  // Assinar diretório público (todos os usuários, mesmo antes do 1º login)
  useEffect(() => {
    if (!user) return
    return subscribeUsersPublic(db, setDirectory)
  }, [user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  // Assinar presença em tempo real (status online/offline/ausente)
  useEffect(() => {
    if (!user) return
    return subscribePresence((all) => {
      setPresenceRaw(all.filter((u) => u.uid !== user.uid))
    })
  }, [user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  // Mescla diretório público com presença: todos aparecem, presença sobrescreve status e sector
  // tick como dep força reavaliação de staleness a cada minuto sem novo snapshot do Firestore
  const presence = useMemo<UserPresence[]>(() => {
    const now = Date.now()
    const presenceMap = new Map(presenceRaw.map((p) => [p.uid, p]))
    return Object.entries(directory)
      .filter(([uid]) => uid !== user?.uid)
      .map(([uid, pub]) => {
        const pres = presenceMap.get(uid)
        if (pres) {
          const stale = now - pres.updatedAt.getTime() > STALE_MS
          const effectiveStatus: UserStatus = stale ? 'offline' : pres.status
          return { ...pres, status: effectiveStatus, sector: pres.sector || pub.sector }
        }
        return {
          uid,
          displayName: pub.displayName ?? '',
          photoURL: pub.photoURL,
          status: 'offline' as UserStatus,
          sector: pub.sector,
          updatedAt: new Date(0),
        }
      })
  }, [directory, presenceRaw, user?.uid, tick])  // eslint-disable-line react-hooks/exhaustive-deps

  // Mantém refs sincronizadas para leitura dentro de efeitos sem re-disparar
  useEffect(() => { isWidgetOpenRef.current = isWidgetOpen }, [isWidgetOpen])
  useEffect(() => { activeConvUidRef.current = activeConvUid }, [activeConvUid])

  // Inicializa áudio e desbloqueia o contexto de áudio no primeiro gesto do usuário
  // (browsers bloqueiam audio.play() até haver uma interação na página)
  useEffect(() => {
    const audio = new Audio('/sound/notification.mp3')
    audio.volume = 0.6
    audioRef.current = audio

    const unlock = () => {
      void audio.play().then(() => { audio.pause(); audio.currentTime = 0 }).catch(() => {})
      if (Notification.permission === 'default') void Notification.requestPermission()
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('click', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Assinar chats do usuário
  useEffect(() => {
    if (!user) return
    return subscribeMyChats(user.uid, (incoming) => {
      setChats(incoming)
    })
  }, [user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  // Detecta novas mensagens e toca som
  useEffect(() => {
    if (!user) return

    // Ignora o snapshot inicial para não tocar som em mensagens antigas
    if (!chatInitializedRef.current) {
      chatInitializedRef.current = true
      prevChatsRef.current = chats
      return
    }

    let shouldPlay = false
    let notifSender = ''
    let notifText = ''

    for (const chat of chats) {
      const myUnread = chat.unreadCount[user.uid] ?? 0
      const prev = prevChatsRef.current.find((c) => c.id === chat.id)
      const prevUnread = prev ? (prev.unreadCount[user.uid] ?? 0) : 0

      if (myUnread > prevUnread) {
        const otherUid = chat.participants.find((p) => p !== user.uid) ?? ''
        const isViewing = isWidgetOpenRef.current && activeConvUidRef.current === otherUid
        if (!isViewing) {
          shouldPlay = true
          notifSender = directory[otherUid]?.displayName ?? 'Nova mensagem'
          notifText = chat.lastMessage
          break
        }
      }
    }

    if (shouldPlay && audioRef.current) {
      audioRef.current.currentTime = 0
      void audioRef.current.play().catch(() => {})
    }

    if (shouldPlay && notifSender && Notification.permission === 'granted' && document.visibilityState === 'hidden') {
      new Notification(notifSender, { body: notifText, icon: '/favicon.ico' })
    }

    prevChatsRef.current = chats
  }, [chats]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalUnread = chats.reduce(
    (acc, c) => acc + (c.unreadCount[user?.uid ?? ''] ?? 0),
    0,
  )

  // Badge na aba do navegador
  useEffect(() => {
    const base = 'Gerador de O.S.'
    document.title = totalUnread > 0 ? `(${totalUnread}) ${base}` : base
  }, [totalUnread])

  const openChat = useCallback(
    (otherUid: string) => {
      if (!user) return
      const chatId = getChatId(user.uid, otherUid)
      setOpenConversations((prev) => {
        if (prev.find((c) => c.uid === otherUid)) return prev
        // Máximo 2 conversas abertas simultaneamente
        return [...prev.slice(-1), { uid: otherUid, chatId }]
      })
      void markAsRead(chatId, user.uid)
      setWidgetOpen(true)
    },
    [user],
  )

  const closeChat = useCallback((otherUid: string) => {
    setOpenConversations((prev) => prev.filter((c) => c.uid !== otherUid))
  }, [])

  return (
    <ChatContext.Provider
      value={{
        myStatus,
        setMyStatus,
        presence,
        openConversations,
        openChat,
        closeChat,
        chats,
        totalUnread,
        isWidgetOpen,
        setWidgetOpen,
        activeConvUid,
        setActiveConvUid,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
