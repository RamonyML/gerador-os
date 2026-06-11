import { useCallback, useMemo, useRef, useState } from 'react'
import { Search as SearchIcon } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { OsTemplateField } from '../types/osTemplate'
import { getFieldControl, resolveFieldGridSize } from '../types/osTemplate'
import {
  CepLookupError,
  fetchCepWithFallback,
  normalizeCepInput,
} from '../lib/cepLookup'
import {
  parseBrDateString,
  parseBrDateTimeString,
  toBrDateString,
  toBrDateTimeString,
} from '../lib/dateFieldValue'
import { formatPhoneBrMask } from '../lib/phoneBrFormat'
import { formatSinalFibraMask } from '../lib/sinalFibraMask'

type Props = {
  fields: OsTemplateField[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
  /** Necessário para preencher logradouro/bairro ao buscar CEP. */
  onPatchValues?: (patch: Record<string, string>) => void
  /** Tom dos títulos de seção (default verde/primary). */
  accent?: 'green' | 'red'
}

/** Ids de destino compatíveis com o legado (MUD END usa `adress`). */
function resolveCepFillIds(fields: OsTemplateField[]): {
  logradouro?: string
  bairro?: string
  cidade?: string
  uf?: string
} {
  const ids = new Set(fields.map((f) => f.id))
  const pick = (candidates: string[]) =>
    candidates.find((id) => ids.has(id))
  return {
    logradouro: pick(['adress', 'endereco', 'logradouro']),
    bairro: pick(['bairro']),
    cidade: pick(['cidade', 'localidade']),
    uf: pick(['uf', 'estado']),
  }
}

function buildFillPatch(
  targets: ReturnType<typeof resolveCepFillIds>,
  r: { logradouro: string; bairro: string; cidade: string; uf: string },
): Record<string, string> {
  const p: Record<string, string> = {}
  if (targets.logradouro) p[targets.logradouro] = r.logradouro
  if (targets.bairro) p[targets.bairro] = r.bairro
  if (targets.cidade) p[targets.cidade] = r.cidade
  if (targets.uf) p[targets.uf] = r.uf
  return p
}

function buildClearPatch(
  targets: ReturnType<typeof resolveCepFillIds>,
): Record<string, string> {
  const p: Record<string, string> = {}
  if (targets.logradouro) p[targets.logradouro] = ''
  if (targets.bairro) p[targets.bairro] = ''
  if (targets.cidade) p[targets.cidade] = ''
  if (targets.uf) p[targets.uf] = ''
  return p
}

/** Mantém a ordem definida no fluxo; quebra em blocos quando `section` muda. */
function groupFieldsBySection(fields: OsTemplateField[]): {
  section: string
  fields: OsTemplateField[]
}[] {
  const out: { section: string; fields: OsTemplateField[] }[] = []
  for (const f of fields) {
    const sec = (f.section ?? '').trim()
    const last = out[out.length - 1]
    if (last && last.section === sec) {
      last.fields.push(f)
    } else {
      out.push({ section: sec, fields: [f] })
    }
  }
  return out
}

function isFieldVisible(
  field: OsTemplateField,
  values: Record<string, string>,
): boolean {
  if (!field.showWhen) return true
  const expected = field.showWhen.equals
  const current = values[field.showWhen.field] ?? ''
  return Array.isArray(expected)
    ? expected.includes(current)
    : current === expected
}

export function OsTemplateFieldsForm({
  fields,
  values,
  onChange,
  onPatchValues,
  accent = 'green',
}: Props) {
  const sectionColor = accent === 'red' ? 'error.main' : 'primary.main'
  const hasCepField = fields.some((f) => f.id === 'cep')
  const cepTargets = useMemo(() => resolveCepFillIds(fields), [fields])
  const visibleFields = useMemo(
    () => fields.filter((f) => isFieldVisible(f, values)),
    [fields, values],
  )
  const sections = useMemo(
    () => groupFieldsBySection(visibleFields),
    [visibleFields],
  )

  return (
    <Stack component="div" spacing={0} sx={{ width: '100%' }}>
      {sections.map((block, bi) => (
        <Box key={bi} component="section" sx={{ width: '100%' }}>
          {bi > 0 ? <Divider sx={{ my: 2 }} /> : null}
          {block.section ? (
            <Typography
              variant="subtitle1"
              component="h2"
              sx={{
                color: sectionColor,
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: 0.2,
                mb: 1.5,
                mt: bi === 0 ? 0 : 0,
              }}
            >
              {block.section}
            </Typography>
          ) : null}
          <Grid container spacing={2}>
            {block.fields.map((f) => {
              const g = resolveFieldGridSize(f)
              return (
                <Grid key={f.id} size={{ xs: g.xs, sm: g.sm, md: g.md }}>
                  {hasCepField && f.id === 'cep' ? (
                    <CepField
                      field={f}
                      value={values[f.id] ?? ''}
                      onChange={onChange}
                      onPatchValues={onPatchValues}
                      targets={cepTargets}
                    />
                  ) : (
                    <FieldInput
                      field={f}
                      value={values[f.id] ?? ''}
                      onChange={onChange}
                    />
                  )}
                </Grid>
              )
            })}
          </Grid>
        </Box>
      ))}
    </Stack>
  )
}

function CepField({
  field: f,
  value,
  onChange,
  onPatchValues,
  targets,
}: {
  field: OsTemplateField
  value: string
  onChange: (id: string, value: string) => void
  onPatchValues?: (patch: Record<string, string>) => void
  targets: ReturnType<typeof resolveCepFillIds>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastFetched = useRef<string>('')

  const hasFillTargets =
    Boolean(targets.logradouro) ||
    Boolean(targets.bairro) ||
    Boolean(targets.cidade) ||
    Boolean(targets.uf)

  const applyLookup = useCallback(
    async (digits: string, force = false) => {
      if (!onPatchValues || !hasFillTargets || digits.length !== 8) return
      if (!force && lastFetched.current === digits) return
      setLoading(true)
      setError(null)
      try {
        const r = await fetchCepWithFallback(digits)
        lastFetched.current = digits
        const patch = buildFillPatch(targets, r)
        if (Object.keys(patch).length > 0) {
          onPatchValues(patch)
        }
      } catch (e) {
        lastFetched.current = ''
        const msg =
          e instanceof CepLookupError
            ? e.message
            : 'Não foi possível buscar o CEP.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [hasFillTargets, onPatchValues, targets],
  )

  const handleChange = (raw: string) => {
    const digits = normalizeCepInput(raw)
    onChange(f.id, digits)
    setError(null)
    if (digits.length < 8) {
      lastFetched.current = ''
      if (onPatchValues && Object.keys(buildClearPatch(targets)).length > 0) {
        onPatchValues(buildClearPatch(targets))
      }
      return
    }
    if (hasFillTargets && onPatchValues) {
      void applyLookup(digits)
    }
  }

  const handleBlur = () => {
    const digits = normalizeCepInput(value)
    if (digits.length === 0) return
    if (digits.length !== 8) {
      setError('Informe um CEP válido (8 dígitos)')
      return
    }
    if (hasFillTargets && onPatchValues) {
      void applyLookup(digits)
    }
  }

  return (
    <TextField
      label={f.label}
      placeholder={f.placeholder ?? 'Somente números'}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      fullWidth
      size="small"
      error={Boolean(error)}
      helperText={error || undefined}
      slotProps={{
        htmlInput: {
          inputMode: 'numeric',
          'aria-busy': loading,
        },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <IconButton
                  size="small"
                  aria-label="Buscar CEP"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    void applyLookup(normalizeCepInput(value), true)
                  }
                  disabled={
                    normalizeCepInput(value).length !== 8 ||
                    !hasFillTargets ||
                    !onPatchValues
                  }
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

function UserRoundIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

function UsersRoundIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </svg>
  )
}

function FieldOptionIcon({ name }: { name?: string }) {
  if (name === 'user-round') return <UserRoundIcon />
  if (name === 'users-round') return <UsersRoundIcon />
  return null
}

function HighlightSelect({
  field: f,
  value,
  onChange,
}: {
  field: OsTemplateField
  value: string
  onChange: (id: string, value: string) => void
}) {
  const options = f.options ?? []
  const isRed = f.tone === 'red'
  const gradient = isRed
    ? 'linear-gradient(135deg, #a31515 0%, #e23b3b 100%)'
    : 'linear-gradient(135deg, #157f3d 0%, #2fbf6a 100%)'
  const gradientHover = isRed
    ? 'linear-gradient(135deg, #8d1212cc 0%, #d23232 100%)'
    : 'linear-gradient(135deg, #12713680 0%, #2bb463 100%)'
  const shadow = isRed
    ? '0 2px 10px rgba(163, 21, 21, 0.25)'
    : '0 2px 10px rgba(21, 127, 61, 0.25)'
  const itemColor = isRed ? 'error.main' : 'success.main'
  return (
    <FormControl fullWidth>
      <Select
        value={value}
        onChange={(e) => onChange(f.id, e.target.value)}
        displayEmpty
        aria-label={f.label}
        renderValue={(val) => {
          const opt = options.find((o) => o.value === val)
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FieldOptionIcon name={opt?.icon} />
              </Box>
              <Box component="span" sx={{ textTransform: 'uppercase' }}>
                {opt?.label ?? f.label}
              </Box>
            </Box>
          )
        }}
        sx={{
          color: '#fff',
          fontSize: '1.05rem',
          fontWeight: 700,
          borderRadius: 2,
          background: gradient,
          boxShadow: shadow,
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
          },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover': {
            background: gradientHover,
          },
          '& .MuiSelect-icon': { color: '#fff' },
        }}
      >
        {options.map((opt, i) => (
          <MenuItem key={`${f.id}-opt-${i}`} value={opt.value}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                color: itemColor,
              }}
            >
              <FieldOptionIcon name={opt.icon} />
            </Box>
            <Box component="span" sx={{ ml: opt.icon ? 1.25 : 0 }}>
              {opt.label}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function FieldInput({
  field: f,
  value,
  onChange,
}: {
  field: OsTemplateField
  value: string
  onChange: (id: string, value: string) => void
}) {
  const kind = getFieldControl(f)

  if (f.highlight && kind === 'select' && f.options && f.options.length > 0) {
    return <HighlightSelect field={f} value={value} onChange={onChange} />
  }

  if (kind === 'date') {
    return (
      <DatePicker
        label={f.label}
        value={parseBrDateString(value)}
        onChange={(d) => onChange(f.id, d ? toBrDateString(d) : '')}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            slotProps: {
              htmlInput: {
                placeholder: f.placeholder || 'dd/mm/aaaa',
              },
            },
          },
        }}
      />
    )
  }

  if (kind === 'datetime') {
    return (
      <DateTimePicker
        label={f.label}
        value={parseBrDateTimeString(value)}
        onChange={(d) => onChange(f.id, d ? toBrDateTimeString(d) : '')}
        format="DD/MM/YYYY HH:mm"
        ampm={false}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            slotProps: {
              htmlInput: {
                placeholder: f.placeholder || 'dd/mm/aaaa hh:mm',
              },
            },
          },
        }}
      />
    )
  }

  if (kind === 'phone') {
    return (
      <TextField
        label={f.label}
        placeholder={f.placeholder ?? '(00) 00000-0000'}
        value={value}
        onChange={(e) => onChange(f.id, formatPhoneBrMask(e.target.value))}
        fullWidth
        size="small"
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            autoComplete: 'tel',
            maxLength: 16,
          },
        }}
      />
    )
  }

  if (kind === 'signal') {
    return (
      <TextField
        label={f.label}
        placeholder={f.placeholder ?? '00.00'}
        value={value}
        onChange={(e) => onChange(f.id, formatSinalFibraMask(e.target.value))}
        fullWidth
        size="small"
        slotProps={{
          htmlInput: {
            inputMode: 'decimal',
            maxLength: 5,
          },
        }}
      />
    )
  }

  if (kind === 'select' && f.options && f.options.length > 0) {
    return (
      <FormControl fullWidth size="small">
        <InputLabel id={`${f.id}-lbl`}>{f.label}</InputLabel>
        <Select
          labelId={`${f.id}-lbl`}
          label={f.label}
          value={value}
          onChange={(e) => onChange(f.id, e.target.value)}
        >
          {f.options.map((opt, i) => (
            <MenuItem key={`${f.id}-opt-${i}`} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {f.placeholder ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {f.placeholder}
          </Typography>
        ) : null}
      </FormControl>
    )
  }

  if (kind === 'radio' && f.options && f.options.length > 0) {
    return (
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend" sx={{ mb: 1 }}>
          {f.label}
        </FormLabel>
        <RadioGroup
          row
          value={value}
          onChange={(e) => onChange(f.id, e.target.value)}
          sx={{ columnGap: 2, rowGap: 0.5 }}
        >
          {f.options.map((opt, i) => (
            <FormControlLabel
              key={`${f.id}-r-${i}`}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
              sx={{ mr: 0 }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    )
  }

  if (kind === 'textarea') {
    return (
      <TextField
        label={f.label}
        placeholder={f.placeholder}
        value={value}
        onChange={(e) => onChange(f.id, e.target.value)}
        fullWidth
        size="small"
        multiline
        minRows={3}
      />
    )
  }

  return (
    <TextField
      label={f.label}
      placeholder={f.placeholder}
      value={value}
      onChange={(e) => onChange(f.id, e.target.value)}
      fullWidth
      size="small"
    />
  )
}
