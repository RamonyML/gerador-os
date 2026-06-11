import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { endOfMonth, format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { alpha, useTheme } from '@mui/material/styles'
import { AppPageChrome } from '../components/AppPageChrome'
import { EscalaMatrizAtendente } from '../components/EscalaMatrizAtendente'
import { Reveal } from '../components/Reveal'
import { MonthNavigator } from '../features/upgrades/MonthNavigator'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import {
  emptyMesDoc,
  parseEscalaMes,
} from '../lib/escalaFirestore'
import {
  horariosTurnoSetor,
  tituloTurnoNoDialogo,
  TURNOS_EXTRAS,
  turnosPrincipaisParaData,
  type TurnoFixoMeta,
  type TurnoVariant,
} from '../lib/escalaTurnosFixos'
import {
  callableErrorMessage,
  fetchFullSectorRoster,
  type SectorRosterRow,
} from '../lib/userManagementApi'
import {
  buildEmailToDisplayNameMap,
  displayNameForSchedule,
  prettyLocalPartFromEmail,
} from '../lib/escalaDisplayNames'
import { setOperatorShiftForDay } from '../lib/escalaMatriz'
import { canManageWorkSchedule } from '../lib/permissions'
import {
  SECTOR_LABELS,
  SECTORS,
  type Sector,
} from '../types/profile'
import type { EscalaMesDays } from '../types/escala'
import { escalaMesDocId } from '../types/escala'

/** Grade semanal começando na segunda (estilo escala). Colunas Seg → Dom. */
const WEEK_HEADERS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

function variantLabel(variant: TurnoVariant): string {
  switch (variant) {
    case 'homeoffice':
      return 'Home office'
    case 'extra':
      return 'Extra'
    case 'presencial':
    default:
      return 'Presencial'
  }
}

function cloneDays(d: EscalaMesDays): EscalaMesDays {
  const out: EscalaMesDays = {}
  for (const [dk, dm] of Object.entries(d)) {
    out[dk] = {}
    for (const [sk, emails] of Object.entries(dm)) {
      out[dk][sk] = [...emails]
    }
  }
  return out
}

/**
 * Colunas do dia: principais sempre.
 * Extras: gestores veem todas as colunas extras (para poder escalar); demais só quando já há alguém.
 */
function turnosColunasParaDia(
  date: Date,
  dayNum: number,
  daysMap: EscalaMesDays,
  mostrarExtrasVazios: boolean,
  sector?: Sector | null,
): TurnoFixoMeta[] {
  const principais = turnosPrincipaisParaData(date, sector)
  if (mostrarExtrasVazios) return [...principais, ...TURNOS_EXTRAS]
  const extrasComPessoas = TURNOS_EXTRAS.filter(
    (ex) => (daysMap[String(dayNum)]?.[ex.id]?.length ?? 0) > 0,
  )
  return [...principais, ...extrasComPessoas]
}

export function EscalaPage() {
  const theme = useTheme()
  const { user, profile, profileMissing } = useAuth()

  const canEdit = profile != null && canManageWorkSchedule(profile)
  const showSectorPicker =
    profile?.isDev === true || profile?.isAdmin === true

  const [sectorPick, setSectorPick] = useState<Sector | ''>('')
  const effectiveSector: Sector | null = useMemo(() => {
    if (!profile) return null
    if (showSectorPicker && sectorPick) return sectorPick
    return profile.sector
  }, [profile, showSectorPicker, sectorPick])

  useEffect(() => {
    if (profile && showSectorPicker && !sectorPick) {
      setSectorPick(profile.sector)
    }
  }, [profile, showSectorPicker, sectorPick])

  const [month, setMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(12, 0, 0, 0)
    return d
  })

  /** Visão padrão ao abrir: plantonistas (somente sábados e domingos). */
  const [viewMode, setViewMode] = useState<
    'plantonistas' | 'completa' | 'porAtendente'
  >('plantonistas')

  /** Linhas da grade: horários por setor (Comercial tem jornada própria). */
  const gridSlots = useMemo(() => {
    const h = horariosTurnoSetor(effectiveSector)
    return [
      { key: 'manha', label: 'Manhã', time: h.manha },
      { key: 'tarde', label: 'Tarde / Noite', time: h.tarde },
    ]
  }, [effectiveSector])

  const yearMonth = format(month, 'yyyy-MM')

  const [days, setDays] = useState<EscalaMesDays>({})
  const [draftDays, setDraftDays] = useState<EscalaMesDays>({})
  const [loadedKey, setLoadedKey] = useState('')

  const [loadingMes, setLoadingMes] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [roster, setRoster] = useState<SectorRosterRow[]>([])
  const [rosterError, setRosterError] = useState<string | null>(null)
  const [rosterLoading, setRosterLoading] = useState(true)

  /** Clique no dia — visão em tabela. */
  const [dayDialog, setDayDialog] = useState<{
    dayNum: number
    date: Date
  } | null>(null)

  /** Edição por turno (gestores). */
  const [cellDialog, setCellDialog] = useState<{
    dayNum: number
    shift: TurnoFixoMeta
  } | null>(null)

  const [pendingEmails, setPendingEmails] = useState<string[]>([])

  const calendarWeeks = useMemo(() => {
    const y = month.getFullYear()
    const m0 = month.getMonth()
    const first = new Date(y, m0, 1, 12, 0, 0, 0)
    const lastDay = endOfMonth(month).getDate()
    const jsDow = first.getDay()
    /** Coluna 0 = segunda-feira (Seg → Dom). */
    const mondayFirstPad = (jsDow + 6) % 7
    const cells: (number | null)[] = []
    for (let i = 0; i < mondayFirstPad; i++) cells.push(null)
    for (let d = 1; d <= lastDay; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [month])

  const nameByEmail = useMemo(() => buildEmailToDisplayNameMap(roster), [roster])

  const loadRoster = useCallback(async () => {
    if (!effectiveSector || !profile) {
      setRoster([])
      setRosterLoading(false)
      return
    }
    setRosterError(null)
    setRosterLoading(true)
    try {
      const sectorArg =
        profile.isDev === true || profile.isAdmin === true
          ? effectiveSector
          : undefined
      const rows = await fetchFullSectorRoster(sectorArg)
      setRoster(rows)
    } catch (e) {
      setRosterError(callableErrorMessage(e))
      setRoster([])
    } finally {
      setRosterLoading(false)
    }
  }, [effectiveSector, profile])

  useEffect(() => {
    void loadRoster()
  }, [loadRoster])

  useEffect(() => {
    if (!effectiveSector) {
      setLoadingMes(false)
      return
    }
    let cancelled = false
    setLoadError(null)
    setLoadingMes(true)

    ;(async () => {
      try {
        const mRef = doc(db, 'escalaMes', escalaMesDocId(effectiveSector, yearMonth))
        const mSnap = await getDoc(mRef)
        if (cancelled) return
        let mes =
          mSnap.exists() && mSnap.data()
            ? parseEscalaMes(mSnap.data() as Record<string, unknown>)
            : null
        if (!mes) mes = emptyMesDoc(effectiveSector, yearMonth)
        setDays(mes.days)
        setDraftDays(cloneDays(mes.days))
        setLoadedKey(`${effectiveSector}-${yearMonth}-${mSnap.exists() ? '1' : '0'}`)
      } catch {
        if (!cancelled) setLoadError('Não foi possível carregar a escala do mês.')
        const empty = emptyMesDoc(effectiveSector, yearMonth)
        setDays(empty.days)
        setDraftDays({})
      } finally {
        if (!cancelled) setLoadingMes(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [effectiveSector, yearMonth])

  const dirty = useMemo(() => {
    return JSON.stringify(days) !== JSON.stringify(draftDays)
  }, [days, draftDays])

  const colleagueOptions = useMemo(
    () =>
      roster.map((r) => ({
        email: r.email.trim().toLowerCase(),
        label: r.displayName?.trim()
          ? r.displayName.trim()
          : prettyLocalPartFromEmail(r.email),
      })),
    [roster],
  )

  const cellAutocompleteOptions = useMemo(() => {
    const extra = pendingEmails
      .filter((em) => !colleagueOptions.some((o) => o.email === em))
      .map((em) => ({
        email: em,
        label: displayNameForSchedule(em, nameByEmail),
      }))
    return [...colleagueOptions, ...extra]
  }, [colleagueOptions, pendingEmails, nameByEmail])

  const handleSaveMes = async () => {
    if (!effectiveSector || !canEdit) return
    setSaving(true)
    setSaveError(null)
    try {
      const ref = doc(db, 'escalaMes', escalaMesDocId(effectiveSector, yearMonth))
      await setDoc(
        ref,
        {
          sector: effectiveSector,
          yearMonth,
          days: draftDays,
          updatedAt: serverTimestamp(),
          updatedByEmail: user?.email ?? null,
          turnosVersao: 2,
        },
        { merge: true },
      )
      setDays(cloneDays(draftDays))
      setLoadedKey(`${effectiveSector}-${yearMonth}-saved`)
    } catch {
      setSaveError('Falha ao salvar. Verifique sua conexão e as permissões.')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setDraftDays(cloneDays(days))
    setSaveError(null)
  }

  const openEditShift = (dayNum: number, shift: TurnoFixoMeta) => {
    if (!canEdit) return
    const initial = draftDays[String(dayNum)]?.[shift.id] ?? []
    setPendingEmails([...initial])
    setDayDialog(null)
    setCellDialog({ dayNum, shift })
  }

  const applyCellDialog = () => {
    if (!cellDialog) return
    const merged = [...new Set(pendingEmails)]
    const dayKey = String(cellDialog.dayNum)
    setDraftDays((prev) => {
      const next = cloneDays(prev)
      if (!next[dayKey]) next[dayKey] = {}
      next[dayKey][cellDialog.shift.id] = merged
      return next
    })
    setCellDialog(null)
  }

  /** Edição inline da visão "Por atendente": define o turno de uma pessoa no dia. */
  const handleSetCell = useCallback(
    (dayNum: number, email: string, shiftId: string | null) => {
      if (!canEdit) return
      setDraftDays((prev) => setOperatorShiftForDay(prev, dayNum, email, shiftId))
    },
    [canEdit],
  )

  const monthLabelShort = format(month, 'MM/yyyy')
  const today = new Date()

  const subtitle = effectiveSector ? (
    <>
      Escala do setor <strong>{SECTOR_LABELS[effectiveSector]}</strong>. Grade semanal por turno; clique
      no número do dia para ver o detalhe completo.{' '}
      {canEdit
        ? 'Gestores clicam em uma célula de turno para editar os operadores.'
        : 'Somente leitura.'}
    </>
  ) : null

  return (
    <AppPageChrome
      overline="Operação"
      title="Escala de trabalho"
      subtitle={subtitle}
      maxWidth="lg"
      illustration="schedule"
      illustrationAlt="Planejamento de escala"
      headerRight={
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          {showSectorPicker && effectiveSector ? (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="escala-sector-label">Setor</InputLabel>
              <Select
                labelId="escala-sector-label"
                label="Setor"
                value={sectorPick || effectiveSector}
                onChange={(e) => setSectorPick(e.target.value as Sector)}
              >
                {SECTORS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <MonthNavigator selectedMonth={month} onMonthChange={setMonth} />
        </Box>
      }
    >
      <Stack spacing={2}>
        {profileMissing ? (
          <Alert severity="warning">
            Perfil incompleto — é necessário o documento <code>users/&lt;uid&gt;</code> com setor e
            hierarquia.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            color="primary"
            size="small"
            onChange={(_, v) => {
              if (v)
                setViewMode(v as 'plantonistas' | 'completa' | 'porAtendente')
            }}
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
              },
            }}
          >
            <ToggleButton value="plantonistas">Escala de plantonistas</ToggleButton>
            <ToggleButton value="completa">Escala mensal completa</ToggleButton>
            <ToggleButton value="porAtendente">Por atendente</ToggleButton>
          </ToggleButtonGroup>

          {canEdit ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="text"
                size="small"
                disabled={!dirty || saving}
                onClick={handleDiscard}
              >
                Descartar
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={!dirty || saving || loadingMes}
                onClick={() => void handleSaveMes()}
              >
                {saving ? 'Salvando…' : 'Salvar mês'}
              </Button>
            </Stack>
          ) : null}
        </Box>

        {loadError ? <Alert severity="error">{loadError}</Alert> : null}
        {rosterError ? (
          <Alert severity="warning">
            Não foi possível carregar nomes do setor ({rosterError}). Faça deploy da função{' '}
            <code>sectorRoster</code> ou tente mais tarde.
          </Alert>
        ) : null}
        {saveError ? <Alert severity="error">{saveError}</Alert> : null}

        {loadingMes ? (
          <Typography color="text.secondary">Carregando…</Typography>
        ) : (
          viewMode === 'porAtendente' ? (
            rosterLoading ? (
              <Typography color="text.secondary">Carregando atendentes…</Typography>
            ) : (
              <EscalaMatrizAtendente
                month={month}
                days={draftDays}
                roster={roster}
                nameByEmail={nameByEmail}
                sector={effectiveSector}
                canEdit={canEdit}
                onSetCell={handleSetCell}
              />
            )
          ) : (
          (() => {
            const isPlantonistas = viewMode === 'plantonistas'
            /** Índices de coluna (Seg=0 … Dom=6). Plantonistas = só Sáb e Dom. */
            const visibleCols = isPlantonistas ? [5, 6] : [0, 1, 2, 3, 4, 5, 6]
            const gridCols = `128px repeat(${visibleCols.length}, minmax(0, 1fr))`
            const gridMinWidth = isPlantonistas ? 480 : 820
            const lastCol = visibleCols.length - 1

            const weeks = calendarWeeks.filter((week) =>
              isPlantonistas ? visibleCols.some((di) => week[di] != null) : true,
            )

            if (weeks.length === 0) {
              return (
                <Typography color="text.secondary">
                  Sem fins de semana neste mês.
                </Typography>
              )
            }

            return (
              <Stack spacing={2}>
                {weeks.map((week, wi) => {
                  const y = month.getFullYear()
                  const m0 = month.getMonth()
                  const headerBg = alpha(theme.palette.grey[500], 0.08)
                  const weekendBg = alpha(
                    theme.palette.success.main,
                    theme.palette.mode === 'dark' ? 0.12 : 0.08,
                  )
                  const labelBg = alpha(theme.palette.grey[500], 0.06)

                  return (
                    <Reveal key={wi} delay={wi * 90}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        overflow: 'hidden',
                      }}
                    >
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box
                          sx={{
                            minWidth: gridMinWidth,
                            display: 'grid',
                            gridTemplateColumns: gridCols,
                          }}
                        >
                          {/* Canto: rótulo do mês */}
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: labelBg,
                              borderBottom: 1,
                              borderRight: 1,
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                            >
                              {format(month, 'MMM yyyy', { locale: ptBR })}
                            </Typography>
                          </Box>

                          {/* Cabeçalho dos dias */}
                          {visibleCols.map((di, ci) => {
                            const dayNum = week[di]
                            const weekend = di >= 5
                            if (dayNum == null) {
                              return (
                                <Box
                                  key={`h-${wi}-${di}`}
                                  sx={{
                                    p: 1,
                                    bgcolor: weekend ? weekendBg : headerBg,
                                    borderBottom: 1,
                                    borderRight: ci < lastCol ? 1 : 0,
                                    borderColor: 'divider',
                                  }}
                                />
                              )
                            }
                            const date = new Date(y, m0, dayNum, 12, 0, 0, 0)
                            const isToday = isSameDay(date, today)
                            return (
                              <Box
                                key={`h-${wi}-${di}`}
                                component="button"
                                type="button"
                                onClick={() => setDayDialog({ dayNum, date })}
                                sx={{
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  border: 0,
                                  borderBottom: 1,
                                  borderRight: ci < lastCol ? 1 : 0,
                                  borderColor: 'divider',
                                  bgcolor: weekend ? weekendBg : headerBg,
                                  p: 1,
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  justifyContent: 'space-between',
                                  gap: 0.5,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {WEEK_HEADERS[di]}
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 800,
                                    color: isToday ? 'primary.main' : 'text.primary',
                                  }}
                                >
                                  {dayNum}
                                </Typography>
                              </Box>
                            )
                          })}

                          {/* Linhas de turno */}
                          {gridSlots.map((slot, si) => (
                            <Fragment key={slot.key}>
                              <Box
                                sx={{
                                  p: 1,
                                  bgcolor: labelBg,
                                  borderRight: 1,
                                  borderBottom: si < gridSlots.length - 1 ? 1 : 0,
                                  borderColor: 'divider',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {slot.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {slot.time}
                                </Typography>
                              </Box>

                              {visibleCols.map((di, ci) => {
                                const dayNum = week[di]
                                const weekend = di >= 5
                                const cellBorder = {
                                  borderRight: ci < lastCol ? 1 : 0,
                                  borderBottom:
                                    si < gridSlots.length - 1 ? 1 : 0,
                                  borderColor: 'divider',
                                }
                                if (dayNum == null) {
                                  return (
                                    <Box
                                      key={`c-${wi}-${si}-${di}`}
                                      sx={{
                                        ...cellBorder,
                                        bgcolor: weekend ? weekendBg : labelBg,
                                        minHeight: 88,
                                      }}
                                    />
                                  )
                                }
                                const date = new Date(y, m0, dayNum, 12, 0, 0, 0)
                                const shift = turnosPrincipaisParaData(
                                  date,
                                  effectiveSector,
                                )[si]
                                const emails = shift
                                  ? draftDays[String(dayNum)]?.[shift.id] ?? []
                                  : []
                                const clickable = canEdit && shift != null

                                return (
                                  <Box
                                    key={`c-${wi}-${si}-${di}`}
                                    component={clickable ? 'button' : 'div'}
                                    type={clickable ? 'button' : undefined}
                                    onClick={
                                      clickable
                                        ? () => openEditShift(dayNum, shift)
                                        : undefined
                                    }
                                    sx={{
                                      ...cellBorder,
                                      textAlign: 'left',
                                      border: clickable ? 0 : undefined,
                                      ...(clickable ? cellBorder : {}),
                                      width: '100%',
                                      minHeight: 88,
                                      p: 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 0.5,
                                      bgcolor: weekend
                                        ? weekendBg
                                        : 'background.paper',
                                      cursor: clickable ? 'pointer' : 'default',
                                      transition: 'background-color .15s',
                                      ...(clickable
                                        ? {
                                            '&:hover': {
                                              bgcolor: alpha(
                                                theme.palette.primary.main,
                                                0.1,
                                              ),
                                            },
                                          }
                                        : {}),
                                    }}
                                  >
                                    {shift ? (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          letterSpacing: 0.3,
                                          textTransform: 'uppercase',
                                          fontSize: 10,
                                          color:
                                            shift.variant === 'homeoffice'
                                              ? 'warning.main'
                                              : 'success.main',
                                        }}
                                      >
                                        {variantLabel(shift.variant)}
                                      </Typography>
                                    ) : null}
                                    {emails.length === 0 ? (
                                      <Typography
                                        variant="body2"
                                        color="text.disabled"
                                      >
                                        —
                                      </Typography>
                                    ) : (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          flexWrap: 'wrap',
                                          gap: 0.5,
                                        }}
                                      >
                                        {emails.map((em) => (
                                          <Chip
                                            key={em}
                                            label={displayNameForSchedule(
                                              em,
                                              nameByEmail,
                                            )}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              height: 24,
                                              borderRadius: 1.5,
                                              borderColor: 'divider',
                                              bgcolor: alpha(
                                                theme.palette.background.paper,
                                                0.6,
                                              ),
                                              fontSize: 12,
                                              '& .MuiChip-label': { px: 1 },
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Box>
                                )
                              })}
                            </Fragment>
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                    </Reveal>
                  )
                })}
              </Stack>
            )
          })()
          )
        )}

        {!loadingMes && loadedKey ? (
          <Typography variant="caption" color="text.secondary">
            Mês {yearMonth}. Um colaborador pertence a um único setor.
          </Typography>
        ) : null}
      </Stack>

      {/* Detalhe do dia — tabela por turno */}
      <Dialog
        open={dayDialog != null}
        onClose={() => setDayDialog(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ pr: 6 }}>
          {dayDialog
            ? format(dayDialog.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
            : ''}
        </DialogTitle>
        <DialogContent>
          {dayDialog ? (
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    {turnosColunasParaDia(
                      dayDialog.date,
                      dayDialog.dayNum,
                      draftDays,
                      canEdit,
                      effectiveSector,
                    ).map((meta) => (
                      <TableCell
                        key={meta.id}
                        align="center"
                        sx={{
                          verticalAlign: 'bottom',
                          minWidth: 120,
                          borderBottomWidth: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {meta.headline}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.25 }}
                        >
                          {meta.detail}
                        </Typography>
                        {canEdit ? (
                          <IconButton
                            size="small"
                            aria-label={`Editar ${meta.headline}`}
                            onClick={() => openEditShift(dayDialog.dayNum, meta)}
                            sx={{ mt: 0.5 }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {turnosColunasParaDia(
                      dayDialog.date,
                      dayDialog.dayNum,
                      draftDays,
                      canEdit,
                      effectiveSector,
                    ).map((meta) => {
                      const emails = draftDays[String(dayDialog.dayNum)]?.[meta.id] ?? []
                      const nomes = emails.map((em) => displayNameForSchedule(em, nameByEmail))
                      return (
                        <TableCell
                          key={meta.id}
                          align="center"
                          sx={{ verticalAlign: 'top', borderRight: 1, borderColor: 'divider' }}
                        >
                          {nomes.length === 0 ? (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          ) : (
                            <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                              {nomes.map((nome, idx) => (
                                <Typography key={`${meta.id}-${idx}`} variant="body2">
                                  {nome}
                                </Typography>
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDayDialog(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Edição de um turno */}
      <Dialog
        open={cellDialog != null}
        onClose={() => setCellDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {cellDialog
            ? tituloTurnoNoDialogo(cellDialog.dayNum, monthLabelShort, cellDialog.shift)
            : ''}
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={cellAutocompleteOptions}
            isOptionEqualToValue={(a, b) => a.email === b.email}
            getOptionLabel={(o) => o.label}
            value={pendingEmails.map((em) => {
              const hit = cellAutocompleteOptions.find((o) => o.email === em)
              return hit ?? { email: em, label: displayNameForSchedule(em, nameByEmail) }
            })}
            onChange={(_, v) => setPendingEmails(v.map((x) => x.email))}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Colaboradores neste turno"
                placeholder={
                  colleagueOptions.length ? 'Buscar por nome…' : 'Carregando lista…'
                }
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCellDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={applyCellDialog}>
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageChrome>
  )
}
