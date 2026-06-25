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

function formatDateLabel(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (d.getTime() === today.getTime()) return 'Hoje'
  if (d.getTime() === yesterday.getTime()) return 'Ontem'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

const GROUP_GAP_MS = 2 * 60 * 1000

function sameGroup(a: ChatMessage, b: ChatMessage): boolean {
  return (
    a.senderId === b.senderId &&
    dayKey(a.createdAt) === dayKey(b.createdAt) &&
    Math.abs(a.createdAt.getTime() - b.createdAt.getTime()) < GROUP_GAP_MS
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      <Typography
        variant="caption"
        sx={{ fontSize: 10, fontWeight: 600, color: 'text.disabled', whiteSpace: 'nowrap', userSelect: 'none' }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  )
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
      {messages.map((msg, index) => {
        const isMine = msg.senderId === myUid
        const prevMsg = messages[index - 1]
        const nextMsg = messages[index + 1]
        const showDateSep = !prevMsg || dayKey(prevMsg.createdAt) !== dayKey(msg.createdAt)
        const groupedWithPrev = !showDateSep && !!prevMsg && sameGroup(msg, prevMsg)
        const groupedWithNext = !!nextMsg && sameGroup(msg, nextMsg)
        // Mostra timestamp apenas na última mensagem do grupo (ou mensagem solo)
        const showTime = !groupedWithNext

        // Raio da bolha: remove o "rabo" em mensagens intermediárias do grupo
        const br = isMine
          ? (groupedWithPrev && groupedWithNext ? '12px 4px 4px 12px'
            : groupedWithPrev ? '12px 4px 2px 12px'
            : groupedWithNext ? '12px 12px 4px 12px'
            : '12px 12px 2px 12px')
          : (groupedWithPrev && groupedWithNext ? '4px 12px 12px 4px'
            : groupedWithPrev ? '4px 12px 12px 2px'
            : groupedWithNext ? '12px 12px 4px 4px'
            : '12px 12px 12px 2px')

        return (
          <Box key={msg.id} sx={{ mt: groupedWithPrev ? 0.25 : 0 }}>
            {showDateSep && <DateSeparator label={formatDateLabel(msg.createdAt)} />}
            <Box
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
                  borderRadius: br,
                  bgcolor: isMine
                    ? primary
                    : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06)),
                  color: isMine ? '#fff' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.45, wordBreak: 'break-word', color: 'inherit' }}>
                  {msg.text}
                </Typography>
              </Box>
              {showTime && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ mt: 0.25, px: 0.5, fontSize: 10 }}
                >
                  {formatTime(msg.createdAt)}
                </Typography>
              )}
            </Box>
          </Box>
        )
      })}
      <div ref={bottomRef} />
    </Box>
  )
}
