import 'emoji-picker-element'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, IconButton, InputBase, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded'
import type { ReplyRef } from '../../types/chat'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'emoji-picker': {
        ref?: React.Ref<HTMLElement>
        class?: string
        style?: React.CSSProperties
        [k: string]: unknown
      }
    }
  }
}

type PickerProps = {
  isDark: boolean
  onSelect: (emoji: string) => void
  onClose: () => void
  excludeRef: React.RefObject<HTMLElement | null>
}

function EmojiPickerPopup({ isDark, onSelect, onClose, excludeRef }: PickerProps) {
  const pickerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = pickerRef.current
    if (!el) return
    const handler = (e: Event) => {
      const emoji = (e as CustomEvent<{ unicode: string }>).detail?.unicode
      if (emoji) onSelect(emoji)
    }
    el.addEventListener('emoji-click', handler)
    return () => el.removeEventListener('emoji-click', handler)
  }, [onSelect])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const insidePicker = pickerRef.current?.contains(target) ?? false
      const insideButton = excludeRef.current?.contains(target) ?? false
      if (!insidePicker && !insideButton) onClose()
    }
    // Adia um tick para não capturar o próprio clique que abriu o picker
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler) }
  }, [onClose, excludeRef])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <Box sx={{ position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 30, lineHeight: 0 }}>
      <emoji-picker
        ref={pickerRef as React.RefObject<HTMLElement>}
        class={isDark ? 'dark' : 'light'}
        style={{
          width: '100%',
          '--num-columns': '7',
          '--emoji-size': '1.375rem',
          '--border-radius': '0',
          '--border-color': 'var(--divider)',
        } as React.CSSProperties}
      />
    </Box>
  )
}

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
  const [showEmoji, setShowEmoji] = useState(false)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const textRef = useRef(text)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { textRef.current = text }, [text])

  const handleEmojiSelect = useCallback((emoji: string) => {
    const ta = inputRef.current
    const cur = textRef.current
    if (ta) {
      const start = ta.selectionStart ?? cur.length
      const end = ta.selectionEnd ?? cur.length
      setText(cur.slice(0, start) + emoji + cur.slice(end))
      requestAnimationFrame(() => {
        if (!inputRef.current) return
        const pos = start + emoji.length
        inputRef.current.setSelectionRange(pos, pos)
        inputRef.current.focus()
      })
    } else {
      setText(cur + emoji)
    }
  }, [])

  const handleEmojiClose = useCallback(() => setShowEmoji(false), [])

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
    setShowEmoji(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const primary = theme.palette.primary.main

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', position: 'relative' }}>
      {showEmoji && (
        <EmojiPickerPopup
          isDark={isDark}
          onSelect={handleEmojiSelect}
          onClose={handleEmojiClose}
          excludeRef={emojiBtnRef as React.RefObject<HTMLElement | null>}
        />
      )}

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

      {/* Input row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, px: 1, py: 0.75 }}>
        <IconButton
          ref={emojiBtnRef}
          size="small"
          onClick={() => setShowEmoji((v) => !v)}
          disabled={disabled}
          sx={{
            mb: 0.25,
            flexShrink: 0,
            color: showEmoji ? 'primary.main' : 'text.secondary',
            transition: 'color 0.15s',
          }}
          aria-label="Emojis"
        >
          <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <InputBase
          inputRef={inputRef}
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
