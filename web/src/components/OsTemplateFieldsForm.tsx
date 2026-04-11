import { useCallback, useMemo, useRef, useState } from 'react'
import { Search as SearchIcon } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
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
import { parseBrDateString, toBrDateString } from '../lib/dateFieldValue'

type Props = {
  fields: OsTemplateField[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
  /** Necessário para preencher logradouro/bairro ao buscar CEP. */
  onPatchValues?: (patch: Record<string, string>) => void
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

/** Mantém a ordem do Firestore; quebra em blocos quando `section` muda. */
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

export function OsTemplateFieldsForm({
  fields,
  values,
  onChange,
  onPatchValues,
}: Props) {
  const hasCepField = fields.some((f) => f.id === 'cep')
  const cepTargets = useMemo(() => resolveCepFillIds(fields), [fields])
  const sections = useMemo(() => groupFieldsBySection(fields), [fields])

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
                color: 'primary.main',
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

  const hintPadrao = hasFillTargets
    ? 'Ao completar 8 dígitos, logradouro e bairro são preenchidos automaticamente (ViaCEP / Brasil API).'
    : 'Para preenchimento automático, o modelo precisa dos campos de id adress (ou logradouro/endereco) e/ou bairro.'

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
      helperText={error || hintPadrao}
      slotProps={{
        htmlInput: {
          inputMode: 'numeric',
          maxLength: 8,
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
          value={value}
          onChange={(e) => onChange(f.id, e.target.value)}
        >
          {f.options.map((opt, i) => (
            <FormControlLabel
              key={`${f.id}-r-${i}`}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
              sx={{ alignItems: 'flex-start', mb: 0.5 }}
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
