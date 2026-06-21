import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { setPresence, subscribePresence } from '../lib/presenceFirestore'
import { getChatId, markAsRead, subscribeMyChats } from '../lib/chatFirestore'
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
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, profile, photoURL } = useAuth()
  const [myStatus, setMyStatusState] = useState<UserStatus>('online')
  const [presence, setPresenceData] = useState<UserPresence[]>([])
  const [openConversations, setOpenConversations] = useState<OpenConv[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [isWidgetOpen, setWidgetOpen] = useState(false)
  const statusRef = useRef<UserStatus>('online')

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
    const handleVisibility = () => {
      pushPresence(document.hidden ? 'offline' : statusRef.current)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibility)
      pushPresence('offline')
    }
  }, [user?.uid, profile?.displayName])  // eslint-disable-line react-hooks/exhaustive-deps

  // Assinar presença de todos os usuários
  useEffect(() => {
    if (!user) return
    return subscribePresence((all) => {
      setPresenceData(all.filter((u) => u.uid !== user.uid))
    })
  }, [user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  // Assinar chats do usuário
  useEffect(() => {
    if (!user) return
    return subscribeMyChats(user.uid, setChats)
  }, [user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

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
