import { useState } from 'react'
import { Avatar, Badge, Box, Chip, IconButton, InputBase, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { STATUS_CONFIG, type UserPresence } from '../../types/chat'
import { SECTOR_LABELS, type Sector } from '../../types/profile'

function StatusDot({ color }: { color: string }) {
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: color,
        border: '2px solid',
        borderColor: 'background.paper',
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
    />
  )
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function formatLastTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function UserRow({ user: otherUser, onSelect }: { user: UserPresence; onSelect: (uid: string) => void }) {
  const { chats } = useChat()
  const { user } = useAuth()
  const theme = useTheme()
  const cfg = STATUS_CONFIG[otherUser.status]
  const chat = chats.find((c) => c.participants.includes(otherUser.uid))
  const unread = user ? (chat?.unreadCount[user.uid] ?? 0) : 0

  return (
    <Box
      onClick={() => onSelect(otherUser.uid)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 0.875,
        cursor: 'pointer',
        borderRadius: 2,
        mx: 0.75,
        transition: 'background 0.15s',
        bgcolor: unread > 0 ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05) : 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08),
        },
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Badge
          badgeContent={unread || undefined}
          color="error"
          overlap="circular"
          max={9}
          sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15, p: 0 } }}
        >
          <Avatar
            src={otherUser.photoURL ?? undefined}
            sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}
          >
            {initialsFrom(otherUser.displayName)}
          </Avatar>
        </Badge>
        <StatusDot color={cfg.color} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: unread > 0 ? 700 : 600, lineHeight: 1.3, flex: 1 }}
            noWrap
          >
            {otherUser.displayName}
          </Typography>
          {otherUser.sector && (
            <Chip
              label={SECTOR_LABELS[otherUser.sector as Sector] ?? otherUser.sector}
              size="small"
              sx={{
                height: 16,
                fontSize: 9,
                fontWeight: 700,
                flexShrink: 0,
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: 'primary.main',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          )}
          {chat?.lastMessageAt && (
            <Typography variant="caption" sx={{ fontSize: 10, color: unread > 0 ? 'primary.main' : 'text.disabled', flexShrink: 0 }}>
              {formatLastTime(chat.lastMessageAt)}
            </Typography>
          )}
        </Box>
        <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 500 }}>
          {cfg.label}
        </Typography>
        {chat?.lastMessage ? (
          <Typography
            variant="caption"
            sx={{ display: 'block', lineHeight: 1.2, fontWeight: unread > 0 ? 600 : 400 }}
            color={unread > 0 ? 'text.primary' : 'text.disabled'}
            noWrap
          >
            {chat.lastMessage}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}

type Props = {
  onSelectUser: (uid: string) => void
}

export function ChatUserList({ onSelectUser }: Props) {
  const { presence, chats } = useChat()
  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? presence.filter((u) => u.displayName.toLowerCase().includes(normalized))
    : presence

  // Ordena dentro de cada grupo pelo tempo da última mensagem (mais recente primeiro)
  const sortByRecent = (a: UserPresence, b: UserPresence) => {
    const chatA = chats.find((c) => c.participants.includes(a.uid))
    const chatB = chats.find((c) => c.participants.includes(b.uid))
    // Conversas com não-lidas sempre primeiro
    const unreadA = user ? (chatA?.unreadCount[user.uid] ?? 0) : 0
    const unreadB = user ? (chatB?.unreadCount[user.uid] ?? 0) : 0
    if (unreadA !== unreadB) return unreadB - unreadA
    const timeA = chatA?.lastMessageAt?.getTime() ?? 0
    const timeB = chatB?.lastMessageAt?.getTime() ?? 0
    return timeB - timeA
  }

  const online = filtered.filter((u) => u.status !== 'offline').sort(sortByRecent)
  const offline = filtered.filter((u) => u.status === 'offline').sort(sortByRecent)

  const handleOpenSearch = () => setSearchOpen(true)
  const handleCloseSearch = () => {
    setQuery('')
    setSearchOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Barra de busca */}
      <Box
        sx={{
          px: 1.25,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          minHeight: 40,
        }}
      >
        {searchOpen ? (
          <>
            <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
            <InputBase
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar usuário..."
              sx={{ flex: 1, fontSize: 13, '& input': { p: 0 } }}
            />
            <IconButton size="small" onClick={handleCloseSearch} sx={{ p: 0.25 }}>
              <CloseRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontWeight: 600, letterSpacing: '0.04em' }}>
              {presence.length} {presence.length === 1 ? 'usuário' : 'usuários'}
            </Typography>
            <IconButton size="small" onClick={handleOpenSearch} sx={{ p: 0.25 }}>
              <SearchRoundedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
            </IconButton>
          </>
        )}
      </Box>

      {/* Lista */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
        {presence.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum usuário encontrado ainda
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled">
              Nenhum resultado para "{query}"
            </Typography>
          </Box>
        ) : (
          <>
            {online.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ px: 2.25, py: 0.5, display: 'block', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Ativos — {online.length}
                </Typography>
                {online.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} />)}
              </>
            )}
            {offline.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color={isDark ? 'text.disabled' : 'text.disabled'}
                  sx={{ px: 2.25, pt: 1.25, pb: 0.5, display: 'block', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Offline — {offline.length}
                </Typography>
                {offline.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} />)}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
