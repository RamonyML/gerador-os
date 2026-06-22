import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { UtensilsIcon } from './UtensilsIcon'
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { db } from '../lib/firebase'
import { subscribePresence } from '../lib/presenceFirestore'
import { setHorarioPausa, subscribePausasDia } from '../lib/pausaFirestore'
import { subscribeUsersDirectory, type PublicProfile } from '../lib/usersPublic'
import {
  elapsedMs,
  formatElapsed,
  getPausaStatus,
  todayISO,
  type PausaEntry,
} from '../types/pausa'
import type { UserPresence } from '../types/chat'
import type { UserProfile } from '../types/profile'
import { SECTOR_LABELS } from '../types/profile'

function useNow(interval = 5000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

type RowUser = Omit<PublicProfile, 'uid'> & { uid: string; pausaEntry: PausaEntry | null }

function EditableTime({
  uid,
  displayName,
  current,
  date,
}: {
  uid: string
  displayName: string
  current: string | null
  date: string
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await setHorarioPausa(uid, displayName, date, value || null)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(current ?? '')
    setEditing(false)
  }

  if (!editing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>
          {current ?? '—'}
        </Typography>
        <Tooltip title="Definir horário">
          <IconButton size="small" onClick={() => setEditing(true)} sx={{ p: 0.25 }}>
            <EditRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        component="input"
        type="time"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        disabled={saving}
        step={300}
        sx={{
          width: 96,
          fontSize: 12,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          outline: 'none',
          '&:focus': { borderColor: 'primary.main' },
          '&:disabled': { opacity: 0.5 },
        }}
      />
      <Tooltip title="Salvar">
        <IconButton size="small" onClick={() => void handleSave()} disabled={saving} sx={{ p: 0.25 }}>
          <CheckRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cancelar">
        <IconButton size="small" onClick={handleCancel} disabled={saving} sx={{ p: 0.25 }}>
          <CloseRoundedIcon sx={{ fontSize: 14, color: 'error.main' }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

function PausaStatusChip({ entry, now }: { entry: PausaEntry | null; now: Date }) {
  const theme = useTheme()
  const status = getPausaStatus(entry)

  if (status === 'sem_pausa') return null

  const elapsed = entry ? elapsedMs({ ...entry, fimEfetivo: entry.fimEfetivo ?? now }) : 0

  if (status === 'agendada') {
    return (
      <Chip
        icon={<UtensilsIcon sx={{ fontSize: '12px !important' }} />}
        label={entry?.horarioAgendado}
        size="small"
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          '& .MuiChip-icon': { color: 'primary.main', ml: 0.5 },
        }}
      />
    )
  }

  if (status === 'em_pausa') {
    const overdue = elapsed > 60 * 60 * 1000
    const color = overdue ? theme.palette.error.main : theme.palette.warning.main
    const liveElapsed = formatElapsed(
      now.getTime() - (entry?.inicioEfetivo?.getTime() ?? now.getTime()),
    )
    return (
      <Chip
        icon={<PauseCircleOutlineRoundedIcon sx={{ fontSize: '12px !important' }} />}
        label={liveElapsed}
        size="small"
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: alpha(color, 0.12),
          color,
          '& .MuiChip-icon': { color, ml: 0.5 },
        }}
      />
    )
  }

  if (status === 'concluida') {
    return (
      <Chip
        icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: '12px !important' }} />}
        label={formatElapsed(elapsed)}
        size="small"
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: 'success.main',
          '& .MuiChip-icon': { color: 'success.main', ml: 0.5 },
        }}
      />
    )
  }

  return null
}

function UserRow({ user, today, now }: { user: RowUser; today: string; now: Date }) {
  const theme = useTheme()
  const status = getPausaStatus(user.pausaEntry)
  const isOnPause = status === 'em_pausa'
  const rowBg = isOnPause ? alpha(theme.palette.warning.main, 0.06) : undefined

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        p: 1,
        borderRadius: 2,
        bgcolor: rowBg,
        transition: 'background 0.15s',
      }}
    >
      <Avatar
        src={user.photoURL ?? undefined}
        sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main', flexShrink: 0 }}
      >
        {initialsFrom(user.displayName ?? '')}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
          {user.displayName ?? '—'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
          <PausaStatusChip entry={user.pausaEntry} now={now} />
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <EditableTime
          uid={user.uid}
          displayName={user.displayName ?? ''}
          current={user.pausaEntry?.horarioAgendado ?? null}
          date={today}
        />
      </Box>
    </Box>
  )
}

function sortRows(users: RowUser[]): RowUser[] {
  const emPausa = users
    .filter((u) => getPausaStatus(u.pausaEntry) === 'em_pausa')
    .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'pt-BR'))
  const resto = users
    .filter((u) => getPausaStatus(u.pausaEntry) !== 'em_pausa')
    .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'pt-BR'))
  return [...emPausa, ...resto]
}

function SectorGroup({
  label,
  rows,
  today,
  now,
}: {
  label: string
  rows: RowUser[]
  today: string
  now: Date
}) {
  const theme = useTheme()
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          color: 'text.disabled',
          display: 'block',
          px: 1,
          pt: 0.5,
          pb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Stack spacing={0.25}>
        {rows.map((user, idx) => {
          const isOnPause = getPausaStatus(user.pausaEntry) === 'em_pausa'
          const prevIsOnPause = idx > 0 ? getPausaStatus(rows[idx - 1]!.pausaEntry) === 'em_pausa' : false
          return (
            <Box key={user.uid}>
              {idx > 0 && isOnPause !== prevIsOnPause && (
                <Divider sx={{ my: 0.5 }} />
              )}
              <UserRow user={user} today={today} now={now} />
            </Box>
          )
        })}
      </Stack>
      <Divider sx={{ mt: 1, borderColor: alpha(theme.palette.divider, 0.5) }} />
    </Box>
  )
}

export function PausaTeamCard({ profile }: { profile: UserProfile }) {
  const theme = useTheme()
  const today = todayISO()
  const now = useNow()
  const [expanded, setExpanded] = useState(false)
  const [directory, setDirectory] = useState<PublicProfile[]>([])
  const [pausas, setPausas] = useState<PausaEntry[]>([])

  const isGlobal = profile.isDev === true || profile.isAdmin === true

  const [presenceData, setPresenceData] = useState<UserPresence[]>([])

  useEffect(() => subscribeUsersDirectory(db, setDirectory), [])
  useEffect(() => subscribePresence(setPresenceData), [])
  useEffect(() => subscribePausasDia(today, setPausas), [today])

  const pausaMap = useMemo(
    () => new Map(pausas.map((p) => [p.uid, p])),
    [pausas],
  )

  // Preenche sector vazio em usersPublic com o setor da presença (usuários que ainda
  // não logaram desde que passamos a gravar o setor no usersPublic)
  const presenceMap = useMemo(
    () => new Map(presenceData.map((p) => [p.uid, p])),
    [presenceData],
  )

  const mergedDirectory = useMemo(
    () => directory.map((u) => ({
      ...u,
      sector: u.sector || (u.uid ? (presenceMap.get(u.uid)?.sector ?? '') : ''),
    })),
    [directory, presenceMap],
  )

  const filteredDirectory = useMemo(() => {
    if (isGlobal) return mergedDirectory
    return mergedDirectory.filter((u) => u.sector === profile.sector)
  }, [mergedDirectory, isGlobal, profile.sector])

  const allRows: RowUser[] = useMemo(
    () => filteredDirectory
      .filter((u): u is PublicProfile & { uid: string } => Boolean(u.uid))
      .map((u) => ({ ...u, pausaEntry: pausaMap.get(u.uid) ?? null })),
    [filteredDirectory, pausaMap],
  )

  // Para dev/admin: agrupar por setor
  const sectorGroups = useMemo(() => {
    if (!isGlobal) return null
    const groups: Record<string, RowUser[]> = {}
    for (const user of allRows) {
      const s = user.sector || 'outros'
      if (!groups[s]) groups[s] = []
      groups[s]!.push(user)
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([sector, users]) => ({ sector, rows: sortRows(users) }))
  }, [isGlobal, allRows])

  // Para gerente: lista simples do próprio setor
  const singleRows = useMemo(
    () => (isGlobal ? null : sortRows(allRows)),
    [isGlobal, allRows],
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  const emPausaCount = allRows.filter((r) => getPausaStatus(r.pausaEntry) === 'em_pausa').length

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <UtensilsIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Pausas da equipe
          </Typography>
          {emPausaCount > 0 && (
            <Chip
              label={`${emPausaCount} em pausa`}
              size="small"
              sx={{
                height: 20,
                fontSize: 11,
                fontWeight: 700,
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: 'warning.main',
              }}
            />
          )}
        </Box>
        <IconButton size="small" disableRipple>
          {expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <Divider />
        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 380,
            overflowY: 'auto',
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
          }}
        >
          {allRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Nenhum colaborador cadastrado
            </Typography>
          ) : isGlobal && sectorGroups ? (
            <Stack spacing={0.5}>
              {sectorGroups.map(({ sector, rows }) => (
                <SectorGroup
                  key={sector}
                  label={SECTOR_LABELS[sector as keyof typeof SECTOR_LABELS] ?? sector}
                  rows={rows}
                  today={today}
                  now={now}
                />
              ))}
            </Stack>
          ) : (
            <Stack spacing={0.25}>
              {(singleRows ?? []).map((user, idx) => {
                const isOnPause = getPausaStatus(user.pausaEntry) === 'em_pausa'
                const prevIsOnPause = idx > 0 ? getPausaStatus(singleRows![idx - 1]!.pausaEntry) === 'em_pausa' : false
                return (
                  <Box key={user.uid}>
                    {idx > 0 && isOnPause !== prevIsOnPause && (
                      <Divider sx={{ my: 0.5 }} />
                    )}
                    <UserRow user={user} today={today} now={now} />
                  </Box>
                )
              })}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}
