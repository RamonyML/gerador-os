import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Search as SearchIcon } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import {
  Autocomplete,
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
  useTheme,
} from '@mui/material'
import { BAIRROS_UDI } from '../data/bairros'
import { GRAU_RELACIONAMENTO } from '../data/grauRelacionamento'
import { CARGO_FUNCAO } from '../data/cargoFuncao'
import type { FieldOption, OsTemplateField } from '../types/osTemplate'
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
  /** IDs de campos com valor vazio que devem ser destacados em vermelho. */
  errorFieldIds?: ReadonlySet<string>
  /** Conteúdo extra (já envolto em Grid item) inserido no final da última seção. */
  appendToLastSection?: ReactNode
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

function weekdayFromBrDate(dateStr: string): number | null {
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return isNaN(d.getTime()) ? null : d.getDay()
}

function resolveWeekdayOptions(
  field: OsTemplateField,
  allValues: Record<string, string>,
): { options: FieldOption[]; disabled: boolean } | null {
  const conf = field.optionsFromWeekday
  if (!conf) return null
  const dateStr = allValues[conf.sourceField] ?? ''
  const weekday = weekdayFromBrDate(dateStr)
  if (weekday === null) return { options: conf.defaultOptions, disabled: false }
  const entry = conf.byWeekday[weekday]
  if (entry === 'disabled') return { options: [], disabled: true }
  return { options: entry ?? conf.defaultOptions, disabled: false }
}

export function isFieldDisabled(
  field: OsTemplateField,
  values: Record<string, string>,
): boolean {
  // CTOI não tem identificação própria; o campo CTO só faz sentido para CTOE
  if (field.id === 'cto') return (values['ctoType'] ?? '') === 'CTOI'
  if (field.optionsFromWeekday) {
    const resolved = resolveWeekdayOptions(field, values)
    if (resolved?.disabled) return true
  }
  return false
}

const FIELD_SUGGESTIONS: Record<string, readonly string[]> = {
  bairro: BAIRROS_UDI,
  grauComp: GRAU_RELACIONAMENTO,
  parente: GRAU_RELACIONAMENTO,
  cargo: CARGO_FUNCAO,
}

function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function SuggestionsField({
  field: f,
  value,
  onChange,
  disabled = false,
  suggestions,
}: {
  field: OsTemplateField
  value: string
  onChange: (id: string, value: string) => void
  disabled?: boolean
  suggestions: readonly string[]
}) {
  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      options={suggestions as string[]}
      value={value}
      inputValue={value}
      onInputChange={(_, newValue) => onChange(f.id, newValue.toUpperCase())}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') onChange(f.id, newValue)
      }}
      filterOptions={(options, { inputValue }) => {
        const norm = normalizeText(inputValue)
        if (!norm) return options
        return options.filter((opt) => normalizeText(opt).includes(norm))
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={f.label}
          placeholder={f.placeholder ?? 'Digite ou selecione'}
          size="small"
        />
      )}
    />
  )
}

export function OsTemplateFieldsForm({
  fields,
  values,
  onChange,
  onPatchValues,
  accent = 'green',
  errorFieldIds,
  appendToLastSection,
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
              const disabled = isFieldDisabled(f, values)
              const fieldOnChange =
                f.id === 'ctoType'
                  ? (id: string, v: string) => {
                      onChange(id, v)
                      if (v === 'CTOI') onChange('cto', '')
                    }
                  : fields.some((ff) => ff.optionsFromWeekday?.sourceField === f.id)
                  ? (id: string, v: string) => {
                      onChange(id, v)
                      for (const ff of fields) {
                        if (ff.optionsFromWeekday?.sourceField === f.id) onChange(ff.id, '')
                      }
                    }
                  : onChange
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
                  ) : f.id in FIELD_SUGGESTIONS ? (
                    <SuggestionsField
                      field={f}
                      value={values[f.id] ?? ''}
                      onChange={fieldOnChange}
                      disabled={disabled}
                      suggestions={FIELD_SUGGESTIONS[f.id]!}
                    />
                  ) : (
                    <FieldInput
                      field={f}
                      value={values[f.id] ?? ''}
                      onChange={fieldOnChange}
                      disabled={disabled}
                      hasError={errorFieldIds?.has(f.id) ?? false}
                      allValues={values}
                    />
                  )}
                </Grid>
              )
            })}
            {bi === sections.length - 1 ? appendToLastSection : null}
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

function FactoryIcon() {
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
      <path d="M12 16h.01" />
      <path d="M16 16h.01" />
      <path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
      <path d="M8 16h.01" />
    </svg>
  )
}

function BanknoteXIcon() {
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
      <path d="M13 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
      <path d="m17 17 5 5" />
      <path d="M18 12h.01" />
      <path d="m22 17-5 5" />
      <path d="M6 12h.01" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function OctagonXIcon() {
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
      <path d="m15 9-6 6" />
      <path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function PlugIcon() {
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
      <path d="M12 22v-5" />
      <path d="M15 8V2" />
      <path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z" />
      <path d="M9 8V2" />
    </svg>
  )
}

function RouterIcon() {
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
      <rect width="20" height="8" x="2" y="14" rx="2" />
      <path d="M6.01 18H6" />
      <path d="M10.01 18H10" />
      <path d="M15 10v4" />
      <path d="M17.84 7.17a4 4 0 0 0-5.66 0" />
      <path d="M20.66 4.34a8 8 0 0 0-11.31 0" />
    </svg>
  )
}

function FieldOptionIcon({ name }: { name?: string }) {
  if (name === 'user-round') return <UserRoundIcon />
  if (name === 'users-round') return <UsersRoundIcon />
  if (name === 'factory') return <FactoryIcon />
  if (name === 'banknote-x') return <BanknoteXIcon />
  if (name === 'octagon-x') return <OctagonXIcon />
  if (name === 'plug') return <PlugIcon />
  if (name === 'router') return <RouterIcon />
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
  const theme = useTheme()
  const options = f.options ?? []
  const isRed = f.tone === 'red'
  const p = theme.palette.primary
  const gradient = isRed
    ? 'linear-gradient(135deg, #a31515 0%, #e23b3b 100%)'
    : `linear-gradient(135deg, ${p.dark} 0%, ${p.main} 100%)`
  const gradientHover = isRed
    ? 'linear-gradient(135deg, #8d1212cc 0%, #d23232 100%)'
    : `linear-gradient(135deg, ${p.dark} 0%, ${p.light} 100%)`
  const shadow = isRed
    ? '0 2px 10px rgba(163, 21, 21, 0.25)'
    : `0 2px 10px ${p.main}40`
  const itemColor = isRed ? 'error.main' : 'primary.main'
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
  disabled = false,
  hasError = false,
  allValues = {},
}: {
  field: OsTemplateField
  value: string
  onChange: (id: string, value: string) => void
  disabled?: boolean
  hasError?: boolean
  allValues?: Record<string, string>
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
        disabled={disabled}
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
        disabled={disabled}
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
        disabled={disabled}
        error={hasError}
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
        disabled={disabled}
        error={hasError}
        slotProps={{
          htmlInput: {
            inputMode: 'decimal',
            maxLength: 5,
          },
        }}
      />
    )
  }

  if (kind === 'select') {
    const weekdayResolved = resolveWeekdayOptions(f, allValues)
    const selectOptions = weekdayResolved?.options ?? f.options ?? []
    const isDisabled = disabled || (weekdayResolved?.disabled === true)
    const helperText = weekdayResolved?.disabled
      ? 'Não atendemos aos domingos'
      : f.placeholder ?? null

    if (selectOptions.length > 0 || isDisabled) {
      return (
        <FormControl fullWidth size="small" disabled={isDisabled}>
          <InputLabel id={`${f.id}-lbl`}>{f.label}</InputLabel>
          <Select
            labelId={`${f.id}-lbl`}
            label={f.label}
            value={isDisabled ? '' : value}
            onChange={(e) => onChange(f.id, e.target.value)}
          >
            {selectOptions.map((opt, i) => (
              <MenuItem key={`${f.id}-opt-${i}`} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {helperText ? (
            <Typography variant="caption" color={weekdayResolved?.disabled ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
              {helperText}
            </Typography>
          ) : null}
        </FormControl>
      )
    }
  }

  if (kind === 'radio' && f.options && f.options.length > 0) {
    return (
      <FormControl component="fieldset" variant="standard" disabled={disabled}>
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
        disabled={disabled}
        error={hasError}
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
      disabled={disabled}
      error={hasError}
    />
  )
}
