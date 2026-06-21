import { useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import type { ChatMessage } from '../../types/chat'

type Props = {
  messages: ChatMessage[]
  myUid: string
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessages({ messages, myUid }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const primary = theme.palette.primary.main
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Nenhuma mensagem ainda. Diga olá!
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 1.5,
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {messages.map((msg) => {
        const isMine = msg.senderId === myUid
        return (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMine ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '80%',
                px: 1.25,
                py: 0.625,
                borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                bgcolor: isMine
                  ? primary
                  : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06)),
                color: isMine ? '#fff' : 'text.primary',
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.45, wordBreak: 'break-word' }}>
                {msg.text}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 0.25, px: 0.5, fontSize: 10 }}
            >
              {formatTime(msg.createdAt)}
            </Typography>
          </Box>
        )
      })}
      <div ref={bottomRef} />
    </Box>
  )
}
