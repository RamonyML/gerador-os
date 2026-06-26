import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CakeRoundedIcon from '@mui/icons-material/CakeRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { db } from '../lib/firebase'
import { subscribeUsersDirectory, setBirthday, type PublicProfile } from '../lib/usersPublic'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function daysInMonth(month: number): number {
  return new Date(2000, month, 0).getDate()
}

function formatBirthday(mmdd: string): string {
  const [mm, dd] = mmdd.split('-')
  return `${dd}/${mm}`
}

function todayMMDD(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${mm}-${dd}`
}

type EditState = { month: number; day: number }

export function DevBirthdaysPage() {
  const [users, setUsers] = useState<PublicProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUid, setEditingUid] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ month: 1, day: 1 })
  const [saving, setSaving] = useState(false)

  const today = todayMMDD()

  useEffect(() => {
    const unsub = subscribeUsersDirectory(db, (list) => {
      setUsers(list.filter((u) => u.displayName))
      setLoading(false)
    })
    return unsub
  }, [])

  const sorted = useMemo(
    () => [...users].sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? '', 'pt-BR')),
    [users],
  )

  const startEdit = (user: PublicProfile) => {
    if (!user.uid) return
    let month = 1
    let day = 1
    if (user.birthday) {
      const [mm, dd] = user.birthday.split('-').map(Number)
      month = mm || 1
      day = dd || 1
    }
    setEditState({ month, day })
    setEditingUid(user.uid)
  }

  const cancelEdit = () => setEditingUid(null)

  const save = async (uid: string) => {
    setSaving(true)
    const mm = String(editState.month).padStart(2, '0')
    const dd = String(editState.day).padStart(2, '0')
    await setBirthday(db, uid, `${mm}-${dd}`)
    setSaving(false)
    setEditingUid(null)
  }

  const clear = async (uid: string) => {
    setSaving(true)
    await setBirthday(db, uid, null)
    setSaving(false)
    if (editingUid === uid) setEditingUid(null)
  }

  const days = useMemo(() => daysInMonth(editState.month), [editState.month])

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack sx={{ mb: 3, gap: 0.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <CakeRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Aniversários da equipe</Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Painel dev — rota oculta <code>/dev/aniversarios</code>
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Stack sx={{ gap: 1 }}>
          {sorted.map((user) => {
            const uid = user.uid ?? ''
            const isEditing = editingUid === uid
            const isBirthday = user.birthday === today

            return (
              <Paper
                key={uid}
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderColor: isBirthday ? 'warning.main' : 'divider',
                  bgcolor: isBirthday
                    ? (t) => t.palette.mode === 'dark' ? 'rgba(245,158,11,0.08)' : '#fef9ec'
                    : 'background.paper',
                }}
              >
                <Avatar
                  src={user.photoURL ?? undefined}
                  sx={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}
                >
                  {(user.displayName ?? '?')[0]}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {user.displayName}
                    </Typography>
                    {isBirthday && (
                      <Chip
                        label="🎂 Aniversário hoje!"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: '#fef08a',
                          color: '#92400e',
                          border: '1px solid #fbbf24',
                        }}
                      />
                    )}
                  </Stack>

                  {isEditing ? (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                      <Select
                        size="small"
                        value={editState.month}
                        onChange={(e) => {
                          const newMonth = Number(e.target.value)
                          const maxDay = daysInMonth(newMonth)
                          setEditState((s) => ({ month: newMonth, day: Math.min(s.day, maxDay) }))
                        }}
                        sx={{ fontSize: 13, minWidth: 120 }}
                      >
                        {MONTHS.map((name, i) => (
                          <MenuItem key={i + 1} value={i + 1} sx={{ fontSize: 13 }}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>

                      <Select
                        size="small"
                        value={editState.day}
                        onChange={(e) => setEditState((s) => ({ ...s, day: Number(e.target.value) }))}
                        sx={{ fontSize: 13, minWidth: 72 }}
                      >
                        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                          <MenuItem key={d} value={d} sx={{ fontSize: 13 }}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>

                      <Tooltip title="Salvar">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={saving}
                            onClick={() => void save(uid)}
                          >
                            {saving ? <CircularProgress size={14} /> : <CheckRoundedIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Cancelar">
                        <IconButton size="small" onClick={cancelEdit} disabled={saving}>
                          <CloseRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user.birthday ? `🎂 ${formatBirthday(user.birthday)}` : 'Sem data cadastrada'}
                    </Typography>
                  )}
                </Box>

                {!isEditing && (
                  <Stack direction="row" sx={{ gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Editar aniversário">
                      <IconButton size="small" onClick={() => startEdit(user)}>
                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    {user.birthday && (
                      <Tooltip title="Remover data">
                        <IconButton size="small" onClick={() => void clear(uid)} disabled={saving}>
                          <CloseRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                )}
              </Paper>
            )
          })}
        </Stack>
      )}
    </Container>
  )
}
