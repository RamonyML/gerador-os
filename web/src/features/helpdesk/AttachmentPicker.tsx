import { useRef } from 'react'
import { Box, Button, Chip, Typography } from '@mui/material'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_HINT,
  MAX_ATTACHMENT_COUNT,
  formatBytes,
  validateImageFile,
} from '../../lib/ticketAttachments'

type Props = {
  files: File[]
  onChange: (files: File[]) => void
  onError: (message: string | null) => void
  disabled?: boolean
  label?: string
}

/**
 * Seleção de imagens (prints/fotos) com validação de tipo e tamanho (10MB).
 * Mantém o estado dos arquivos no componente pai via `files`/`onChange`.
 */
export function AttachmentPicker({
  files,
  onChange,
  onError,
  disabled,
  label = 'Anexar imagens',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelected = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const incoming = Array.from(list)
    const errors: string[] = []
    const valid: File[] = []
    for (const file of incoming) {
      const err = validateImageFile(file)
      if (err) errors.push(err)
      else valid.push(file)
    }
    const remaining = MAX_ATTACHMENT_COUNT - files.length
    let accepted = valid
    if (valid.length > remaining) {
      accepted = valid.slice(0, Math.max(0, remaining))
      errors.push(
        `Limite de ${MAX_ATTACHMENT_COUNT} imagens por envio: os arquivos excedentes foram ignorados.`,
      )
    }
    onError(errors.length ? errors.join(' ') : null)
    if (accepted.length) onChange([...files, ...accepted])
    if (inputRef.current) inputRef.current.value = ''
  }

  const atLimit = files.length >= MAX_ATTACHMENT_COUNT

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        hidden
        onChange={(e) => handleSelected(e.target.files)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ImageOutlinedIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || atLimit}
        >
          {label}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {ATTACHMENT_HINT}
        </Typography>
      </Box>
      {files.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
          {files.map((file, index) => (
            <Chip
              key={`${file.name}-${index}`}
              label={`${file.name} (${formatBytes(file.size)})`}
              onDelete={disabled ? undefined : () => removeAt(index)}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
