import { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { Undo2 } from 'lucide-react'
import type { ChatMessage } from '../../types/chat'

type Props = {
  messages: ChatMessage[]
  myUid: string
  otherRead?: boolean
  onReply?: (msg: ChatMessage) => void
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

export function ChatMessages({ messages, myUid, otherRead = false, onReply }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const primary = theme.palette.primary.main
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
  }

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  const lastMineIndex = messages.reduce((acc, msg, i) => msg.senderId === myUid ? i : acc, -1)

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
    <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: '100%',
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
        const showTime = !groupedWithNext
        const isHovered = hoveredId === msg.id

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
          <Box
            key={msg.id}
            sx={{ mt: groupedWithPrev ? 0.25 : 0 }}
            onMouseEnter={() => setHoveredId(msg.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {showDateSep && <DateSeparator label={formatDateLabel(msg.createdAt)} />}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Linha da bolha + botão reply */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  flexDirection: isMine ? 'row-reverse' : 'row',
                  maxWidth: '90%',
                }}
              >
                {/* Botão reply — aparece no hover */}
                {onReply && (
                  <Tooltip title="Responder" placement={isMine ? 'left' : 'right'}>
                    <IconButton
                      size="small"
                      onClick={() => onReply(msg)}
                      sx={{
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.15s',
                        p: 0.375,
                        color: 'text.secondary',
                        flexShrink: 0,
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      <Undo2 size={14} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Bolha */}
                <Box
                  sx={{
                    maxWidth: '100%',
                    px: 1.25,
                    py: 0.625,
                    borderRadius: br,
                    bgcolor: isMine
                      ? primary
                      : (isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06)),
                    color: isMine ? '#fff' : 'text.primary',
                  }}
                >
                  {/* Bloco de citação (reply) */}
                  {msg.replyTo && (
                    <Box
                      sx={{
                        mb: 0.5,
                        pl: 1,
                        borderLeft: '3px solid',
                        borderColor: isMine ? alpha('#fff', 0.5) : alpha(primary, 0.6),
                        borderRadius: '2px 6px 6px 2px',
                        bgcolor: isMine ? alpha('#000', 0.15) : alpha(primary, 0.07),
                        py: 0.25,
                        pr: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          display: 'block',
                          lineHeight: 1.3,
                          color: isMine ? alpha('#fff', 0.85) : 'primary.main',
                          fontSize: 10,
                        }}
                      >
                        {msg.replyTo.senderName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.35,
                          color: isMine ? alpha('#fff', 0.7) : 'text.secondary',
                          fontSize: 11,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.replyTo.text}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ lineHeight: 1.45, wordBreak: 'break-word', whiteSpace: 'pre-wrap', color: 'inherit' }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>

              {showTime && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, px: 0.5 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {formatTime(msg.createdAt)}
                  </Typography>
                  {isMine && index === lastMineIndex && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: otherRead ? primary : 'text.disabled',
                        lineHeight: 1,
                      }}
                    >
                      {otherRead ? '✓✓' : '✓'}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )
      })}
      <div ref={bottomRef} />
    </Box>

    {showScrollBtn && (
      <IconButton
        size="small"
        onClick={scrollToBottom}
        sx={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          boxShadow: 2,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    )}
    </Box>
  )
}
