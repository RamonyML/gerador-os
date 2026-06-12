import { Fragment, useMemo, useState } from 'react'
import {
  Box,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { endOfMonth, isSameDay } from 'date-fns'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import {
  SHIFT_IDS,
  TURNOS_EXTRAS,
  metaTurnoPorId,
  turnosPrincipaisParaData,
  type TurnoFixoMeta,
} from '../lib/escalaTurnosFixos'
import {
  collectMatrizEmails,
  operatorShiftsForDay,
  shiftCellMeta,
  type ShiftKind,
} from '../lib/escalaMatriz'
import { displayNameForSchedule } from '../lib/escalaDisplayNames'
import type { SectorRosterRow } from '../lib/userManagementApi'
import type { EscalaMesDays } from '../types/escala'
import type { Sector } from '../types/profile'

const NAME_W = 168
const CELL_W = 46
const WEEKDAY_NARROW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function kindPalette(theme: Theme, kind: ShiftKind) {
  switch (kind) {
    case 'presencial':
      return theme.palette.success
    case 'homeoffice':
      return theme.palette.warning
    case 'feriado':
      return theme.palette.secondary
    case 'ferias':
      return theme.palette.error
    case 'extra':
    default:
      return theme.palette.info
  }
}

interface MenuState {
  anchorEl: HTMLElement
  dayNum: number
  email: string
}

interface EscalaMatrizAtendenteProps {
  month: Date
  days: EscalaMesDays
  roster: SectorRosterRow[]
  nameByEmail: Map<string, string>
  sector: Sector | null
  canEdit: boolean
  onSetCell: (dayNum: number, email: string, shiftId: string | null) => void
}

export function EscalaMatrizAtendente({
  month,
  days,
  roster,
  nameByEmail,
  sector,
  canEdit,
  onSetCell,
}: EscalaMatrizAtendenteProps) {
  const theme = useTheme()
  const today = new Date()
  const [menu, setMenu] = useState<MenuState | null>(null)

  const y = month.getFullYear()
  const m0 = month.getMonth()
  const lastDay = endOfMonth(month).getDate()

  const dayMetas = useMemo(() => {
    const out: {
      num: number
      date: Date
      weekend: boolean
      isToday: boolean
      narrow: string
    }[] = []
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(y, m0, d, 12, 0, 0, 0)
      const dow = date.getDay()
      out.push({
        num: d,
        date,
        weekend: dow === 0 || dow === 6,
        isToday: isSameDay(date, today),
        narrow: WEEKDAY_NARROW[dow],
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [y, m0, lastDay])

  const rows = useMemo(() => {
    const emails = collectMatrizEmails(roster, days)
    return emails
      .map((email) => ({
        email,
        name: displayNameForSchedule(email, nameByEmail),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [roster, days, nameByEmail])

  const headerBg = alpha(theme.palette.grey[500], 0.1)
  const weekendBg = alpha(
    theme.palette.success.main,
    theme.palette.mode === 'dark' ? 0.14 : 0.09,
  )
  const nameColBg = theme.palette.background.paper
  const todayBorder = `2px solid ${theme.palette.primary.main}`

  const menuShifts: TurnoFixoMeta[] = useMemo(() => {
    if (!menu) return []
    const date = new Date(y, m0, menu.dayNum, 12, 0, 0, 0)
    return [...turnosPrincipaisParaData(date, sector), ...TURNOS_EXTRAS]
  }, [menu, y, m0, sector])

  const menuSelected = useMemo(
    () => (menu ? operatorShiftsForDay(days, menu.dayNum, menu.email) : []),
    [menu, days],
  )

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary">
        Nenhum atendente encontrado para este setor.
      </Typography>
    )
  }

  const gridTemplateColumns = `${NAME_W}px repeat(${lastDay}, ${CELL_W}px)`

  return (
    <Stack spacing={1.5}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ overflowX: 'auto', overflowY: 'visible' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns,
              minWidth: 'max-content',
            }}
          >
            {/* Canto superior esquerdo (sticky em ambos os eixos) */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 4,
                bgcolor: headerBg,
                borderBottom: 1,
                borderRight: 1,
                borderColor: 'divider',
                px: 1.5,
                py: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                Atendente
              </Typography>
            </Box>

            {/* Cabeçalho de dias (sticky no topo) */}
            {dayMetas.map((dm) => (
              <Box
                key={`h-${dm.num}`}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  bgcolor: dm.weekend ? weekendBg : headerBg,
                  borderBottom: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  ...(dm.isToday ? { borderTop: todayBorder } : {}),
                  py: 0.75,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    lineHeight: 1,
                    color: 'text.secondary',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {dm.narrow}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    lineHeight: 1.3,
                    fontWeight: 800,
                    color: dm.isToday ? 'primary.main' : 'text.primary',
                  }}
                >
                  {dm.num}
                </Typography>
              </Box>
            ))}

            {/* Linhas: um atendente por linha */}
            {rows.map((row, ri) => {
              const rowStripe =
                ri % 2 === 1
                  ? alpha(theme.palette.grey[500], 0.04)
                  : 'transparent'
              return (
                <Fragment key={row.email}>
                  <Box
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      bgcolor: nameColBg,
                      borderBottom: 1,
                      borderRight: 1,
                      borderColor: 'divider',
                      px: 1.5,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 40,
                    }}
                  >
                    <Tooltip title={row.email} placement="right">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 600, maxWidth: NAME_W - 24 }}
                      >
                        {row.name}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {dayMetas.map((dm) => {
                    const shifts = operatorShiftsForDay(days, dm.num, row.email)
                    const clickable = canEdit
                    return (
                      <Box
                        key={`c-${row.email}-${dm.num}`}
                        component={clickable ? 'button' : 'div'}
                        type={clickable ? 'button' : undefined}
                        onClick={
                          clickable
                            ? (e: React.MouseEvent<HTMLElement>) =>
                                setMenu({
                                  anchorEl: e.currentTarget,
                                  dayNum: dm.num,
                                  email: row.email,
                                })
                            : undefined
                        }
                        sx={{
                          border: 0,
                          borderBottom: 1,
                          borderRight: 1,
                          borderColor: 'divider',
                          ...(dm.isToday
                            ? {
                                borderLeft: todayBorder,
                                borderRight: todayBorder,
                              }
                            : {}),
                          bgcolor: dm.weekend ? weekendBg : rowStripe,
                          minHeight: 40,
                          width: '100%',
                          p: 0.25,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.25,
                          cursor: clickable ? 'pointer' : 'default',
                          transition: 'background-color .12s',
                          ...(clickable
                            ? {
                                '&:hover': {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.12,
                                  ),
                                },
                              }
                            : {}),
                        }}
                      >
                        {shifts.length === 0 ? (
                          <Tooltip
                            title="Folga"
                            placement="top"
                            arrow
                            disableInteractive
                          >
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: alpha(theme.palette.text.disabled, 0.5),
                              }}
                            />
                          </Tooltip>
                        ) : (
                          shifts.map((shiftId) => {
                            const meta = shiftCellMeta(shiftId)
                            const pal = kindPalette(theme, meta.kind)
                            const info = metaTurnoPorId(shiftId, dm.date, sector)
                            return (
                              <Tooltip
                                key={shiftId}
                                placement="top"
                                arrow
                                disableInteractive
                                title={
                                  info ? (
                                    <Box sx={{ py: 0.25 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 700, display: 'block' }}
                                      >
                                        {info.headline}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ display: 'block', opacity: 0.85 }}
                                      >
                                        {info.detail}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    'Turno definido'
                                  )
                                }
                              >
                                <Box
                                  sx={{
                                    minWidth: 18,
                                    height: 20,
                                    px: 0.5,
                                    borderRadius: 0.75,
                                    bgcolor: alpha(pal.main, 0.18),
                                    color: pal.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 800,
                                    lineHeight: 1,
                                  }}
                                >
                                  {meta.code}
                                </Box>
                              </Tooltip>
                            )
                          })
                        )}
                      </Box>
                    )
                  })}
                </Fragment>
              )
            })}
          </Box>
        </Box>
      </Paper>

      <Legend />

      <Menu
        anchorEl={menu?.anchorEl ?? null}
        open={menu != null}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {menuShifts.map((meta) => {
          const cell = shiftCellMeta(meta.id)
          const pal = kindPalette(theme, cell.kind)
          const selected = menuSelected.includes(meta.id)
          return (
            <MenuItem
              key={meta.id}
              selected={selected}
              onClick={() => {
                if (menu) onSetCell(menu.dayNum, menu.email, meta.id)
                setMenu(null)
              }}
            >
              <Box
                sx={{
                  minWidth: 22,
                  height: 20,
                  px: 0.5,
                  mr: 1.25,
                  borderRadius: 0.75,
                  bgcolor: alpha(pal.main, 0.18),
                  color: pal.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {cell.code}
              </Box>
              <ListItemText primary={meta.headline} secondary={meta.detail} />
              {selected ? (
                <CheckIcon fontSize="small" sx={{ ml: 1, opacity: 0.7 }} />
              ) : null}
            </MenuItem>
          )
        })}
        <Divider />
        <MenuItem
          selected={menuSelected.includes(SHIFT_IDS.ferias)}
          onClick={() => {
            if (menu) onSetCell(menu.dayNum, menu.email, SHIFT_IDS.ferias)
            setMenu(null)
          }}
        >
          <Box
            sx={{
              minWidth: 22,
              height: 20,
              px: 0.5,
              mr: 1.25,
              borderRadius: 0.75,
              bgcolor: alpha(theme.palette.error.main, 0.18),
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            Fé
          </Box>
          <ListItemText
            primary="Férias"
            secondary="Marca o dia como férias"
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) onSetCell(menu.dayNum, menu.email, null)
            setMenu(null)
          }}
        >
          <Box sx={{ width: 22, mr: 1.25, textAlign: 'center', color: 'text.disabled' }}>
            —
          </Box>
          <ListItemText
            primary="Folga"
            secondary="Limpa o dia para este atendente"
          />
        </MenuItem>
      </Menu>
    </Stack>
  )
}

function Legend() {
  const theme = useTheme()
  const items: { label: string; kind: ShiftKind }[] = [
    { label: 'Presencial', kind: 'presencial' },
    { label: 'Home office', kind: 'homeoffice' },
    { label: 'Intermediário', kind: 'extra' },
    { label: 'Feriado', kind: 'feriado' },
    { label: 'Férias', kind: 'ferias' },
  ]
  return (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'center', px: 0.5 }}
    >
      {items.map((it) => {
        const pal = kindPalette(theme, it.kind)
        return (
          <Stack
            key={it.kind}
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center' }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.75,
                bgcolor: alpha(pal.main, 0.18),
                border: `1px solid ${alpha(pal.main, 0.5)}`,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {it.label}
            </Typography>
          </Stack>
        )
      })}
      <Typography variant="caption" color="text.secondary">
        · Letras: <strong>M</strong> manhã · <strong>T</strong> tarde/noite ·{' '}
        <strong>I</strong> intermediário · <strong>F</strong> feriado ·{' '}
        <strong>Fé</strong> férias · ponto = folga
      </Typography>
    </Stack>
  )
}
