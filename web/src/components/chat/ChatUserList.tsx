import { useState } from 'react'
import { Avatar, Badge, Box, Chip, IconButton, InputBase, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../contexts/ChatContext'
import { STATUS_CONFIG, type UserPresence } from '../../types/chat'
import { SECTOR_LABELS, type Sector } from '../../types/profile'
import { useTodaysBirthdays } from '../../hooks/useTodaysBirthdays'

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

function UserRow({ user: otherUser, onSelect, isBirthday = false }: { user: UserPresence; onSelect: (uid: string) => void; isBirthday?: boolean }) {
  const { chats } = useChat()
  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const cfg = STATUS_CONFIG[otherUser.status]
  const chat = chats.find((c) => c.participants.includes(otherUser.uid))
  const unread = user ? (chat?.unreadCount[user.uid] ?? 0) : 0

  const birthdayBg = isDark ? alpha('#f59e0b', 0.13) : '#fef9ec'
  const birthdayBgHover = isDark ? alpha('#f59e0b', 0.22) : '#fef3c7'

  return (
    <Box
      onClick={() => onSelect(otherUser.uid)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: isBirthday ? 1 : 0.875,
        cursor: 'pointer',
        borderRadius: 2,
        mx: 0.75,
        transition: 'background 0.15s',
        bgcolor: isBirthday
          ? birthdayBg
          : unread > 0
            ? alpha(theme.palette.primary.main, isDark ? 0.08 : 0.05)
            : 'transparent',
        border: isBirthday ? 1 : 0,
        borderColor: isDark ? alpha('#f59e0b', 0.35) : '#fde68a',
        '&:hover': {
          bgcolor: isBirthday
            ? birthdayBgHover
            : alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
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
            sx={{
              width: 36,
              height: 36,
              fontSize: 13,
              fontWeight: 700,
              bgcolor: isBirthday ? (isDark ? '#b45309' : '#f59e0b') : 'primary.main',
            }}
          >
            {initialsFrom(otherUser.displayName)}
          </Avatar>
        </Badge>
        <StatusDot color={cfg.color} />
        {isBirthday && (
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              fontSize: 13,
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            🎂
          </Box>
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: unread > 0 || isBirthday ? 700 : 600, lineHeight: 1.3, flex: 1, color: isBirthday ? (isDark ? '#fcd34d' : '#92400e') : 'text.primary' }}
            noWrap
          >
            {otherUser.displayName}
          </Typography>
          {isBirthday ? (
            <Chip
              label="🎉 Aniversário"
              size="small"
              sx={{
                height: 16,
                fontSize: 9,
                fontWeight: 700,
                flexShrink: 0,
                bgcolor: isDark ? alpha('#f59e0b', 0.25) : '#fef08a',
                color: isDark ? '#fcd34d' : '#92400e',
                border: '1px solid',
                borderColor: isDark ? alpha('#f59e0b', 0.4) : '#fbbf24',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          ) : (
            otherUser.sector && (
              <Chip
                label={SECTOR_LABELS[otherUser.sector as Sector] ?? otherUser.sector}
                size="small"
                sx={{
                  height: 16,
                  fontSize: 9,
                  fontWeight: 700,
                  flexShrink: 0,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                  color: 'primary.main',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )
          )}
          {chat?.lastMessageAt && (
            <Typography variant="caption" sx={{ fontSize: 10, color: unread > 0 ? 'primary.main' : 'text.disabled', flexShrink: 0 }}>
              {formatLastTime(chat.lastMessageAt)}
            </Typography>
          )}
        </Box>
        {isBirthday ? (
          <Typography variant="caption" sx={{ color: isDark ? alpha('#fcd34d', 0.7) : '#a16207', fontWeight: 500 }}>
            Mande um parabéns! 🥳
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 500 }}>
            {cfg.label}
          </Typography>
        )}
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
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterUnread, setFilterUnread] = useState(false)

  const birthdayProfiles = useTodaysBirthdays()
  const birthdayUids = new Set(birthdayProfiles.map((p) => p.uid).filter(Boolean) as string[])

  const getUnread = (u: UserPresence) => {
    const chat = chats.find((c) => c.participants.includes(u.uid))
    return user ? (chat?.unreadCount[user.uid] ?? 0) : 0
  }

  const sortByRecent = (a: UserPresence, b: UserPresence) => {
    const chatA = chats.find((c) => c.participants.includes(a.uid))
    const chatB = chats.find((c) => c.participants.includes(b.uid))
    const timeA = chatA?.lastMessageAt?.getTime() ?? 0
    const timeB = chatB?.lastMessageAt?.getTime() ?? 0
    return timeB - timeA
  }

  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? presence.filter((u) => u.displayName.toLowerCase().includes(normalized))
    : presence

  // Aniversariantes — sempre no topo (excluídos das demais seções)
  const birthdayUsers = filtered.filter((u) => birthdayUids.has(u.uid))
  // Usuários com não-lidas (exceto aniversariantes) — ficam logo abaixo
  const unreadUsers = filtered.filter((u) => !birthdayUids.has(u.uid) && getUnread(u) > 0).sort(sortByRecent)
  // Ativos sem não-lidas (exceto aniversariantes)
  const onlineClean = filtered.filter((u) => !birthdayUids.has(u.uid) && u.status !== 'offline' && getUnread(u) === 0).sort(sortByRecent)
  // Offline sem não-lidas (exceto aniversariantes)
  const offlineClean = filtered.filter((u) => !birthdayUids.has(u.uid) && u.status === 'offline' && getUnread(u) === 0).sort(sortByRecent)

  const totalUnreadCount = presence.reduce((acc, u) => acc + getUnread(u), 0)

  const handleOpenSearch = () => setSearchOpen(true)
  const handleCloseSearch = () => { setQuery(''); setSearchOpen(false) }

  const SectionLabel = ({ label, pt }: { label: string; pt?: number }) => (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ px: 2.25, pt: pt ?? 0.5, pb: 0.5, display: 'block', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
    >
      {label}
    </Typography>
  )

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
            {totalUnreadCount > 0 && (
              <Chip
                label={filterUnread ? 'Todas' : `Não lidas ${totalUnreadCount}`}
                size="small"
                onClick={() => setFilterUnread((v) => !v)}
                color={filterUnread ? 'primary' : 'error'}
                variant={filterUnread ? 'filled' : 'outlined'}
                sx={{ height: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
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
            <Typography variant="body2" color="text.secondary">Nenhum usuário encontrado ainda</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled">Nenhum resultado para "{query}"</Typography>
          </Box>
        ) : filterUnread ? (
          // ── Modo filtro: só não lidas ──
          unreadUsers.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.disabled">Nenhuma mensagem não lida</Typography>
            </Box>
          ) : (
            <>
              <SectionLabel label={`Não lidas — ${unreadUsers.length}`} />
              {unreadUsers.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} />)}
            </>
          )
        ) : (
          // ── Modo normal: aniversariantes no topo, depois não lidas, ativos, offline ──
          <>
            {birthdayUsers.length > 0 && (
              <>
                <SectionLabel label="🎂 Aniversário hoje" pt={0.5} />
                {birthdayUsers.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} isBirthday />)}
              </>
            )}
            {unreadUsers.length > 0 && (
              <>
                <SectionLabel label={`Não lidas — ${unreadUsers.length}`} pt={birthdayUsers.length > 0 ? 1.25 : 0.5} />
                {unreadUsers.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} />)}
              </>
            )}
            {onlineClean.length > 0 && (
              <>
                <SectionLabel label={`Ativos — ${onlineClean.length}`} pt={birthdayUsers.length > 0 || unreadUsers.length > 0 ? 1.25 : 0.5} />
                {onlineClean.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} />)}
              </>
            )}
            {offlineClean.length > 0 && (
              <>
                <SectionLabel label={`Offline — ${offlineClean.length}`} pt={1.25} />
                {offlineClean.map((u) => <UserRow key={u.uid} user={u} onSelect={onSelectUser} />)}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
