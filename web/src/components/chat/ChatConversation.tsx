import { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, IconButton, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { clearTyping, getChatId, markAsRead, sendMessage, setTyping, subscribeMessages, subscribeTyping } from '../../lib/chatFirestore'
import { STATUS_CONFIG } from '../../types/chat'
import type { ChatMessage, UserPresence } from '../../types/chat'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

type Props = {
  other: UserPresence
  onBack: () => void
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function ChatConversation({ other, onBack }: Props) {
  const { user, profile } = useAuth()
  useChat()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [otherTyping, setOtherTyping] = useState(false)

  const chatId = user ? getChatId(user.uid, other.uid) : ''
  const cfg = STATUS_CONFIG[other.status]

  useEffect(() => {
    if (!chatId) return
    return subscribeMessages(chatId, setMessages)
  }, [chatId])

  // Marca como lido ao abrir
  useEffect(() => {
    if (!chatId || !user) return
    void markAsRead(chatId, user.uid)
  }, [chatId, user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  // Assina status de digitação do outro
  useEffect(() => {
    if (!chatId) return
    return subscribeTyping(chatId, other.uid, setOtherTyping)
  }, [chatId, other.uid])

  // Limpa o indicador de digitação próprio ao desmontar
  useEffect(() => {
    if (!chatId || !user) return
    return () => { void clearTyping(chatId, user.uid) }
  }, [chatId, user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypingChange = useCallback((isTyping: boolean) => {
    if (!chatId || !user) return
    if (isTyping) void setTyping(chatId, user.uid)
    else void clearTyping(chatId, user.uid)
  }, [chatId, user?.uid])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (text: string) => {
    if (!user || !profile) return
    const senderName = profile.displayName?.trim() || user.email || 'Usuário'
    await sendMessage(chatId, user.uid, other.uid, senderName, text)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
        }}
      >
        <IconButton size="small" onClick={onBack} aria-label="Voltar">
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            src={other.photoURL ?? undefined}
            sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main' }}
          >
            {initialsFrom(other.displayName)}
          </Avatar>
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: cfg.color,
              border: '2px solid',
              borderColor: 'background.paper',
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
          />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {other.displayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: otherTyping ? 'primary.main' : cfg.color,
              fontStyle: otherTyping ? 'italic' : 'normal',
              transition: 'color 0.2s',
            }}
          >
            {otherTyping ? 'digitando...' : cfg.label}
          </Typography>
        </Box>
      </Box>

      {/* Mensagens */}
      <ChatMessages messages={messages} myUid={user?.uid ?? ''} />

      {/* Input */}
      <ChatInput onSend={(text) => void handleSend(text)} onTypingChange={handleTypingChange} />
    </Box>
  )
}
