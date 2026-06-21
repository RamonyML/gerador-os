import { useState } from 'react'
import { Box, IconButton, InputBase } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SendRoundedIcon from '@mui/icons-material/SendRounded'

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 0.5,
        px: 1,
        py: 0.75,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <InputBase
        value={text}
        onChange={(e) => setText(e.target.value)}
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
  )
}
