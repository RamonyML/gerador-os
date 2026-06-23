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
  const statusRef = useRef<UserStatus>('online')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevChatsRef = useRef<Chat[]>([])
  const chatInitializedRef = useRef(false)
  const isWidgetOpenRef = useRef(false)
  const activeConvUidRef = useRef<string | null>(null)

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
  const presence = useMemo<UserPresence[]>(() => {
    const presenceMap = new Map(presenceRaw.map((p) => [p.uid, p]))
    return Object.entries(directory)
      .filter(([uid]) => uid !== user?.uid)
      .map(([uid, pub]) => {
        const pres = presenceMap.get(uid)
        if (pres) {
          return { ...pres, sector: pres.sector || pub.sector }
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
  }, [directory, presenceRaw, user?.uid])

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
    return subscribeMyChats(user.uid, setChats)
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
    for (const chat of chats) {
      const myUnread = chat.unreadCount[user.uid] ?? 0
      const prev = prevChatsRef.current.find((c) => c.id === chat.id)
      const prevUnread = prev ? (prev.unreadCount[user.uid] ?? 0) : 0

      if (myUnread > prevUnread) {
        const otherUid = chat.participants.find((p) => p !== user.uid) ?? null
        // Não toca se o usuário está olhando exatamente essa conversa
        const isViewing = isWidgetOpenRef.current && activeConvUidRef.current === otherUid
        if (!isViewing) {
          shouldPlay = true
          break
        }
      }
    }

    if (shouldPlay && audioRef.current) {
      audioRef.current.currentTime = 0
      void audioRef.current.play().catch(() => {})
    }

    prevChatsRef.current = chats
  }, [chats]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalUnread = chats.reduce(
    (acc, c) => acc + (c.unreadCount[user?.uid ?? ''] ?? 0),
    0,
  )

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
