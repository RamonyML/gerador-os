import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { subscribeUsersPublic, type PublicProfile } from '../lib/usersPublic'
import type { Chat, ChatMessage } from '../types/chat'

const SECRET = 'docinho'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Ontem'
  if (days < 7) return date.toLocaleDateString('pt-BR', { weekday: 'short' })
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatFull(date: Date): string {
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// ── Password gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const attempt = () => {
    if (value.trim().toLowerCase() === SECRET) {
      onUnlock()
    } else {
      setError(true)
      setValue('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogContent sx={{ pt: 4, pb: 3, px: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockRoundedIcon sx={{ color: 'text.secondary' }} />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Área restrita</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Informe a palavra de segurança para acessar o histórico de conversas.
        </Typography>
        <TextField
          inputRef={inputRef}
          autoFocus
          fullWidth
          type="password"
          size="small"
          placeholder="Palavra de segurança"
          value={value}
          error={error}
          helperText={error ? 'Palavra incorreta. Tente novamente.' : ' '}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter') attempt() }}
          sx={{ mb: 1 }}
        />
        <Button fullWidth variant="contained" disableElevation onClick={attempt} disabled={!value.trim()}>
          Acessar
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DevChatAuditPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [unlocked, setUnlocked] = useState(false)

  const [usersMap, setUsersMap] = useState<Record<string, PublicProfile>>({})
  const [chats, setChats] = useState<Chat[]>([])
  const [chatsLoading, setChatsLoading] = useState(true)

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)

  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load users map
  useEffect(() => {
    if (!unlocked) return
    return subscribeUsersPublic(db, setUsersMap)
  }, [unlocked])

  // Load all chats
  useEffect(() => {
    if (!unlocked) return
    const q = query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'))
    return onSnapshot(q, (snap) => {
      const list: Chat[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>
        const raw = data.lastMessageAt as { toDate?: () => Date } | null
        return {
          id: d.id,
          participants: (data.participants as string[]) ?? [],
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageAt: raw?.toDate ? raw.toDate() : null,
          unreadCount: (data.unreadCount as Record<string, number>) ?? {},
        }
      })
      setChats(list)
      setChatsLoading(false)
    }, () => setChatsLoading(false))
  }, [unlocked])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChatId) { setMessages([]); return }
    setMsgsLoading(true)
    const q = query(
      collection(db, 'chats', selectedChatId, 'messages'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>
        const raw = data.createdAt as { toDate?: () => Date } | null
        return {
          id: d.id,
          senderId: typeof data.senderId === 'string' ? data.senderId : '',
          senderName: typeof data.senderName === 'string' ? data.senderName : '',
          text: typeof data.text === 'string' ? data.text : '',
          createdAt: raw?.toDate ? raw.toDate() : new Date(),
        }
      }))
      setMsgsLoading(false)
    })
  }, [selectedChatId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const nameOf = useCallback((uid: string) =>
    usersMap[uid]?.displayName ?? uid.slice(0, 8), [usersMap])

  const photoOf = useCallback((uid: string) =>
    usersMap[uid]?.photoURL ?? null, [usersMap])

  const chatLabel = (chat: Chat) =>
    chat.participants.map(nameOf).join(' ↔ ')

  const filtered = search.trim()
    ? chats.filter((c) => chatLabel(c).toLowerCase().includes(search.trim().toLowerCase()))
    : chats

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── Painel esquerdo: lista de conversas ── */}
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Auditoria de Conversas
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: 13 },
              },
            }}
          />
        </Box>

        {/* Lista */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {chatsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>Nenhuma conversa encontrada</Typography>
            </Box>
          ) : (
            filtered.map((chat) => {
              const isSelected = chat.id === selectedChatId
              return (
                <Box
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  sx={{
                    px: 1.5,
                    py: 1,
                    cursor: 'pointer',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)
                        : alpha(theme.palette.action.hover, 1),
                    },
                    transition: 'background 0.12s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, bgcolor: 'primary.main' }}>
                        {initials(nameOf(chat.participants[0] ?? ''))}
                      </Avatar>
                      <Avatar
                        src={photoOf(chat.participants[1] ?? '') ?? undefined}
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: 9,
                          fontWeight: 700,
                          bgcolor: 'secondary.main',
                          position: 'absolute',
                          bottom: -4,
                          right: -6,
                          border: '1.5px solid',
                          borderColor: 'background.paper',
                        }}
                      >
                        {initials(nameOf(chat.participants[1] ?? ''))}
                      </Avatar>
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.3, color: isSelected ? 'primary.main' : 'text.primary' }} noWrap>
                          {chat.participants.map(nameOf).join(' ↔ ')}
                        </Typography>
                        {chat.lastMessageAt && (
                          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', flexShrink: 0 }}>
                            {formatTime(chat.lastMessageAt)}
                          </Typography>
                        )}
                      </Box>
                      {chat.lastMessage && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1.2 }} noWrap>
                          {chat.lastMessage}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            })
          )}
        </Box>

        {/* Rodapé info */}
        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
            {chats.length} conversa{chats.length !== 1 ? 's' : ''} · área restrita dev
          </Typography>
        </Box>
      </Box>

      {/* ── Painel direito: mensagens ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedChat ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: 32 }}>💬</Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Selecione uma conversa para ver o histórico</Typography>
          </Box>
        ) : (
          <>
            {/* Header da conversa */}
            <Paper
              elevation={0}
              sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', borderRadius: 0, flexShrink: 0 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {selectedChat.participants.map(nameOf).join(' ↔ ')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {messages.length} mensagen{messages.length !== 1 ? 's' : ''}
                {selectedChat.lastMessageAt ? ` · última em ${formatFull(selectedChat.lastMessageAt)}` : ''}
              </Typography>
            </Paper>

            {/* Mensagens */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {msgsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', pt: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>Sem mensagens nesta conversa</Typography>
                </Box>
              ) : (
                messages.map((msg, i) => {
                  const prevMsg = messages[i - 1]
                  const showSender = !prevMsg || prevMsg.senderId !== msg.senderId
                  const showDate =
                    !prevMsg ||
                    prevMsg.createdAt.toDateString() !== msg.createdAt.toDateString()

                  return (
                    <Box key={msg.id}>
                      {showDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 1.5, gap: 1 }}>
                          <Divider sx={{ flex: 1 }} />
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, fontWeight: 600, px: 0.5 }}>
                            {msg.createdAt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                          </Typography>
                          <Divider sx={{ flex: 1 }} />
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          mt: showSender && !showDate ? 1 : 0,
                        }}
                      >
                        {showSender ? (
                          <Avatar
                            src={photoOf(msg.senderId) ?? undefined}
                            sx={{ width: 28, height: 28, fontSize: 10, fontWeight: 700, bgcolor: 'primary.main', mt: 0.25, flexShrink: 0 }}
                          >
                            {initials(msg.senderName)}
                          </Avatar>
                        ) : (
                          <Box sx={{ width: 28, flexShrink: 0 }} />
                        )}
                        <Box sx={{ maxWidth: '80%' }}>
                          {showSender && (
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 0.25 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12 }}>
                                {msg.senderName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
                                {formatFull(msg.createdAt)}
                              </Typography>
                            </Box>
                          )}
                          <Paper
                            variant="outlined"
                            sx={{
                              px: 1.25,
                              py: 0.625,
                              borderRadius: 1.5,
                              bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
                              borderColor: 'divider',
                              display: 'inline-block',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }}>
                              {msg.text}
                            </Typography>
                          </Paper>
                          {!showSender && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontSize: 10, mt: 0.125, ml: 0.5 }}>
                              {msg.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
