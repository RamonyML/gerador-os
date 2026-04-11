import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import type { OsTemplateField } from '../types/osTemplate'
import { getFieldControl } from '../types/osTemplate'

type Props = {
  fields: OsTemplateField[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
}

export function OsTemplateFieldsForm({ fields, values, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fields.map((f) => (
        <Box key={f.id}>
          <FieldInput field={f} value={values[f.id] ?? ''} onChange={onChange} />
        </Box>
      ))}
    </Box>
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

  if (kind === 'select' && f.options && f.options.length > 0) {
    return (
      <FormControl fullWidth>
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
    />
  )
}
