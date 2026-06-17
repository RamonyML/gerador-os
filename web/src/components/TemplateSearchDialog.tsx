import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Dialog,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import type { UserProfile } from '../types/profile'
import { getOsTemplatesForProfile } from '../data/osTemplateRegistry'
import { SUPPORT_DEMANDS } from '../data/supportDemands'
import { CADASTRO_DEMANDS } from '../data/cadastroDemands'
import { INSTALACAO_DEMANDS } from '../data/instalacaoDemands'

const DIACRITIC_RE = /\p{Diacritic}/gu
const strip = (s: string) => s.toLowerCase().normalize('NFD').replace(DIACRITIC_RE, '')

const ALL_DEMANDS = [...SUPPORT_DEMANDS, ...CADASTRO_DEMANDS, ...INSTALACAO_DEMANDS]

function demandLabel(id: string): string {
  return ALL_DEMANDS.find((d) => d.id === id)?.title ?? id
}

type Props = {
  open: boolean
  onClose: () => void
  profile: UserProfile | null
}

export function TemplateSearchDialog({ open, onClose, profile }: Props) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const allTemplates = useMemo(() => getOsTemplatesForProfile(profile), [profile])

  const filtered = useMemo(() => {
    const q = strip(query.trim())
    if (!q) return allTemplates.slice(0, 10)
    return allTemplates.filter((t) => strip(t.title).includes(q))
  }, [allTemplates, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const handleSelect = (slug: string, demandCategory: string) => {
    navigate(`/gerar-os?slug=${encodeURIComponent(slug)}&demanda=${encodeURIComponent(demandCategory)}`)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3, mt: { xs: 4, sm: 8 }, mx: 2, verticalAlign: 'top' } } }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Buscar modelo… ex: luz vermelha, altplan, feedback"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'Enter' && filtered.length === 1) {
              handleSelect(filtered[0]!.slug, filtered[0]!.demandCategory)
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <List dense sx={{ px: 1, pb: 1.5, maxHeight: 420, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
            Nenhum modelo encontrado para "{query}".
          </Typography>
        ) : (
          filtered.map((t) => (
            <ListItemButton
              key={t.id}
              onClick={() => handleSelect(t.slug, t.demandCategory)}
              sx={{ borderRadius: 1.5, mb: 0.25 }}
            >
              <ListItemText
                primary={t.title}
                secondary={demandLabel(t.demandCategory)}
                slotProps={{
                  primary: { sx: { fontWeight: 600, fontSize: 14 } },
                  secondary: { sx: { fontSize: 12 } },
                }}
              />
            </ListItemButton>
          ))
        )}
      </List>

      {!query && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1.5, display: 'block' }}>
          Exibindo os primeiros {Math.min(10, allTemplates.length)} de {allTemplates.length} modelos disponíveis.
        </Typography>
      )}
    </Dialog>
  )
}
