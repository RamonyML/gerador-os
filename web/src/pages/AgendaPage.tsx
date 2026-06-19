import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  InputAdornment,
  Popover,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, keyframes, useTheme } from '@mui/material/styles'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import TodayRoundedIcon from '@mui/icons-material/TodayRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useColorMode } from '../contexts/ColorModeContext'
import { useAuth } from '../contexts/AuthContext'
import { canManageAgendaTecnicos } from '../lib/permissions'
import { AppPageChrome } from '../components/AppPageChrome'
import { db } from '../lib/firebase'
import {
  getTecnicosFromPreviousDay,
  saveDia,
  saveColorSettings,
  searchAgendaCells,
  subscribeDia,
  subscribeColorSettings,
  type CellSearchResult,
} from '../lib/agendaFirestore'
import {
  AGENDA_AREA_LABELS,
  AGENDA_CELL_STATUS_LABELS,
  AREA_PALETTE,
  COLOR_DEFS,
  NEGADO_COLOR,
  cellKey,
  emptyDia,
  newId,
  type AgendaArea,
  type AgendaCell,
  type AgendaCellHistoryEntry,
  type AgendaCellStatus,
  type AgendaColorSettings,
  type AgendaDia,
  type AgendaTecnico,
  type CellColor,
  type ColorDef,
} from '../types/agenda'

function todayISO(): string {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/** Extrai o bairro do padrão "... - BAIRRO" ao final do texto da célula. */
function extractBairro(text: string): string {
  const idx = text.lastIndexOf(' - ')
  if (idx === -1) return ''
  const candidate = text.slice(idx + 3).trim()
  // Descarta se parecer protocolo/valor (contém ':', '(' ou número isolado)
  if (candidate.includes(':') || candidate.includes('(') || /^\d+$/.test(candidate)) return ''
  return candidate
}

function labelBR(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const CAR_COLOR = '#2e7d32'
const MOTO_COLOR = '#e65100'

// [light, dark]
const CELL_STATUS_BG: Record<AgendaCellStatus, [string, string]> = {
  redes:          ['rgba(29,78,216,0.10)',  'rgba(147,197,253,0.14)'],
  validado:       ['rgba(21,128,61,0.10)',  'rgba(134,239,172,0.14)'],
  com_pendencia:  ['rgba(180,83,9,0.10)',   'rgba(252,211,77,0.14)'],
  reagendar:      ['rgba(185,28,28,0.10)',  'rgba(252,165,165,0.14)'],
}
const CELL_STATUS_TEXT: Record<AgendaCellStatus, [string, string]> = {
  redes:          ['#1d4ed8', '#93c5fd'],
  validado:       ['#15803d', '#86efac'],
  com_pendencia:  ['#b45309', '#fcd34d'],
  reagendar:      ['#b91c1c', '#fca5a5'],
}
const CELL_STATUS_BORDER: Record<AgendaCellStatus, string> = {
  redes:          'rgba(29,78,216,0.20)',
  validado:       'rgba(21,128,61,0.20)',
  com_pendencia:  'rgba(180,83,9,0.20)',
  reagendar:      'rgba(185,28,28,0.20)',
}

const STATUS_OPTION_COLOR: Record<AgendaCellStatus, string> = {
  redes:         '#1d4ed8',
  validado:      '#15803d',
  com_pendencia: '#b45309',
  reagendar:     '#b91c1c',
}

function CarIcon() {
  return (
    <SvgIcon sx={{ fontSize: 24, color: CAR_COLOR }}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </SvgIcon>
  )
}

function MotoIcon() {
  return (
    <SvgIcon sx={{ fontSize: 24, color: MOTO_COLOR }}>
      <path d="m18 14-1-3" />
      <path d="m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81" />
      <path d="M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5" />
      <circle cx="19" cy="17" r="3" />
      <circle cx="5" cy="17" r="3" />
    </SvgIcon>
  )
}

const cellHighlightPulse = keyframes`
  0%, 65% {
    outline: 3px solid #3CAE63;
    outline-offset: -2px;
    box-shadow: 0 0 10px 2px rgba(60,174,99,0.35);
  }
  100% {
    outline: 3px solid transparent;
    outline-offset: -2px;
    box-shadow: none;
  }
`

function slotHour(label: string): number {
  const m = label.match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function isAfternoonSlot(label: string): boolean {
  return slotHour(label) >= 13
}

function is1830Slot(label: string): boolean {
  return label.trim() === '18:30'
}

export function AgendaPage() {
  const theme = useTheme()
  const { mode } = useColorMode()
  const { profile, user } = useAuth()
  const isDark = mode === 'dark'
  const canManageTecnicos = canManageAgendaTecnicos(profile ?? null)

  const [area, setArea] = useState<AgendaArea>('manutencao')
  const [date, setDate] = useState<string>(todayISO())
  const [dia, setDia] = useState<AgendaDia>(emptyDia('agenda', date))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colorSettings, setColorSettings] = useState<AgendaColorSettings>({ overrides: {} })

  // Editores
  const [textEdit, setTextEdit] = useState<{ key: string } | null>(null)
  const [textValue, setTextValue] = useState('')
  const [textBold, setTextBold] = useState(false)
  const [colorAnchor, setColorAnchor] = useState<{
    el: HTMLElement
    key: string
  } | null>(null)
  const [tecnicosOpen, setTecnicosOpen] = useState(false)
  const [slotsOpen, setSlotsOpen] = useState(false)
  const [negadoEdit, setNegadoEdit] = useState<{ id: string } | null>(null)
  const [negadoValue, setNegadoValue] = useState('')
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const [cellMenuAnchor, setCellMenuAnchor] = useState<{ el: HTMLElement; key: string } | null>(null)
  const [historyKey, setHistoryKey] = useState<string | null>(null)
  const [statusKey, setStatusKey] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [highlightedCellKey, setHighlightedCellKey] = useState<string | null>(null)
  const prevLoadingRef = useRef(true)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeDia(
      db,
      area,
      date,
      (remote) => {
        setDia(remote ?? emptyDia(area, date))
        setLoading(false)
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Falha ao carregar a agenda.')
        setLoading(false)
      },
    )
    return unsub
  }, [area, date])

  useEffect(() => {
    setColorSettings({ overrides: {} })
    return subscribeColorSettings(db, area, setColorSettings, (e) => {
      console.error('color settings:', e)
    })
  }, [area])

  // Scroll para célula destacada quando o loading termina
  useEffect(() => {
    const wasLoading = prevLoadingRef.current
    prevLoadingRef.current = loading
    if (wasLoading && !loading && highlightedCellKey) {
      const el = document.querySelector(`[data-cellkey="${highlightedCellKey}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [loading, highlightedCellKey])

  // Apaga o destaque após 4 segundos
  useEffect(() => {
    if (!highlightedCellKey) return
    const t = setTimeout(() => setHighlightedCellKey(null), 4000)
    return () => clearTimeout(t)
  }, [highlightedCellKey])

  const persist = (next: AgendaDia) => {
    setDia(next)
    void saveDia(db, next).catch((e) => {
      setError(e instanceof Error ? e.message : 'Falha ao salvar.')
    })
  }

  const resolvedColorDefs = useMemo((): Record<CellColor, ColorDef> => {
    const defs: Record<CellColor, ColorDef> = { ...COLOR_DEFS }
    for (const [k, ov] of Object.entries(colorSettings.overrides)) {
      if (!ov) continue
      const c = k as CellColor
      defs[c] = {
        ...defs[c],
        ...(ov.label !== undefined ? { label: ov.label } : {}),
        ...(ov.fill !== undefined ? { fill: ov.fill } : {}),
        ...(ov.fillDark !== undefined ? { fillDark: ov.fillDark } : {}),
        ...(ov.border !== undefined ? { border: ov.border } : {}),
        ...(ov.textColor !== undefined ? { textColor: ov.textColor } : {}),
        ...(ov.textColorDark !== undefined ? { textColorDark: ov.textColorDark } : {}),
      }
    }
    return defs
  }, [colorSettings])

  const dayOfWeek = useMemo(() => new Date(`${date}T00:00:00`).getDay(), [date])
  const isSunday = dayOfWeek === 0
  const isSaturday = dayOfWeek === 6

  const isCellDisabled = (slotLabel: string, tec: AgendaTecnico): boolean => {
    if (isSunday) return true
    if (isSaturday && isAfternoonSlot(slotLabel)) return true
    if (is1830Slot(slotLabel) && !tec.tem1830) return true
    return false
  }

  const colorFill = (color: CellColor): string =>
    isDark ? resolvedColorDefs[color].fillDark : resolvedColorDefs[color].fill
  const cellTextColor = isDark ? '#e9ecef' : '#1f2937'

  // ---- Operações de célula ----
  const getCell = (key: string): AgendaCell | undefined => dia.cells[key]

  const openText = (key: string) => {
    const c = getCell(key)
    setTextValue(c?.text ?? '')
    setTextBold(c?.bold ?? false)
    setTextEdit({ key })
  }

  const saveText = () => {
    if (!textEdit) return
    const key = textEdit.key
    const prev = getCell(key)
    const text = textValue.trim()
    const cells = { ...dia.cells }
    const history: AgendaCellHistoryEntry[] = [...(prev?.history ?? [])]
    if (prev?.text && prev.text !== text) {
      history.unshift({
        at: new Date().toISOString(),
        byUid: user?.uid ?? '',
        byName: profile?.displayName ?? 'Usuário',
        prevText: prev.text,
      })
    }
    if (!text && !(prev?.color && prev.color !== 'branco') && !prev?.status) {
      if (history.length > 0) {
        cells[key] = { text: '', color: 'branco', bold: false, history }
      } else {
        delete cells[key]
      }
    } else {
      cells[key] = {
        text,
        color: prev?.color ?? 'branco',
        bold: textBold,
        status: prev?.status,
        statusObs: prev?.statusObs,
        history: history.length > 0 ? history : undefined,
      }
    }
    persist({ ...dia, cells })
    setTextEdit(null)
  }

  const setColor = (key: string, color: CellColor) => {
    const prev = getCell(key)
    const cells = { ...dia.cells }
    if (!prev && color === 'branco') {
      setColorAnchor(null)
      return
    }
    cells[key] = { text: prev?.text ?? '', color, bold: prev?.bold ?? false, status: prev?.status, statusObs: prev?.statusObs, history: prev?.history }
    persist({ ...dia, cells })
    setColorAnchor(null)
  }

  const clearCell = (key: string) => {
    const prev = getCell(key)
    const cells = { ...dia.cells }
    if (prev?.text?.trim()) {
      const history: AgendaCellHistoryEntry[] = [
        { at: new Date().toISOString(), byUid: user?.uid ?? '', byName: profile?.displayName ?? 'Usuário', prevText: prev.text },
        ...(prev.history ?? []),
      ]
      cells[key] = { text: '', color: 'branco', bold: false, history }
    } else {
      delete cells[key]
    }
    persist({ ...dia, cells })
    setTextEdit(null)
  }

  const moveCell = (srcKey: string, tgtKey: string) => {
    if (srcKey === tgtKey) return
    const srcCell = dia.cells[srcKey]
    const tgtCell = dia.cells[tgtKey]
    const cells = { ...dia.cells }
    if (srcCell) cells[tgtKey] = srcCell; else delete cells[tgtKey]
    if (tgtCell) cells[srcKey] = tgtCell; else delete cells[srcKey]
    persist({ ...dia, cells })
  }

  const setCellStatus = (key: string, status: AgendaCellStatus | null, obs: string) => {
    const prev = getCell(key)
    if (!prev) return
    const cells = { ...dia.cells }
    cells[key] = { ...prev, status: status ?? undefined, statusObs: obs.trim() || undefined }
    persist({ ...dia, cells })
  }

  const revertToHistory = (key: string, prevText: string) => {
    const current = getCell(key)
    if (!current) return
    const cells = { ...dia.cells }
    const history: AgendaCellHistoryEntry[] = [
      { at: new Date().toISOString(), byUid: user?.uid ?? '', byName: profile?.displayName ?? 'Usuário', prevText: current.text },
      ...(current.history ?? []),
    ]
    cells[key] = { ...current, text: prevText, history }
    persist({ ...dia, cells })
  }

  const moverParaNegados = (key: string, origem: string) => {
    const c = getCell(key)
    if (!c) return
    const cells = { ...dia.cells }
    delete cells[key]
    const negados = [
      ...dia.negados,
      { id: newId('neg'), text: c.text, origem },
    ]
    persist({ ...dia, cells, negados })
    setTextEdit(null)
  }

  // ---- Técnicos ----
  const addTecnico = (nome: string, veiculo: 'carro' | 'moto' = 'carro') => {
    const n = nome.trim()
    if (!n) return
    persist({
      ...dia,
      tecnicos: [...dia.tecnicos, { id: newId('tec'), nome: n, veiculo }],
    })
  }
  const renameTecnico = (id: string, nome: string) => {
    persist({
      ...dia,
      tecnicos: dia.tecnicos.map((t) => (t.id === id ? { ...t, nome } : t)),
    })
  }
  const changeVeiculo = (id: string, veiculo: 'carro' | 'moto') => {
    persist({
      ...dia,
      tecnicos: dia.tecnicos.map((t) => (t.id === id ? { ...t, veiculo } : t)),
    })
  }
  const toggle1830 = (id: string) => {
    persist({
      ...dia,
      tecnicos: dia.tecnicos.map((t): AgendaTecnico => {
        if (t.id !== id) return t
        if (t.tem1830) {
          const updated = { ...t }
          delete updated.tem1830
          return updated
        }
        return { ...t, tem1830: true }
      }),
    })
  }
  const removeTecnico = (id: string) => {
    const cells = { ...dia.cells }
    for (const key of Object.keys(cells)) {
      if (key.startsWith(`${id}__`)) delete cells[key]
    }
    persist({ ...dia, cells, tecnicos: dia.tecnicos.filter((t) => t.id !== id) })
  }
  const copyTecnicos = async () => {
    try {
      const prev = await getTecnicosFromPreviousDay(db, area, date)
      if (prev.length === 0) {
        setError('Nenhum dia anterior com técnicos foi encontrado.')
        return
      }
      // Gera novos ids para não colidir com células existentes.
      const tecnicos = prev.map((t) => ({ id: newId('tec'), nome: t.nome, veiculo: t.veiculo }))
      persist({ ...dia, tecnicos: [...dia.tecnicos, ...tecnicos] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao copiar técnicos.')
    }
  }

  // ---- Slots ----
  const addSlot = (label: string) => {
    const l = label.trim()
    if (!l) return
    persist({ ...dia, slots: [...dia.slots, { id: newId('s'), label: l }] })
  }
  const renameSlot = (id: string, label: string) => {
    persist({
      ...dia,
      slots: dia.slots.map((s) => (s.id === id ? { ...s, label } : s)),
    })
  }
  const removeSlot = (id: string) => {
    const cells = { ...dia.cells }
    for (const key of Object.keys(cells)) {
      if (key.endsWith(`__${id}`)) delete cells[key]
    }
    persist({ ...dia, cells, slots: dia.slots.filter((s) => s.id !== id) })
  }

  // ---- Negados ----
  const addNegado = (text: string) => {
    const t = text.trim()
    if (!t) return
    persist({ ...dia, negados: [...dia.negados, { id: newId('neg'), text: t }] })
  }
  const openNegadoEdit = (id: string, text: string) => {
    setNegadoValue(text)
    setNegadoEdit({ id })
  }
  const saveNegado = () => {
    if (!negadoEdit) return
    persist({
      ...dia,
      negados: dia.negados.map((n) =>
        n.id === negadoEdit.id ? { ...n, text: negadoValue.trim() } : n,
      ),
    })
    setNegadoEdit(null)
  }
  const removeNegado = (id: string) => {
    persist({ ...dia, negados: dia.negados.filter((n) => n.id !== id) })
  }

  const handleSaveColorSettings = (newSettings: AgendaColorSettings) => {
    setColorSettings(newSettings)
    void saveColorSettings(db, area, newSettings).catch((e) => {
      setError(e instanceof Error ? e.message : 'Falha ao salvar configurações de cores.')
    })
  }

  const palette = AREA_PALETTE[area]

  const effectivePalette = useMemo(() => {
    const extra = (colorSettings.extraPaletteColors ?? []).filter(c => !palette.includes(c))
    return [...palette, ...extra]
  }, [palette, colorSettings.extraPaletteColors])

  const isAgenda = area === 'agenda'
  const stickyBg = theme.palette.background.paper

  const tecnicosOrdenados = useMemo(
    () => [...dia.tecnicos].sort((a, b) => {
      const order: Record<string, number> = { carro: 0, moto: 1 }
      return (order[a.veiculo] ?? 0) - (order[b.veiculo] ?? 0)
    }),
    [dia.tecnicos],
  )

  const totalAgendados = useMemo(
    () => Object.values(dia.cells).filter((c) => c.text.trim()).length,
    [dia.cells],
  )

  return (
    <>
      <AppPageChrome
        overline="Operação"
        title="Agenda"
        subtitle={
          <Typography variant="body1" color="text.secondary">
            Grade compartilhada da equipe técnica. Organize os agendamentos, acompanhe
            o andamento de cada visita e mantenha o time alinhado em tempo real.
          </Typography>
        }
        maxWidth="xl"
        illustration="agenda"
        illustrationAlt="Agenda de visitas técnicas"
      >
        <Stack spacing={2}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          <Paper
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, overflow: 'hidden' }}
          >
            <Tabs
              value={area}
              onChange={(_, v) => setArea(v as AgendaArea)}
              sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="manutencao" label={AGENDA_AREA_LABELS.manutencao} />
            </Tabs>

            {/* Barra de navegação por dia */}
            <Box
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <IconButton onClick={() => setDate(shiftISO(date, -1))} aria-label="Dia anterior">
                <ChevronLeftRoundedIcon />
              </IconButton>
              <TextField
                type="date"
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value || todayISO())}
                sx={{ width: 170 }}
              />
              <IconButton onClick={() => setDate(shiftISO(date, 1))} aria-label="Próximo dia">
                <ChevronRightRoundedIcon />
              </IconButton>
              <Button
                size="small"
                startIcon={<TodayRoundedIcon />}
                onClick={() => setDate(todayISO())}
              >
                Hoje
              </Button>
              <Typography
                variant="subtitle2"
                sx={{ textTransform: 'capitalize', fontWeight: 700, ml: 1, minWidth: 0 }}
              >
                {labelBR(date)}
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Chip size="small" variant="outlined" label={`${totalAgendados} agendamento(s)`} />
            </Box>

            <Divider />

            {/* Toolbar de gestão */}
            <Box
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: 1.25,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {canManageTecnicos ? (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PersonAddAlt1OutlinedIcon />}
                    onClick={() => setTecnicosOpen(true)}
                  >
                    Técnicos
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={() => void copyTecnicos()}
                  >
                    Copiar técnicos do dia anterior
                  </Button>
                </>
              ) : null}
              <Button
                size="small"
                color="inherit"
                startIcon={<ScheduleRoundedIcon />}
                onClick={() => setSlotsOpen(true)}
              >
                Horários
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                size="small"
                color="inherit"
                startIcon={<SearchRoundedIcon />}
                onClick={() => setSearchOpen(true)}
                sx={{ ml: 'auto' }}
              >
                Buscar
              </Button>
            </Box>

            <Divider />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : dia.tecnicos.length === 0 ? (
              <Box sx={{ px: 2.5, py: 5, textAlign: 'center' }}>
                <GroupsOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
                  Nenhum técnico neste dia
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Adicione técnicos para montar a grade, ou copie os do dia anterior.
                </Typography>
                {canManageTecnicos ? (
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddAlt1OutlinedIcon />}
                      onClick={() => setTecnicosOpen(true)}
                    >
                      Adicionar técnico
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ContentCopyRoundedIcon />}
                      onClick={() => void copyTecnicos()}
                    >
                      Copiar do dia anterior
                    </Button>
                  </Stack>
                ) : null}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Box sx={{ flex: 1, overflowX: 'auto', minWidth: 0, transform: 'scaleY(-1)' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `170px repeat(${dia.slots.length}, minmax(180px, 1fr))`,
                      minWidth: 'fit-content',
                      transform: 'scaleY(-1)',
                    }}
                  >
                    {/* Cabeçalho */}
                    <Box
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        bgcolor: stickyBg,
                        borderBottom: 1,
                        borderRight: 1,
                        borderColor: 'divider',
                        p: 1,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Técnico
                    </Box>
                    {dia.slots.map((s) => (
                      <Box
                        key={s.id}
                        sx={{
                          borderBottom: 1,
                          borderRight: 1,
                          borderColor: 'divider',
                          p: 1,
                          fontWeight: 700,
                          fontSize: 13,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05),
                        }}
                      >
                        {s.label}
                      </Box>
                    ))}

                    {/* Linhas */}
                    {tecnicosOrdenados.map((t) => (
                      <Box key={t.id} sx={{ display: 'contents' }}>
                        <Box
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            bgcolor: stickyBg,
                            borderBottom: 1,
                            borderRight: 1,
                            borderColor: 'divider',
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 0.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{t.nome}</Typography>
                          {t.veiculo === 'carro' ? <CarIcon /> : <MotoIcon />}
                        </Box>
                        {dia.slots.map((s) => {
                          const key = cellKey(t.id, s.id)
                          const c = getCell(key)
                          const disabled = isCellDisabled(s.label, t)
                          const fill = c && !disabled ? colorFill(c.color) : 'transparent'
                          const resolvedTextColor = c && !disabled
                            ? (isDark
                              ? (resolvedColorDefs[c.color].textColorDark ?? cellTextColor)
                              : (resolvedColorDefs[c.color].textColor ?? cellTextColor))
                            : cellTextColor
                          const bairro = c?.text ? extractBairro(c.text) : ''
                          const mainText = bairro && c?.text
                            ? c.text.slice(0, c.text.lastIndexOf(' - ' + bairro)).trim()
                            : (c?.text ?? '')
                          const isDragOver = !disabled && dragOverKey === key && draggingKey !== key
                          return (
                            <Box
                              key={s.id}
                              data-cellkey={key}
                              draggable={!disabled && !!c?.text}
                              onDragStart={disabled ? undefined : (e) => {
                                e.dataTransfer.effectAllowed = 'move'
                                e.dataTransfer.setData('text/plain', key)
                                setDraggingKey(key)
                              }}
                              onDragEnd={disabled ? undefined : () => { setDraggingKey(null); setDragOverKey(null) }}
                              onDragOver={disabled ? undefined : (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
                              onDragEnter={disabled ? undefined : (e) => { e.preventDefault(); setDragOverKey(key) }}
                              onDragLeave={disabled ? undefined : (e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverKey(null)
                              }}
                              onDrop={disabled ? undefined : (e) => {
                                e.preventDefault()
                                const src = e.dataTransfer.getData('text/plain')
                                if (src) moveCell(src, key)
                                setDraggingKey(null)
                                setDragOverKey(null)
                              }}
                              sx={{
                                position: 'relative',
                                borderBottom: 1,
                                borderRight: 1,
                                borderColor: 'divider',
                                outline: isDragOver ? `2px solid ${theme.palette.primary.main}` : 'none',
                                outlineOffset: -2,
                                minHeight: 84,
                                bgcolor: fill,
                                p: 0.75,
                                opacity: draggingKey === key ? 0.35 : 1,
                                transition: 'opacity 0.15s',
                                ...(highlightedCellKey === key ? {
                                  animation: `${cellHighlightPulse} 4s ease-out forwards`,
                                  zIndex: 1,
                                } : {}),
                                ...(disabled ? {
                                  cursor: 'not-allowed',
                                  backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 5px, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} 5px, ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} 7px)`,
                                } : {
                                  cursor: c?.text ? 'default' : 'pointer',
                                  '&:hover .drag-handle': { opacity: 0.5 },
                                  '&:hover .cell-menu-btn': { opacity: 1 },
                                }),
                              }}
                              onClick={() => { if (!disabled && !draggingKey) openText(key) }}
                            >
                              {disabled ? null : (
                                <>
                                  {/* Handle de arrasto — canto superior esquerdo */}
                                  {c?.text ? (
                                    <Box
                                      className="drag-handle"
                                      sx={{
                                        position: 'absolute',
                                        top: 2,
                                        left: 2,
                                        opacity: 0.18,
                                        transition: 'opacity 0.15s',
                                        cursor: 'grab',
                                        display: 'flex',
                                        color: 'text.secondary',
                                        '&:active': { cursor: 'grabbing' },
                                      }}
                                    >
                                      <DragIndicatorIcon sx={{ fontSize: 14 }} />
                                    </Box>
                                  ) : null}

                                  {/* 3 pontos — canto superior direito, aparece no hover */}
                                  <Box
                                    className="cell-menu-btn"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setCellMenuAnchor({ el: e.currentTarget as HTMLElement, key })
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 1,
                                      right: 1,
                                      opacity: 0,
                                      transition: 'opacity 0.15s',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: 'text.secondary',
                                      zIndex: 1,
                                    }}
                                  >
                                    <MoreVertRoundedIcon sx={{ fontSize: 15 }} />
                                  </Box>

                                  {/* Indicador negrito — canto superior direito */}
                                  {c?.bold ? (
                                    <PriorityHighRoundedIcon
                                      sx={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 16,
                                        fontSize: 16,
                                        color: theme.palette.warning.main,
                                      }}
                                    />
                                  ) : null}

                                  {/* Conteúdo */}
                                  {c?.text ? (
                                    <>
                                      <Typography
                                        sx={{
                                          fontSize: 12,
                                          lineHeight: 1.3,
                                          color: resolvedTextColor,
                                          fontWeight: c.bold ? 800 : 400,
                                          whiteSpace: 'pre-wrap',
                                          display: '-webkit-box',
                                          WebkitLineClamp: bairro ? 4 : 5,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          pl: 1.5,
                                          pr: 1.5,
                                        }}
                                      >
                                        {mainText}
                                      </Typography>
                                      {bairro ? (
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.25,
                                            mt: 0.5,
                                            mx: -0.75,
                                            px: 1,
                                            py: 0.4,
                                            bgcolor: isDark
                                              ? 'rgba(255,255,255,0.11)'
                                              : 'rgba(0,0,0,0.08)',
                                            borderTop: 1,
                                            borderColor: isDark
                                              ? 'rgba(255,255,255,0.08)'
                                              : 'rgba(0,0,0,0.06)',
                                          }}
                                        >
                                          <PlaceOutlinedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                          <Typography
                                            sx={{
                                              fontSize: 10,
                                              fontWeight: 700,
                                              color: 'text.secondary',
                                              lineHeight: 1,
                                              letterSpacing: 0.3,
                                            }}
                                          >
                                            {bairro}
                                          </Typography>
                                        </Box>
                                      ) : null}

                                      {c.status ? (
                                        <Tooltip title={c.statusObs || ''} placement="top" arrow disableHoverListener={!c.statusObs}>
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              mt: 0.25,
                                              mx: -0.75,
                                              px: 1,
                                              py: 0.35,
                                              bgcolor: CELL_STATUS_BG[c.status][isDark ? 1 : 0],
                                              borderTop: '1px solid',
                                              borderColor: CELL_STATUS_BORDER[c.status],
                                              cursor: c.statusObs ? 'help' : 'default',
                                            }}
                                          >
                                            <Typography
                                              sx={{
                                                fontSize: 9,
                                                fontWeight: 800,
                                                letterSpacing: 0.5,
                                                textTransform: 'uppercase',
                                                color: CELL_STATUS_TEXT[c.status][isDark ? 1 : 0],
                                                lineHeight: 1,
                                              }}
                                            >
                                              {AGENDA_CELL_STATUS_LABELS[c.status]}
                                            </Typography>
                                          </Box>
                                        </Tooltip>
                                      ) : null}
                                    </>
                                  ) : (
                                    <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                                      +
                                    </Typography>
                                  )}

                                </>
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <ColorLegendSidebar
                  area={area}
                  colorSettings={colorSettings}
                  effectivePalette={effectivePalette}
                  canManage={canManageTecnicos}
                  isDark={isDark}
                  resolvedColorDefs={resolvedColorDefs}
                  onSave={handleSaveColorSettings}
                />
              </Box>
            )}
          </Paper>

          {/* Sub-área de Negados (somente Agenda) */}
          {isAgenda ? (
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: alpha(NEGADO_COLOR.border, 0.6),
                borderRadius: 2.5,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: alpha(NEGADO_COLOR.border, isDark ? 0.18 : 0.08),
                }}
              >
                <BlockRoundedIcon sx={{ color: NEGADO_COLOR.border }} fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Negados
                </Typography>
                <Chip size="small" variant="outlined" label={dia.negados.length} />
                <Box sx={{ flex: 1 }} />
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => addNegado('Novo registro negado')}
                >
                  Adicionar
                </Button>
              </Box>
              <Divider />
              {dia.negados.length === 0 ? (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum agendamento negado neste dia.
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {dia.negados.map((n) => (
                    <Box
                      key={n.id}
                      sx={{
                        px: 2,
                        py: 1.25,
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        bgcolor: isDark ? NEGADO_COLOR.fillDark : NEGADO_COLOR.fill,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap', color: cellTextColor }}
                        >
                          {n.text || '—'}
                        </Typography>
                        {n.origem ? (
                          <Typography variant="caption" color="text.secondary">
                            Origem: {n.origem}
                          </Typography>
                        ) : null}
                      </Box>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openNegadoEdit(n.id, n.text)}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover">
                        <IconButton size="small" color="error" onClick={() => removeNegado(n.id)}>
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          ) : null}
        </Stack>
      </AppPageChrome>

      {/* Popover de cores */}
      <Popover
        open={colorAnchor != null}
        anchorEl={colorAnchor?.el ?? null}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 1.25, display: 'flex', gap: 0.75, flexWrap: 'wrap', maxWidth: 220 }}>
          {effectivePalette.map((color) => (
            <Tooltip key={color} title={resolvedColorDefs[color].label} placement="top" arrow>
              <Box
                onClick={() => colorAnchor && setColor(colorAnchor.key, color)}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  bgcolor: colorFill(color),
                  border: 2,
                  borderColor: resolvedColorDefs[color].border,
                  transition: 'transform 0.1s ease',
                  '&:hover': { transform: 'scale(1.12)' },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Popover>

      {/* Diálogo de edição de texto */}
      <Dialog open={textEdit != null} onClose={() => setTextEdit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar agendamento</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Cliente, serviço, observações…"
            sx={{ mt: 0.5 }}
          />
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<PriorityHighRoundedIcon />}
              label={textBold ? 'Em destaque' : 'Destacar (negrito)'}
              color={textBold ? 'warning' : 'default'}
              variant={textBold ? 'filled' : 'outlined'}
              onClick={() => setTextBold((b) => !b)}
            />
            {textEdit && getCell(textEdit.key) ? (
              <Button
                size="small"
                color="inherit"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => textEdit && clearCell(textEdit.key)}
              >
                Limpar célula
              </Button>
            ) : null}
            {isAgenda && textEdit && getCell(textEdit.key)?.text ? (
              <Button
                size="small"
                color="error"
                startIcon={<BlockRoundedIcon />}
                onClick={() => {
                  if (!textEdit) return
                  const [tid, sid] = textEdit.key.split('__')
                  const tec = dia.tecnicos.find((x) => x.id === tid)?.nome ?? ''
                  const slot = dia.slots.find((x) => x.id === sid)?.label ?? ''
                  moverParaNegados(textEdit.key, [tec, slot].filter(Boolean).join(' · '))
                }}
              >
                Negar (mover p/ Negados)
              </Button>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setTextEdit(null)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={saveText}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu 3 pontos da célula */}
      <Menu
        open={cellMenuAnchor != null}
        anchorEl={cellMenuAnchor?.el ?? null}
        onClose={() => setCellMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (cellMenuAnchor) { openText(cellMenuAnchor.key); setCellMenuAnchor(null) }
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 18, mr: 1.25, color: 'text.secondary' }} />
          Editar texto
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (cellMenuAnchor) {
              setColorAnchor({ el: cellMenuAnchor.el, key: cellMenuAnchor.key })
              setCellMenuAnchor(null)
            }
          }}
        >
          <ColorLensOutlinedIcon sx={{ fontSize: 18, mr: 1.25, color: 'text.secondary' }} />
          Mudar cor
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (cellMenuAnchor) { setHistoryKey(cellMenuAnchor.key); setCellMenuAnchor(null) }
          }}
        >
          <HistoryRoundedIcon sx={{ fontSize: 18, mr: 1.25, color: 'text.secondary' }} />
          Histórico de edições
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (cellMenuAnchor) { setStatusKey(cellMenuAnchor.key); setCellMenuAnchor(null) }
          }}
        >
          <LabelOutlinedIcon sx={{ fontSize: 18, mr: 1.25, color: 'text.secondary' }} />
          Adicionar status
        </MenuItem>
      </Menu>

      {/* Diálogo de histórico de edições */}
      <HistoryDialog
        open={historyKey != null}
        cell={historyKey ? getCell(historyKey) : undefined}
        onClose={() => setHistoryKey(null)}
        onRevert={(prevText) => {
          if (historyKey) revertToHistory(historyKey, prevText)
          setHistoryKey(null)
        }}
      />

      {/* Diálogo de status da célula */}
      <StatusDialog
        open={statusKey != null}
        cell={statusKey ? getCell(statusKey) : undefined}
        onClose={() => setStatusKey(null)}
        onSave={(status, obs) => {
          if (statusKey) setCellStatus(statusKey, status, obs)
        }}
      />

      {/* Diálogo de técnicos */}
      <TecnicosDialog
        open={tecnicosOpen}
        onClose={() => setTecnicosOpen(false)}
        tecnicos={dia.tecnicos}
        onAdd={addTecnico}
        onRename={renameTecnico}
        onRemove={removeTecnico}
        onChangeVeiculo={changeVeiculo}
        onToggle1830={toggle1830}
      />

      {/* Diálogo de horários */}
      <SlotsDialog
        open={slotsOpen}
        onClose={() => setSlotsOpen(false)}
        slots={dia.slots}
        onAdd={addSlot}
        onRename={renameSlot}
        onRemove={removeSlot}
      />

      {/* Busca */}
      <SearchModal
        open={searchOpen}
        area={area}
        onClose={() => setSearchOpen(false)}
        onNavigate={(d, k) => {
          setDate(d)
          setHighlightedCellKey(k)
        }}
      />

      {/* Diálogo de edição de negado */}
      <Dialog open={negadoEdit != null} onClose={() => setNegadoEdit(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar registro negado</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            value={negadoValue}
            onChange={(e) => setNegadoValue(e.target.value)}
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setNegadoEdit(null)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={saveNegado}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function SearchModal({
  open,
  area,
  onClose,
  onNavigate,
}: {
  open: boolean
  area: AgendaArea
  onClose: () => void
  onNavigate: (date: string, key: string) => void
}) {
  const [startDate, setStartDate] = useState(() => shiftISO(todayISO(), -60))
  const [endDate, setEndDate] = useState(() => shiftISO(todayISO(), 30))
  const [queryText, setQueryText] = useState('')
  const [results, setResults] = useState<CellSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = async () => {
    const q = queryText.trim()
    if (!q) return
    setSearching(true)
    setSearchError(null)
    try {
      const res = await searchAgendaCells(db, area, startDate, endDate, q)
      setResults(res)
      setSearched(true)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : 'Erro ao buscar')
    } finally {
      setSearching(false)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`)
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchRoundedIcon fontSize="small" />
        Buscar na Agenda
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center', pt: 0.5 }}>
          <TextField
            type="date"
            label="De"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 155 }}
          />
          <TextField
            type="date"
            label="Até"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 155 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por nome ou texto"
            placeholder="Ex: JOSIANA APARECIDA"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch() }}
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: queryText ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => { setQueryText(''); setResults([]); setSearched(false) }}
                      tabIndex={-1}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => void handleSearch()}
            disabled={searching || !queryText.trim()}
            sx={{ flexShrink: 0, height: 40 }}
          >
            {searching ? <CircularProgress size={18} color="inherit" /> : 'Buscar'}
          </Button>
        </Box>

        {searchError && <Alert severity="error" sx={{ mt: 1.5 }}>{searchError}</Alert>}

        {searched && !searching && results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" variant="body2">
              Nenhum resultado encontrado no período selecionado.
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {results.length} resultado(s) encontrado(s)
            </Typography>
            <Stack spacing={0.5}>
              {results.map((r, i) => (
                <Box
                  key={i}
                  onClick={() => { onNavigate(r.date, r.key); onClose() }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'background 0.12s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: COLOR_DEFS[r.color].fill,
                      border: '1.5px solid',
                      borderColor: COLOR_DEFS[r.color].border,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }} noWrap>
                      {r.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(r.date)} · {r.tecnicoNome} · {r.slotLabel}h
                    </Typography>
                  </Box>
                  <ChevronRightRoundedIcon fontSize="small" sx={{ color: 'text.disabled', flexShrink: 0 }} />
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}

function HistoryDialog({
  open,
  cell,
  onClose,
  onRevert,
}: {
  open: boolean
  cell: AgendaCell | undefined
  onClose: () => void
  onRevert: (prevText: string) => void
}) {
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null)
  const history = cell?.history ?? []

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Histórico de edições</DialogTitle>
        <DialogContent>
          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              Nenhuma edição registrada para esta célula.
            </Typography>
          ) : (
            <Stack divider={<Divider />}>
              {history.map((entry, idx) => (
                <Box key={idx} sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.at).toLocaleString('pt-BR')}
                        {entry.byName ? ` · ${entry.byName}` : ''}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}
                      >
                        {entry.prevText || '(célula vazia)'}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" color="warning" sx={{ flexShrink: 0 }} onClick={() => setConfirmIdx(idx)}>
                      Reverter
                    </Button>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmIdx !== null} onClose={() => setConfirmIdx(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar reversão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            O texto atual será preservado no histórico e o conteúdo anterior será restaurado. Tem certeza?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmIdx(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              if (confirmIdx !== null) {
                onRevert(history[confirmIdx]!.prevText)
                setConfirmIdx(null)
              }
            }}
          >
            Reverter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function StatusDialog({
  open,
  cell,
  onClose,
  onSave,
}: {
  open: boolean
  cell: AgendaCell | undefined
  onClose: () => void
  onSave: (status: AgendaCellStatus | null, obs: string) => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<AgendaCellStatus | null>(null)
  const [obs, setObs] = useState('')

  useEffect(() => {
    if (open) {
      setSelectedStatus(cell?.status ?? null)
      setObs(cell?.statusObs ?? '')
    }
  }, [open, cell])

  const statusOptions = Object.entries(AGENDA_CELL_STATUS_LABELS) as [AgendaCellStatus, string][]

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar status</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          {statusOptions.map(([value, label]) => {
            const color = STATUS_OPTION_COLOR[value]
            const active = selectedStatus === value
            return (
              <Box
                key={value}
                onClick={() => setSelectedStatus(active ? null : value)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: active ? color : 'divider',
                  bgcolor: active ? alpha(color, 0.08) : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: color },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: active ? 700 : 400, color: active ? color : 'text.primary' }}
                >
                  {label}
                </Typography>
              </Box>
            )
          })}
        </Stack>
        {selectedStatus ? (
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Observação"
            placeholder="Ex.: CTOE com abelhas, cliente ausente…"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            sx={{ mt: 2 }}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        {cell?.status ? (
          <Button color="inherit" onClick={() => { onSave(null, ''); onClose() }}>
            Remover status
          </Button>
        ) : null}
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => { onSave(selectedStatus, obs); onClose() }}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function TecnicosDialog({
  open,
  onClose,
  tecnicos,
  onAdd,
  onRename,
  onRemove,
  onChangeVeiculo,
  onToggle1830,
}: {
  open: boolean
  onClose: () => void
  tecnicos: AgendaTecnico[]
  onAdd: (nome: string, veiculo: 'carro' | 'moto') => void
  onRename: (id: string, nome: string) => void
  onRemove: (id: string) => void
  onChangeVeiculo: (id: string, veiculo: 'carro' | 'moto') => void
  onToggle1830: (id: string) => void
}) {
  const [novo, setNovo] = useState('')
  const [novoVeiculo, setNovoVeiculo] = useState<'carro' | 'moto'>('carro')

  const tecOrdenados = [...tecnicos].sort((a, b) => {
    const order: Record<string, number> = { carro: 0, moto: 1 }
    return (order[a.veiculo] ?? 0) - (order[b.veiculo] ?? 0)
  })

  const handleAdd = () => {
    if (novo.trim()) {
      onAdd(novo, novoVeiculo)
      setNovo('')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Técnicos</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 0.5, alignItems: 'flex-start' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Nome do técnico"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          />
          <Button variant="contained" onClick={handleAdd} sx={{ flexShrink: 0 }}>
            Add
          </Button>
        </Box>
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={novoVeiculo}
            onChange={(_, v) => { if (v) setNovoVeiculo(v as 'carro' | 'moto') }}
          >
            <ToggleButton value="carro" sx={{ gap: 0.75, px: 1.5 }}>
              <CarIcon /> Carro
            </ToggleButton>
            <ToggleButton value="moto" sx={{ gap: 0.75, px: 1.5 }}>
              <MotoIcon /> Moto
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Stack spacing={1}>
          {tecOrdenados.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum técnico ainda.
            </Typography>
          ) : (
            tecOrdenados.map((t) => (
              <Box key={t.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  fullWidth
                  value={t.nome}
                  onChange={(e) => onRename(t.id, e.target.value)}
                />
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={t.veiculo}
                  onChange={(_, v) => { if (v) onChangeVeiculo(t.id, v as 'carro' | 'moto') }}
                >
                  <ToggleButton value="carro" title="Carro"><CarIcon /></ToggleButton>
                  <ToggleButton value="moto" title="Moto"><MotoIcon /></ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title={t.tem1830 ? 'Pode receber 18:30 (clique para remover)' : 'Não recebe 18:30 (clique para habilitar)'}>
                  <Chip
                    size="small"
                    label="18:30"
                    variant={t.tem1830 ? 'filled' : 'outlined'}
                    color={t.tem1830 ? 'success' : 'default'}
                    onClick={() => onToggle1830(t.id)}
                    sx={{ cursor: 'pointer', fontWeight: 700, fontSize: 10 }}
                  />
                </Tooltip>
                <IconButton size="small" color="error" onClick={() => onRemove(t.id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>Concluir</Button>
      </DialogActions>
    </Dialog>
  )
}

function SlotsDialog({
  open,
  onClose,
  slots,
  onAdd,
  onRename,
  onRemove,
}: {
  open: boolean
  onClose: () => void
  slots: { id: string; label: string }[]
  onAdd: (label: string) => void
  onRename: (id: string, label: string) => void
  onRemove: (id: string) => void
}) {
  const [novo, setNovo] = useState('')
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Horários</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ex.: 8:30"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && novo.trim()) {
                onAdd(novo)
                setNovo('')
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              if (novo.trim()) {
                onAdd(novo)
                setNovo('')
              }
            }}
          >
            Add
          </Button>
        </Box>
        <Stack spacing={1}>
          {slots.map((s) => (
            <Box key={s.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                fullWidth
                value={s.label}
                onChange={(e) => onRename(s.id, e.target.value)}
              />
              <IconButton size="small" color="error" onClick={() => onRemove(s.id)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Concluir
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ColorLegendSidebar({
  area,
  colorSettings,
  effectivePalette,
  canManage,
  isDark,
  resolvedColorDefs,
  onSave,
}: {
  area: AgendaArea
  colorSettings: AgendaColorSettings
  effectivePalette: CellColor[]
  canManage: boolean
  isDark: boolean
  resolvedColorDefs: Record<CellColor, ColorDef>
  onSave: (settings: AgendaColorSettings) => void
}) {
  const [open, setOpen] = useState(false)
  const [editColor, setEditColor] = useState<CellColor | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editFill, setEditFill] = useState('')
  const [editFillDark, setEditFillDark] = useState('')
  const [editBorder, setEditBorder] = useState('')
  const [editTextColor, setEditTextColor] = useState('')
  const [editTextColorDark, setEditTextColorDark] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const defaultPalette = AREA_PALETTE[area]
  const availableToAdd = useMemo(
    () => (Object.keys(COLOR_DEFS) as CellColor[]).filter(c => !effectivePalette.includes(c)),
    [effectivePalette],
  )

  const getSwatchColor = (color: CellColor) =>
    isDark ? resolvedColorDefs[color].fillDark : resolvedColorDefs[color].fill

  const openEdit = (color: CellColor) => {
    const ov = colorSettings.overrides[color] ?? {}
    const def = COLOR_DEFS[color]
    setEditLabel(ov.label ?? def.label)
    setEditFill(ov.fill ?? def.fill)
    setEditFillDark(ov.fillDark ?? def.fillDark)
    setEditBorder(ov.border ?? def.border)
    setEditTextColor(ov.textColor ?? '#1f2937')
    setEditTextColorDark(ov.textColorDark ?? '#e9ecef')
    setEditColor(color)
  }

  const saveEdit = () => {
    if (!editColor) return
    onSave({
      ...colorSettings,
      overrides: {
        ...colorSettings.overrides,
        [editColor]: { label: editLabel, fill: editFill, fillDark: editFillDark, border: editBorder, textColor: editTextColor, textColorDark: editTextColorDark },
      },
    })
    setEditColor(null)
  }

  const resetToDefault = (color: CellColor) => {
    const { [color]: _removed, ...rest } = colorSettings.overrides
    onSave({ ...colorSettings, overrides: rest })
    setEditColor(null)
  }

  const handleAddColor = (color: CellColor) => {
    const newExtra = [...(colorSettings.extraPaletteColors ?? []), color]
    onSave({ ...colorSettings, extraPaletteColors: newExtra })
    setAddOpen(false)
    openEdit(color)
  }

  const handleRemoveColor = (color: CellColor) => {
    const newExtra = (colorSettings.extraPaletteColors ?? []).filter(c => c !== color)
    onSave({ ...colorSettings, extraPaletteColors: newExtra })
  }

  return (
    <>
      <Box
        sx={{
          borderLeft: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          width: open ? 196 : 40,
          minWidth: open ? 196 : 40,
          transition: 'width 0.2s ease, min-width 0.2s ease',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            px: open ? 1.5 : 0.5,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            minHeight: 42,
          }}
        >
          {open ? (
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'text.secondary', fontSize: 10 }}
            >
              Legenda
            </Typography>
          ) : null}
          <Tooltip title={open ? 'Recolher legenda' : 'Expandir legenda'}>
            <IconButton size="small" onClick={() => setOpen((o) => !o)}>
              {open
                ? <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                : <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Entradas */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 0.75, px: open ? 1 : 0.5 }}>
          {effectivePalette.map((color) => {
            const isCustom = !defaultPalette.includes(color)
            return (
              <Tooltip
                key={color}
                title={open ? (canManage ? 'Clique para editar' : '') : resolvedColorDefs[color].label}
                placement="left"
                disableHoverListener={open && !canManage}
              >
                <Box
                  onClick={() => canManage ? openEdit(color) : undefined}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.6,
                    px: 0.5,
                    borderRadius: 1,
                    cursor: canManage ? 'pointer' : 'default',
                    '&:hover': canManage ? { bgcolor: 'action.hover' } : {},
                    mb: 0.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: getSwatchColor(color),
                      border: 2,
                      borderColor: resolvedColorDefs[color].border,
                      flexShrink: 0,
                      ...(colorSettings.overrides[color] ? { boxShadow: `0 0 0 1px ${resolvedColorDefs[color].border}` } : {}),
                    }}
                  />
                  {open ? (
                    <>
                      <Typography
                        sx={{
                          fontSize: 11,
                          lineHeight: 1.3,
                          flex: 1,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          color: 'text.secondary',
                          wordBreak: 'break-word',
                        }}
                      >
                        {resolvedColorDefs[color].label}
                      </Typography>
                      {isCustom && canManage ? (
                        <Tooltip title="Remover da paleta">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleRemoveColor(color) }}
                            sx={{ flexShrink: 0, p: 0.25, opacity: 0.5, '&:hover': { opacity: 1 } }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </>
                  ) : null}
                </Box>
              </Tooltip>
            )
          })}
        </Box>

        {/* Botão adicionar cor (só gerente, só quando expandido e há cores disponíveis) */}
        {canManage && open && availableToAdd.length > 0 ? (
          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 1 }}>
            <Button
              size="small"
              fullWidth
              startIcon={<AddRoundedIcon />}
              onClick={() => setAddOpen(true)}
              sx={{ fontSize: 11 }}
            >
              Adicionar cor
            </Button>
          </Box>
        ) : null}
      </Box>

      {/* Diálogo para adicionar nova cor à paleta */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar cor à legenda</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione uma cor para ativar nesta área. Você poderá personalizar a cor e o significado em seguida.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableToAdd.map((color) => (
              <Tooltip key={color} title={resolvedColorDefs[color].label} placement="top" arrow>
                <Box
                  onClick={() => handleAddColor(color)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    minWidth: 58,
                    '&:hover': { bgcolor: 'action.hover', borderColor: resolvedColorDefs[color].border },
                    transition: 'all 0.15s',
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: getSwatchColor(color),
                      border: 2,
                      borderColor: resolvedColorDefs[color].border,
                    }}
                  />
                  <Typography sx={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2, color: 'text.secondary', maxWidth: 56 }}>
                    {resolvedColorDefs[color].label}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edição de cor */}
      <Dialog open={editColor !== null} onClose={() => setEditColor(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar cor da legenda</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              size="small"
              label="Descrição / significado"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Fundo (tema claro)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editFill}
                    onChange={(e) => setEditFill(e.target.value)}
                    style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{editFill}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Fundo (tema escuro)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editFillDark}
                    onChange={(e) => setEditFillDark(e.target.value)}
                    style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{editFillDark}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Borda
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editBorder}
                    onChange={(e) => setEditBorder(e.target.value)}
                    style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{editBorder}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Texto (tema claro)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editTextColor}
                    onChange={(e) => setEditTextColor(e.target.value)}
                    style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{editTextColor}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Texto (tema escuro)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={editTextColorDark}
                    onChange={(e) => setEditTextColorDark(e.target.value)}
                    style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{editTextColorDark}</Typography>
                </Box>
              </Box>
            </Box>
            {/* Preview */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pt: 0.5,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                bgcolor: isDark ? editFillDark : editFill,
                border: 2,
                borderColor: editBorder,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isDark ? editFillDark : editFill,
                  border: 2,
                  borderColor: editBorder,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" sx={{ color: isDark ? editTextColorDark : editTextColor, fontWeight: 600 }}>
                {editLabel || '(sem descrição)'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          {editColor !== null && colorSettings.overrides[editColor] !== undefined ? (
            <Button color="inherit" onClick={() => editColor !== null && resetToDefault(editColor)}>
              Restaurar padrão
            </Button>
          ) : null}
          <Button onClick={() => setEditColor(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
