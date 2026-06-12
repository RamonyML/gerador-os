import { useEffect, useMemo, useState } from 'react'
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
  Paper,
  Popover,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import TodayRoundedIcon from '@mui/icons-material/TodayRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { useColorMode } from '../contexts/ColorModeContext'
import { AppPageChrome } from '../components/AppPageChrome'
import { db } from '../lib/firebase'
import {
  getTecnicosFromPreviousDay,
  saveDia,
  subscribeDia,
} from '../lib/agendaFirestore'
import {
  AGENDA_AREA_LABELS,
  AREA_PALETTE,
  COLOR_DEFS,
  NEGADO_COLOR,
  cellKey,
  emptyDia,
  newId,
  type AgendaArea,
  type AgendaCell,
  type AgendaDia,
  type CellColor,
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

function labelBR(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function AgendaPage() {
  const theme = useTheme()
  const { mode } = useColorMode()
  const isDark = mode === 'dark'

  const [area, setArea] = useState<AgendaArea>('agenda')
  const [date, setDate] = useState<string>(todayISO())
  const [dia, setDia] = useState<AgendaDia>(emptyDia('agenda', date))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const persist = (next: AgendaDia) => {
    setDia(next)
    void saveDia(db, next).catch((e) => {
      setError(e instanceof Error ? e.message : 'Falha ao salvar.')
    })
  }

  const colorFill = (color: CellColor): string =>
    isDark ? COLOR_DEFS[color].fillDark : COLOR_DEFS[color].fill
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
    if (!text && !(prev?.color && prev.color !== 'branco')) {
      delete cells[key]
    } else {
      cells[key] = {
        text,
        color: prev?.color ?? 'branco',
        bold: textBold,
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
    cells[key] = { text: prev?.text ?? '', color, bold: prev?.bold ?? false }
    persist({ ...dia, cells })
    setColorAnchor(null)
  }

  const clearCell = (key: string) => {
    const cells = { ...dia.cells }
    delete cells[key]
    persist({ ...dia, cells })
    setTextEdit(null)
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
  const addTecnico = (nome: string) => {
    const n = nome.trim()
    if (!n) return
    persist({
      ...dia,
      tecnicos: [...dia.tecnicos, { id: newId('tec'), nome: n }],
    })
  }
  const renameTecnico = (id: string, nome: string) => {
    persist({
      ...dia,
      tecnicos: dia.tecnicos.map((t) => (t.id === id ? { ...t, nome } : t)),
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
      const tecnicos = prev.map((t) => ({ id: newId('tec'), nome: t.nome }))
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

  const palette = AREA_PALETTE[area]
  const isAgenda = area === 'agenda'
  const stickyBg = theme.palette.background.paper

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
            Agendamento de visitas técnicas. Na aba <strong>Agenda</strong>: instalação
            e mudança de endereço. Na aba <strong>Manutenção</strong>: visitas de
            manutenção. Edite o texto (lápis) e a cor/status (pincel) de cada célula.
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
              <Tab value="agenda" label={AGENDA_AREA_LABELS.agenda} />
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
              <Button
                size="small"
                color="inherit"
                startIcon={<ScheduleRoundedIcon />}
                onClick={() => setSlotsOpen(true)}
              >
                Horários
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
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `170px repeat(${dia.slots.length}, minmax(180px, 1fr))`,
                    minWidth: 'fit-content',
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
                  {dia.tecnicos.map((t) => (
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
                          fontWeight: 700,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          wordBreak: 'break-word',
                        }}
                      >
                        {t.nome}
                      </Box>
                      {dia.slots.map((s) => {
                        const key = cellKey(t.id, s.id)
                        const c = getCell(key)
                        const fill = c ? colorFill(c.color) : 'transparent'
                        return (
                          <Box
                            key={s.id}
                            sx={{
                              position: 'relative',
                              borderBottom: 1,
                              borderRight: 1,
                              borderColor: 'divider',
                              minHeight: 84,
                              bgcolor: fill,
                              p: 0.75,
                              cursor: 'pointer',
                              '&:hover .cell-actions': { opacity: 1 },
                            }}
                            onClick={() => openText(key)}
                          >
                            {c?.bold ? (
                              <PriorityHighRoundedIcon
                                sx={{
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  fontSize: 16,
                                  color: theme.palette.warning.main,
                                }}
                              />
                            ) : null}
                            {c?.text ? (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  lineHeight: 1.3,
                                  color: cellTextColor,
                                  fontWeight: c.bold ? 800 : 400,
                                  whiteSpace: 'pre-wrap',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 5,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  pr: 1.5,
                                }}
                              >
                                {c.text}
                              </Typography>
                            ) : (
                              <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                                +
                              </Typography>
                            )}

                            <Box
                              className="cell-actions"
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                display: 'flex',
                                gap: 0.25,
                                opacity: 0,
                                transition: 'opacity 0.15s ease',
                                bgcolor: alpha(stickyBg, 0.85),
                                borderRadius: 1,
                              }}
                            >
                              <Tooltip title="Editar texto">
                                <IconButton size="small" onClick={() => openText(key)}>
                                  <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mudar cor">
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    setColorAnchor({ el: e.currentTarget, key })
                                  }
                                >
                                  <BrushOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  ))}
                </Box>
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
        <Box sx={{ p: 1.25, display: 'flex', gap: 0.75, flexWrap: 'wrap', maxWidth: 200 }}>
          {palette.map((color) => (
            <Box
              key={color}
              onClick={() => colorAnchor && setColor(colorAnchor.key, color)}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                cursor: 'pointer',
                bgcolor: colorFill(color),
                border: 2,
                borderColor: COLOR_DEFS[color].border,
                transition: 'transform 0.1s ease',
                '&:hover': { transform: 'scale(1.12)' },
              }}
            />
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

      {/* Diálogo de técnicos */}
      <TecnicosDialog
        open={tecnicosOpen}
        onClose={() => setTecnicosOpen(false)}
        tecnicos={dia.tecnicos}
        onAdd={addTecnico}
        onRename={renameTecnico}
        onRemove={removeTecnico}
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

function TecnicosDialog({
  open,
  onClose,
  tecnicos,
  onAdd,
  onRename,
  onRemove,
}: {
  open: boolean
  onClose: () => void
  tecnicos: { id: string; nome: string }[]
  onAdd: (nome: string) => void
  onRename: (id: string, nome: string) => void
  onRemove: (id: string) => void
}) {
  const [novo, setNovo] = useState('')
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Técnicos do dia</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Nome do técnico"
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
          {tecnicos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum técnico ainda.
            </Typography>
          ) : (
            tecnicos.map((t) => (
              <Box key={t.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  fullWidth
                  value={t.nome}
                  onChange={(e) => onRename(t.id, e.target.value)}
                />
                <IconButton size="small" color="error" onClick={() => onRemove(t.id)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
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
