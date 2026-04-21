import { useCallback, useEffect, useMemo, useState } from 'react'
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
  FormControlLabel,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
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
import { MonthNavigator } from '../features/upgrades/MonthNavigator'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import {
  emptyMesDoc,
  parseEscalaMes,
} from '../lib/escalaFirestore'
import {
  tituloTurnoNoDialogo,
  TURNOS_EXTRAS,
  turnosPrincipaisParaData,
  type TurnoFixoMeta,
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
import { canManageWorkSchedule } from '../lib/permissions'
import {
  SECTOR_LABELS,
  SECTORS,
  type Sector,
} from '../types/profile'
import type { EscalaMesDays } from '../types/escala'
import { escalaMesDocId } from '../types/escala'

/** Semana começando no domingo (calendário comum no Brasil). */
const WEEK_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type ReplicarModeloBase = 'dia1' | 'primeiraSegunda'

function firstMondayDayOfMonth(year: number, monthIndex: number): number {
  for (let d = 1; d <= 7; d += 1) {
    if (new Date(year, monthIndex, d, 12, 0, 0, 0).getDay() === 1) return d
  }
  return 1
}

function diaModeloReplicacao(
  modelo: ReplicarModeloBase,
  year: number,
  monthIndex: number,
): number {
  return modelo === 'dia1' ? 1 : firstMondayDayOfMonth(year, monthIndex)
}

function isDiaUtilSegSex(date: Date): boolean {
  const dow = date.getDay()
  return dow >= 1 && dow <= 5
}

/** Copia a escala do dia modelo para todas as segundas–sextas do mês. Fins de semana intocados. */
function replicarEscalaParaDiasUteis(
  atual: EscalaMesDays,
  month: Date,
  modelo: ReplicarModeloBase,
): EscalaMesDays {
  const y = month.getFullYear()
  const m0 = month.getMonth()
  const lastDay = endOfMonth(month).getDate()
  const srcNum = diaModeloReplicacao(modelo, y, m0)
  const template = atual[String(srcNum)] ?? {}

  const cloneShiftMap = (): Record<string, string[]> => {
    const out: Record<string, string[]> = {}
    for (const [shiftId, emails] of Object.entries(template)) {
      out[shiftId] = [...emails]
    }
    return out
  }

  const next = cloneDays(atual)
  for (let dayNum = 1; dayNum <= lastDay; dayNum += 1) {
    const date = new Date(y, m0, dayNum, 12, 0, 0, 0)
    if (!isDiaUtilSegSex(date)) continue
    next[String(dayNum)] = cloneShiftMap()
  }
  return next
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
): TurnoFixoMeta[] {
  const principais = turnosPrincipaisParaData(date)
  if (mostrarExtrasVazios) return [...principais, ...TURNOS_EXTRAS]
  const extrasComPessoas = TURNOS_EXTRAS.filter(
    (ex) => (daysMap[String(dayNum)]?.[ex.id]?.length ?? 0) > 0,
  )
  return [...principais, ...extrasComPessoas]
}

function totalEscaladosNoDia(dayNum: number, daysMap: EscalaMesDays): number {
  const dm = daysMap[String(dayNum)]
  if (!dm) return 0
  let n = 0
  for (const emails of Object.values(dm)) {
    n += emails.length
  }
  return n
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
  const [extraEmailsRaw, setExtraEmailsRaw] = useState('')

  const calendarWeeks = useMemo(() => {
    const y = month.getFullYear()
    const m0 = month.getMonth()
    const first = new Date(y, m0, 1, 12, 0, 0, 0)
    const lastDay = endOfMonth(month).getDate()
    const jsDow = first.getDay()
    /** Coluna 0 = domingo */
    const sundayFirstPad = jsDow
    const cells: (number | null)[] = []
    for (let i = 0; i < sundayFirstPad; i++) cells.push(null)
    for (let d = 1; d <= lastDay; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [month])

  const [replicarDialogOpen, setReplicarDialogOpen] = useState(false)
  const [modeloReplicacao, setModeloReplicacao] =
    useState<ReplicarModeloBase>('dia1')

  const nameByEmail = useMemo(() => buildEmailToDisplayNameMap(roster), [roster])

  const loadRoster = useCallback(async () => {
    if (!effectiveSector || !profile) {
      setRoster([])
      return
    }
    setRosterError(null)
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
          ? `${r.displayName} (${r.email})`
          : `${prettyLocalPartFromEmail(r.email)} (${r.email})`,
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

  const aplicarReplicacaoUteis = () => {
    const next = replicarEscalaParaDiasUteis(draftDays, month, modeloReplicacao)
    setDraftDays(next)
    setReplicarDialogOpen(false)
  }

  const diaModeloLabel = useMemo(() => {
    const y = month.getFullYear()
    const m0 = month.getMonth()
    const n = diaModeloReplicacao(modeloReplicacao, y, m0)
    const dt = new Date(y, m0, n, 12, 0, 0, 0)
    return format(dt, "d 'de' MMMM", { locale: ptBR })
  }, [month, modeloReplicacao])

  /** Replicação só faz sentido se o dia modelo for dia útil (evita copiar IDs de turno de sáb/dom). */
  const diaModeloEUteis = useMemo(() => {
    const y = month.getFullYear()
    const m0 = month.getMonth()
    const n = diaModeloReplicacao(modeloReplicacao, y, m0)
    return isDiaUtilSegSex(new Date(y, m0, n, 12, 0, 0, 0))
  }, [month, modeloReplicacao])

  const openEditShift = (dayNum: number, shift: TurnoFixoMeta) => {
    if (!canEdit) return
    const initial = draftDays[String(dayNum)]?.[shift.id] ?? []
    setPendingEmails([...initial])
    setExtraEmailsRaw('')
    setDayDialog(null)
    setCellDialog({ dayNum, shift })
  }

  function parseExtraEmails(raw: string): string[] {
    return raw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
  }

  const applyCellDialog = () => {
    if (!cellDialog) return
    const fromExtra = parseExtraEmails(extraEmailsRaw)
    const merged = [...new Set([...pendingEmails, ...fromExtra])]
    const dayKey = String(cellDialog.dayNum)
    setDraftDays((prev) => {
      const next = cloneDays(prev)
      if (!next[dayKey]) next[dayKey] = {}
      next[dayKey][cellDialog.shift.id] = merged
      return next
    })
    setCellDialog(null)
  }

  const monthLabelShort = format(month, 'MM/yyyy')
  const today = new Date()

  const subtitle = effectiveSector ? (
    <>
      Escala do setor <strong>{SECTOR_LABELS[effectiveSector]}</strong>. Clique em um dia no calendário
      para ver os operadores por turno.{' '}
      {canEdit
        ? 'Gestores editam pelos ícones de lápis em cada turno.'
        : 'Somente leitura.'}
    </>
  ) : null

  return (
    <AppPageChrome
      overline="Operação"
      title="Escala de trabalho"
      subtitle={subtitle}
      maxWidth="lg"
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

        <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Turnos fixos
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            Calendário com semana começando no domingo; sábado e domingo com fundo verde claro. Segunda a
            sexta: presencial 08:00–16:20 e 13:40–22:00 · Sábado: presencial manhã, HO tarde · Domingo:
            dois turnos HO · Gestores podem replicar a escala de um dia modelo para todos os dias úteis do
            mês.
          </Typography>
        </Alert>

        {loadError ? <Alert severity="error">{loadError}</Alert> : null}
        {rosterError ? (
          <Alert severity="warning">
            Não foi possível carregar nomes do setor ({rosterError}). Faça deploy da função{' '}
            <code>sectorRoster</code> ou tente mais tarde.
          </Alert>
        ) : null}
        {saveError ? <Alert severity="error">{saveError}</Alert> : null}

        {canEdit ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                Alterações ficam locais até você salvar o mês inteiro.
              </Typography>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap', alignItems: { xs: 'stretch', md: 'center' } }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  disabled={saving || loadingMes}
                  onClick={() => setReplicarDialogOpen(true)}
                >
                  Replicar para dias úteis…
                </Button>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                disabled={!dirty || saving || loadingMes}
                onClick={() => void handleSaveMes()}
              >
                {saving ? 'Salvando…' : 'Salvar mês'}
              </Button>
              <Button
                variant="text"
                size="small"
                disabled={!dirty || saving}
                onClick={handleDiscard}
              >
                Descartar
              </Button>
            </Stack>
          </Paper>
        ) : null}

        {loadingMes ? (
          <Typography color="text.secondary">Carregando…</Typography>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, sm: 2 },
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              {format(month, 'MMMM yyyy', { locale: ptBR })}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 0.75,
                mb: 1,
              }}
            >
              {WEEK_HEADERS.map((h) => (
                <Typography
                  key={h}
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: 'center', fontWeight: 700 }}
                >
                  {h}
                </Typography>
              ))}
            </Box>

            {calendarWeeks.map((week, wi) => (
              <Box
                key={wi}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: 0.75,
                  mb: 0.75,
                }}
              >
                {week.map((dayNum, di) => {
                  if (dayNum == null) {
                    return <Box key={`e-${wi}-${di}`} sx={{ minHeight: 52 }} />
                  }
                  const y = month.getFullYear()
                  const m0 = month.getMonth()
                  const date = new Date(y, m0, dayNum, 12, 0, 0, 0)
                  const dow = date.getDay()
                  const weekend = dow === 0 || dow === 6
                  const n = totalEscaladosNoDia(dayNum, draftDays)
                  const isToday = isSameDay(date, today)

                  const bgUteis = alpha(
                    theme.palette.grey[500],
                    theme.palette.mode === 'dark' ? 0.08 : 0.05,
                  )
                  const bgFimSemana = alpha(
                    theme.palette.success.main,
                    theme.palette.mode === 'dark' ? 0.14 : 0.11,
                  )

                  return (
                    <Box
                      key={dayNum}
                      component="button"
                      type="button"
                      onClick={() => setDayDialog({ dayNum, date })}
                      sx={{
                        cursor: 'pointer',
                        border: 1,
                        borderColor: isToday ? 'primary.main' : 'divider',
                        borderRadius: 1.5,
                        minHeight: 52,
                        py: 0.75,
                        px: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 0.25,
                        bgcolor: weekend ? bgFimSemana : bgUteis,
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {dayNum}
                      </Typography>
                      {n > 0 ? (
                        <Chip label={n} size="small" sx={{ height: 20, fontSize: 11 }} />
                      ) : (
                        <Box sx={{ height: 20 }} />
                      )}
                    </Box>
                  )
                })}
              </Box>
            ))}
          </Paper>
        )}

        {!loadingMes && loadedKey ? (
          <Typography variant="caption" color="text.secondary">
            Mês {yearMonth}. Um colaborador pertence a um único setor.
          </Typography>
        ) : null}
      </Stack>

      <Dialog
        open={replicarDialogOpen}
        onClose={() => setReplicarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Replicar para dias úteis</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A escala do dia <strong>{diaModeloLabel}</strong> será copiada para{' '}
            <strong>todas as segundas-feiras a sextas-feiras</strong> deste mês. Sábados e domingos não
            são alterados. Use «Salvar mês» para gravar no Firestore.
          </Typography>
          {!diaModeloEUteis ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              O dia modelo não é segunda a sexta (ex.: dia 1 em fim de semana). Escolha «Primeira
              segunda-feira» ou monte a escala num dia útil antes de replicar.
            </Alert>
          ) : null}
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Dia modelo</FormLabel>
            <RadioGroup
              value={modeloReplicacao}
              onChange={(e) =>
                setModeloReplicacao(e.target.value as ReplicarModeloBase)
              }
            >
              <FormControlLabel
                value="dia1"
                control={<Radio size="small" />}
                label="Sempre o dia 1 do mês"
              />
              <FormControlLabel
                value="primeiraSegunda"
                control={<Radio size="small" />}
                label="Primeira segunda-feira do mês"
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplicarDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={aplicarReplicacaoUteis}
            disabled={!diaModeloEUteis}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

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
          <TextField
            fullWidth
            margin="normal"
            label="Incluir por e-mail (opcional)"
            placeholder="email1@empresa.com, email2@empresa.com"
            value={extraEmailsRaw}
            onChange={(e) => setExtraEmailsRaw(e.target.value)}
            helperText="Separados por vírgula, se a pessoa não aparecer na busca."
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
