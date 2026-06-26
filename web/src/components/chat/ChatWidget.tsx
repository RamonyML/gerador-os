import { useEffect, useState } from 'react'
import { Badge, Box, IconButton, Paper, Slide, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { STATUS_CONFIG } from '../../types/chat'
import type { UserPresence } from '../../types/chat'
import { useTodaysBirthdays } from '../../hooks/useTodaysBirthdays'
import { ChatStatusMenu } from './ChatStatusMenu'
import { ChatUserList } from './ChatUserList'
import { ChatConversation } from './ChatConversation'

export function ChatWidget() {
  const { user, profile } = useAuth()
  const { isWidgetOpen, setWidgetOpen, totalUnread, myStatus, presence, openChat, closeChat, activeConvUid, setActiveConvUid } = useChat()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const primary = theme.palette.primary.main

  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null)
  const todaysBirthdays = useTodaysBirthdays()
  const [birthdayDismissed, setBirthdayDismissed] = useState(false)

  // Reaparece toda vez que o chat é aberto
  useEffect(() => {
    if (isWidgetOpen) setBirthdayDismissed(false)
  }, [isWidgetOpen])

  // Se o usuário não está autenticado, não renderiza
  if (!user || !profile) return null

  const myCfg = STATUS_CONFIG[myStatus]

  const activeOther: UserPresence | null = activeConvUid
    ? (presence.find((p) => p.uid === activeConvUid) ?? {
        uid: activeConvUid,
        displayName: '…',
        photoURL: null,
        status: 'offline' as const,
        sector: '',
        updatedAt: new Date(),
      })
    : null

  const handleSelectUser = (uid: string) => {
    openChat(uid)
    setActiveConvUid(uid)
  }

  const handleBack = () => {
    if (activeConvUid) closeChat(activeConvUid)
    setActiveConvUid(null)
  }

  const handleClose = () => {
    setWidgetOpen(false)
    setActiveConvUid(null)
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: (t) => t.zIndex.modal - 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {/* Painel expansível */}
      <Slide direction="up" in={isWidgetOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            width: 320,
            height: 460,
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {/* Header do painel */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha(primary, 0.04),
              flexShrink: 0,
            }}
          >
            <ChatRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
              Chat Interno
            </Typography>

            {/* Indicador + seletor de status */}
            <Tooltip title={`Status: ${myCfg.label}`}>
              <Box
                onClick={(e) => setStatusAnchor(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.375,
                  borderRadius: 999,
                  border: 1,
                  borderColor: alpha(myCfg.color, 0.4),
                  bgcolor: alpha(myCfg.color, isDark ? 0.15 : 0.08),
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: alpha(myCfg.color, 0.2) },
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: myCfg.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: myCfg.color, fontWeight: 600, fontSize: 11 }}>
                  {myCfg.label}
                </Typography>
              </Box>
            </Tooltip>

            <IconButton size="small" onClick={handleClose} aria-label="Fechar chat">
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Banner de aniversariante(s) do dia */}
          {todaysBirthdays.length > 0 && !birthdayDismissed && (
            <Box
              sx={{
                px: 1.5,
                pt: 0.875,
                pb: 0.75,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.75,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: isDark ? alpha('#f59e0b', 0.12) : alpha('#fef3c7', 0.9),
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: 16, lineHeight: 1, mt: 0.125 }}>🎂</Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, color: isDark ? '#fcd34d' : '#92400e', fontSize: 12, lineHeight: 1.3 }}>
                  {todaysBirthdays.map((u) => u.displayName ?? 'Alguém').join(' e ')}
                  {todaysBirthdays.length === 1 ? ' faz aniversário hoje!' : ' fazem aniversário hoje!'}
                </Typography>
                <Typography sx={{ fontSize: 11, color: isDark ? alpha('#fcd34d', 0.75) : '#a16207', mt: 0.25, lineHeight: 1.3 }}>
                  Que tal abrir a conversa e mandar um parabéns? 🎉
                </Typography>
              </Box>
              <Tooltip title="Fechar">
                <IconButton
                  size="small"
                  onClick={() => setBirthdayDismissed(true)}
                  sx={{ color: isDark ? '#fcd34d' : '#a16207', p: 0.25, mt: -0.25 }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Conteúdo: conversa ativa ou lista de usuários */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeOther ? (
              <ChatConversation
                other={activeOther}
                onBack={handleBack}
              />
            ) : (
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <ChatUserList onSelectUser={handleSelectUser} />
              </Box>
            )}
          </Box>
        </Paper>
      </Slide>

      {/* Botão FAB flutuante */}
      <Tooltip title={isWidgetOpen ? 'Fechar chat' : 'Abrir chat'} placement="left">
        <Box
          onClick={() => { if (isWidgetOpen) handleClose(); else setWidgetOpen(true) }}
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'scale(1.08)', boxShadow: 6 },
            position: 'relative',
          }}
        >
          {/* Dot de status próprio no FAB */}
          <Box
            sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              width: 11,
              height: 11,
              borderRadius: '50%',
              bgcolor: myCfg.color,
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          />
          <Badge
            badgeContent={totalUnread > 0 ? totalUnread : undefined}
            color="error"
            max={99}
            sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16, top: -2, right: -2 } }}
          >
            <ChatRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Badge>
        </Box>
      </Tooltip>

      <ChatStatusMenu anchorEl={statusAnchor} onClose={() => setStatusAnchor(null)} />
    </Box>
  )
}
