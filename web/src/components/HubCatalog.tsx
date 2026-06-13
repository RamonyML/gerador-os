import { useEffect, useState, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded'
import { AppPageChrome } from './AppPageChrome'
import { HubCard, HubCategoryHeader, type HubCardData } from './HubCard'
import { Reveal } from './Reveal'
import type { IllustrationKey } from '../data/illustrations'

export type HubFlow = HubCardData

export type HubSection = {
  title: string
  accent?: string
  items: HubFlow[]
}

type Props = {
  overline?: string
  title: string
  subtitle?: ReactNode
  backTo: string
  backLabel: string
  sections: HubSection[]
  /** Ilustração (estilo Storyset) exibida à direita do hero em telas md+. */
  illustration?: IllustrationKey
  /** Texto alternativo da ilustração. */
  illustrationAlt?: string
  /** Rótulo exibido à esquerda da barra de visualização (ex.: "Tipos de manutenção"). */
  toolbarLabel?: string
}

type HubView = 'grid' | 'list'
const VIEW_STORAGE_KEY = 'hub:view-mode'

function readStoredView(): HubView {
  if (typeof window === 'undefined') return 'grid'
  return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid'
}

/**
 * Catálogo de fluxos de uma categoria: hero padronizado + categorias com indicador
 * colorido e grade de cards modernos, com alternância grade/lista.
 */
export function HubCatalog({
  overline = 'Categoria',
  title,
  subtitle,
  backTo,
  backLabel,
  sections,
  illustration,
  illustrationAlt,
  toolbarLabel,
}: Props) {
  const theme = useTheme()
  const [view, setView] = useState<HubView>(readStoredView)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view)
    }
  }, [view])

  const isList = view === 'list'

  return (
    <AppPageChrome
      overline={overline}
      title={title}
      subtitle={subtitle}
      maxWidth="lg"
      illustration={illustration}
      illustrationAlt={illustrationAlt}
      headerRight={
        <Button
          component={RouterLink}
          to={backTo}
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderColor: 'divider' }}
        >
          {backLabel}
        </Button>
      }
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: toolbarLabel ? 'space-between' : 'flex-end',
          gap: 2,
          flexWrap: 'wrap',
          mb: 0.5,
        }}
      >
        {toolbarLabel ? (
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {toolbarLabel}
          </Typography>
        ) : null}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, next: HubView | null) => {
            if (next) setView(next)
          }}
          aria-label="Modo de visualização"
        >
          <Tooltip title="Visualizar em grade">
            <ToggleButton value="grid" aria-label="Grade">
              <GridViewRoundedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Visualizar em lista">
            <ToggleButton value="list" aria-label="Lista">
              <ViewListRoundedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={4.5} sx={{ mt: 2 }}>
        {sections.map((section) => {
          const sectionAccent = section.accent ?? theme.palette.primary.main
          return (
            <Box key={section.title}>
              <HubCategoryHeader
                title={section.title}
                accent={sectionAccent}
                count={section.items.length}
              />
              <Box
                sx={{
                  display: 'grid',
                  gap: 2.5,
                  gridTemplateColumns: isList
                    ? '1fr'
                    : {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                      },
                }}
              >
                {section.items.map((item, index) => (
                  <Reveal
                    key={`${view}-${item.label}`}
                    delay={index * 45}
                    sx={{ height: '100%' }}
                  >
                    <HubCard item={item} accent={sectionAccent} horizontal={isList} />
                  </Reveal>
                ))}
              </Box>
            </Box>
          )
        })}
      </Stack>
    </AppPageChrome>
  )
}
