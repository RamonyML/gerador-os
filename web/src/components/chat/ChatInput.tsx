import { useRef, useState } from 'react'
import { Box, IconButton, InputBase, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { ReplyRef } from '../../types/chat'

type Props = {
  onSend: (text: string, replyTo?: ReplyRef) => void
  onTypingChange?: (isTyping: boolean) => void
  disabled?: boolean
  replyTo?: ReplyRef | null
  onCancelReply?: () => void
}

export function ChatInput({ onSend, onTypingChange, disabled = false, replyTo, onCancelReply }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [text, setText] = useState('')
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setText(e.target.value)
    if (!onTypingChange) return
    onTypingChange(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => onTypingChange(false), 3000)
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    onTypingChange?.(false)
    onSend(trimmed, replyTo ?? undefined)
    setText('')
    onCancelReply?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const primary = theme.palette.primary.main

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
      {/* Preview de resposta */}
      {replyTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.625,
            bgcolor: isDark ? alpha(primary, 0.1) : alpha(primary, 0.06),
            borderBottom: 1,
            borderColor: alpha(primary, 0.2),
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              pl: 0.75,
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              borderRadius: '2px 0 0 2px',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', lineHeight: 1.3, fontSize: 10 }}>
              {replyTo.senderName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {replyTo.text}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onCancelReply} sx={{ p: 0.25, color: 'text.disabled', flexShrink: 0 }}>
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      {/* Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0.5,
          px: 1,
          py: 0.75,
        }}
      >
        <InputBase
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Mensagem…"
          multiline
          maxRows={3}
          disabled={disabled}
          sx={{
            flex: 1,
            px: 1.25,
            py: 0.625,
            borderRadius: 2.5,
            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
            fontSize: '0.8125rem',
            '& textarea': { resize: 'none' },
          }}
        />
        <IconButton
          size="small"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          color="primary"
          sx={{ mb: 0.25, flexShrink: 0 }}
        >
          <SendRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  )
}
