import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { db } from '../lib/firebase'
import { getDia, saveDia } from '../lib/agendaFirestore'
import { cellKey, COLOR_DEFS, defaultSlots, type AgendaDia, type CellColor } from '../types/agenda'

const ORANGE    = '#f57c00'
const CAR_COLOR = '#2e7d32'
const MOTO_COLOR = '#e65100'
const SLOT_COL  = 56   // px — coluna do horário
const TEC_COL   = 100  // px — coluna de cada técnico

function CarIcon() {
  return (
    <SvgIcon sx={{ fontSize: 13, color: CAR_COLOR }}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </SvgIcon>
  )
}

function MotoIcon() {
  return (
    <SvgIcon sx={{ fontSize: 13, color: MOTO_COLOR }}>
      <path d="m18 14-1-3" />
      <path d="m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81" />
      <path d="M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5" />
      <circle cx="19" cy="17" r="3" />
      <circle cx="5" cy="17" r="3" />
    </SvgIcon>
  )
}

function extractBairro(text: string): string {
  const idx = text.lastIndexOf(' - ')
  if (idx === -1) return ''
  const candidate = text.slice(idx + 3).trim()
  if (candidate.includes(':') || candidate.includes('(') || /^\d+$/.test(candidate)) return ''
  return candidate
}

function brDateToISO(br: string): string {
  const parts = br.split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function isoToBr(iso: string): string {
  const parts = iso.split('-')
  if (parts.length !== 3) return ''
  const [y, m, d] = parts
  return `${d}/${m}/${y}`
}

const COR_OPTS: { value: CellColor; label: string; fill: string; border: string }[] = [
  { value: 'branco',  label: 'Branco',  fill: '#ffffff', border: '#d0d7de' },
  { value: 'amarelo', label: 'Amarelo', fill: '#ffe066', border: '#f1c40f' },
]

interface Props {
  open: boolean
  onClose: () => void
  textoAgenda: string
  initialDate?: string   // 'dd/mm/yyyy' — pré-preenche a data
  onScheduled: (dataVisita: string, horaVisita: string) => void
}

export function AgendarVisitaModal({ open, onClose, textoAgenda, initialDate, onScheduled }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [pickedDate, setPickedDate]   = useState('')           // yyyy-MM-dd
  const [pickedSlotId, setSlotId]     = useState<string | null>(null)
  const [selectedTecId, setSelected]  = useState<string | null>(null)
  const [cor, setCor]                 = useState<CellColor>('branco')
  const [dia, setDia]                 = useState<AgendaDia | null>(null)
  const [loading, setLoading]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [extras, setExtras]           = useState<Set<string>>(new Set())
  const [outroText, setOutroText]     = useState('')

  // Reset ao abrir
  useEffect(() => {
    if (!open) return
    const iso = initialDate ? brDateToISO(initialDate) : ''
    setPickedDate(iso)
    setSlotId(null)
    setSelected(null)
    setCor('branco')
    setDia(null)
    setExtras(new Set())
    setOutroText('')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Carrega agenda quando a data muda
  useEffect(() => {
    if (!open || !pickedDate) { if (!pickedDate) setDia(null); return }
    let cancelled = false
    setLoading(true)
    setSlotId(null)
    setSelected(null)
    getDia(db, 'manutencao', pickedDate)
      .then((d) => { if (!cancelled) setDia(d) })
      .catch(() => { if (!cancelled) setDia(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, pickedDate])

  // Slots a exibir (da agenda ou padrão)
  const displaySlots = useMemo(
    () => dia?.slots ?? defaultSlots('manutencao'),
    [dia],
  )

  const targetSlot = useMemo(
    () => displaySlots.find((s) => s.id === pickedSlotId) ?? null,
    [displaySlots, pickedSlotId],
  )

  const tecOrdered = useMemo(() => {
    if (!dia) return []
    return [...dia.tecnicos].sort((a, b) => {
      const ord: Record<string, number> = { carro: 0, moto: 1 }
      return (ord[a.veiculo] ?? 0) - (ord[b.veiculo] ?? 0)
    })
  }, [dia])

  const EXTRA_OPTS = ['PODE ANTECIPAR', 'NÃO PODE ANTECIPAR', 'CLIENTE SEM FIDELIDADE']

  const finalTextoAgenda = useMemo(() => {
    const suffixes: string[] = [
      ...EXTRA_OPTS.filter((o) => extras.has(o)),
      ...(extras.has('OUTRO') && outroText.trim() ? [outroText.trim().toUpperCase()] : []),
    ]
    return textoAgenda + suffixes.map((s) => ` // ${s}`).join('')
  }, [textoAgenda, extras, outroText])

  const handleAgendar = useCallback(async () => {
    if (!selectedTecId || !dia || !targetSlot || !pickedDate) return
    setSaving(true)
    try {
      const key   = cellKey(selectedTecId, targetSlot.id)
      const cells = { ...dia.cells, [key]: { text: finalTextoAgenda, color: cor, bold: false } }
      await saveDia(db, { ...dia, cells })
      const brDate = isoToBr(pickedDate)
      // Normaliza '8:30' → '08:30' para manter consistência com os textos da O.S.
      const hora = targetSlot.label.replace(/^(\d):/, '0$1:')
      onScheduled(brDate, hora)
      onClose()
    } finally {
      setSaving(false)
    }
  }, [selectedTecId, dia, targetSlot, pickedDate, finalTextoAgenda, cor, onScheduled, onClose])

  const n        = tecOrdered.length
  const minW     = SLOT_COL + n * TEC_COL
  const gridCols = `${SLOT_COL}px repeat(${n}, ${TEC_COL}px)`

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 0.5, fontWeight: 700 }}>Agendar Visita Técnica</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>

          {/* ── Seleção de data + horário ── */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>

            {/* Data */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Data
              </Typography>
              <TextField
                type="date"
                size="small"
                value={pickedDate}
                onChange={(e) => setPickedDate(e.target.value)}
                sx={{ width: 160 }}
                slotProps={{ htmlInput: { min: new Date().toISOString().slice(0, 10) } }}
              />
            </Box>

            {/* Slots */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Horário
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {displaySlots.map((slot) => {
                  const active = pickedSlotId === slot.id
                  return (
                    <Chip
                      key={slot.id}
                      label={slot.label}
                      size="small"
                      onClick={() => { setSlotId(slot.id); setSelected(null) }}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: active ? 700 : 400,
                        bgcolor: active ? ORANGE : 'transparent',
                        color: active ? '#fff' : 'text.primary',
                        borderColor: active ? ORANGE : 'divider',
                        border: '1px solid',
                        '&:hover': { bgcolor: active ? ORANGE : alpha(ORANGE, 0.08) },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          </Box>

          {/* ── Mini grade da agenda ── */}
          {!pickedDate ? (
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                color: 'text.disabled',
              }}
            >
              <Typography variant="body2">Selecione uma data para ver a agenda</Typography>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: ORANGE }} />
            </Box>
          ) : dia ? (
            <Box sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 2 }}>

              {/* Cabeçalho — técnicos */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: gridCols,
                  minWidth: minW,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Box sx={{ minWidth: SLOT_COL }} />
                {tecOrdered.map((tec) => (
                  <Box
                    key={tec.id}
                    sx={{
                      borderLeft: 1,
                      borderColor: 'divider',
                      py: 0.75,
                      px: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.25,
                      minWidth: TEC_COL,
                    }}
                  >
                    {tec.veiculo === 'carro' ? <CarIcon /> : <MotoIcon />}
                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, lineHeight: 1.1, textAlign: 'center' }}>
                      {tec.nome}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Linhas de slot */}
              {dia.slots.map((slot, rowIdx) => {
                const isTarget = slot.id === targetSlot?.id
                return (
                  <Box
                    key={slot.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      minWidth: minW,
                      borderTop: rowIdx > 0 ? 1 : 0,
                      borderColor: 'divider',
                      bgcolor: isTarget ? alpha(ORANGE, 0.04) : 'transparent',
                    }}
                  >
                    {/* Horário */}
                    <Box
                      sx={{
                        minWidth: SLOT_COL,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: 1,
                        borderColor: 'divider',
                        bgcolor: isTarget ? alpha(ORANGE, 0.14) : 'transparent',
                        py: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: isTarget ? 800 : 500,
                          color: isTarget ? ORANGE : 'text.secondary',
                        }}
                      >
                        {slot.label}
                      </Typography>
                    </Box>

                    {/* Células */}
                    {tecOrdered.map((tec) => {
                      const key        = cellKey(tec.id, slot.id)
                      const cell       = dia.cells[key]
                      const occupied   = !!cell?.text?.trim()
                      const isSelected = isTarget && selectedTecId === tec.id
                      const clickable  = isTarget && !occupied
                      const bairro     = occupied ? extractBairro(cell!.text) : ''
                      const mainText   = bairro
                        ? cell!.text.slice(0, cell!.text.lastIndexOf(' - ' + bairro)).trim()
                        : (cell?.text ?? '')

                      const cellBg = isSelected
                        ? alpha(ORANGE, 0.18)
                        : occupied
                          ? (COLOR_DEFS[cell!.color]?.fill ?? '#fff')
                          : 'transparent'

                      return (
                        <Box
                          key={tec.id}
                          onClick={clickable ? () => setSelected(tec.id) : undefined}
                          sx={{
                            borderLeft: 1,
                            borderColor: 'divider',
                            minWidth: TEC_COL,
                            minHeight: isTarget ? 48 : 36,
                            p: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: clickable ? 'pointer' : occupied && isTarget ? 'not-allowed' : 'default',
                            bgcolor: cellBg,
                            outline: isSelected ? `2px solid ${ORANGE}` : 'none',
                            outlineOffset: -2,
                            transition: 'background-color 0.1s',
                            '&:hover': clickable ? { bgcolor: alpha(ORANGE, 0.1) } : {},
                          }}
                        >
                          {occupied ? (
                            <>
                              <Typography
                                sx={{
                                  fontSize: 9,
                                  lineHeight: 1.3,
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: bairro ? (isTarget ? 3 : 2) : (isTarget ? 4 : 3),
                                  WebkitBoxOrient: 'vertical',
                                  wordBreak: 'break-word',
                                  textAlign: 'center',
                                  width: '100%',
                                  opacity: isTarget ? 0.85 : 0.65,
                                }}
                              >
                                {mainText}
                              </Typography>
                              {bairro ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.25,
                                    mt: 0.5,
                                    mx: -0.5,
                                    px: 0.5,
                                    py: 0.3,
                                    width: 'calc(100% + 8px)',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.08)',
                                    borderTop: 1,
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                  }}
                                >
                                  <PlaceOutlinedIcon sx={{ fontSize: 9, color: 'text.disabled' }} />
                                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>
                                    {bairro}
                                  </Typography>
                                </Box>
                              ) : null}
                            </>
                          ) : isTarget ? (
                            <Typography
                              sx={{
                                fontSize: 20,
                                lineHeight: 1,
                                color: alpha(ORANGE, 0.25),
                                userSelect: 'none',
                              }}
                            >
                              +
                            </Typography>
                          ) : null}
                        </Box>
                      )
                    })}
                  </Box>
                )
              })}
            </Box>
          ) : null}

          {/* ── Cor da célula ── */}
          {pickedSlotId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Cor:</Typography>
              {COR_OPTS.map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => setCor(opt.value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    border: 2,
                    borderColor: cor === opt.value ? ORANGE : 'divider',
                    borderRadius: 2,
                    px: 1.25,
                    py: 0.5,
                    cursor: 'pointer',
                    bgcolor: cor === opt.value ? alpha(ORANGE, 0.07) : 'transparent',
                    transition: 'border-color 0.12s',
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: opt.fill,
                      border: `2px solid ${opt.border}`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, fontWeight: cor === opt.value ? 700 : 400 }}>
                    {opt.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}

          {/* ── Preview do texto ── */}
          {textoAgenda ? (
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1.5, p: 1.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                Texto da célula
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {finalTextoAgenda}
              </Typography>
            </Box>
          ) : null}

          {/* ── Informações extras ── */}
          {textoAgenda ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                Informações adicionais
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {[...EXTRA_OPTS, 'OUTRO'].map((opt) => (
                  <FormControlLabel
                    key={opt}
                    label={<Typography sx={{ fontSize: 13 }}>{opt}</Typography>}
                    control={
                      <Checkbox
                        size="small"
                        checked={extras.has(opt)}
                        onChange={(e) => {
                          setExtras((prev) => {
                            const next = new Set(prev)
                            if (e.target.checked) next.add(opt)
                            else { next.delete(opt); if (opt === 'OUTRO') setOutroText('') }
                            return next
                          })
                        }}
                      />
                    }
                  />
                ))}
              </Box>
              {extras.has('OUTRO') ? (
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Digite a informação adicional…"
                  value={outroText}
                  onChange={(e) => setOutroText(e.target.value)}
                  sx={{ mt: 1 }}
                />
              ) : null}
            </Box>
          ) : null}

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!selectedTecId || !targetSlot || !pickedDate || saving || loading}
          onClick={() => void handleAgendar()}
          sx={{ bgcolor: ORANGE, '&:hover': { bgcolor: '#e65100' } }}
        >
          {saving ? 'Agendando…' : 'Agendar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
