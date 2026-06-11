import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined'
import { AppPageChrome } from './AppPageChrome'
import { NavCard } from './NavCard'
import { Reveal } from './Reveal'

export type HubFlow = {
  label: string
  to: string
  description?: string
  icon?: ReactNode
  /** Cor de destaque (hex). Sobrepõe o accent da seção. */
  accent?: string
  badge?: ReactNode
}

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
  footer?: ReactNode
}

/**
 * Catálogo de fluxos de uma categoria: header padronizado + grades de NavCards
 * agrupadas por seção. Substitui os botões empilhados dos hubs por cards.
 */
export function HubCatalog({
  overline = 'Categoria',
  title,
  subtitle,
  backTo,
  backLabel,
  sections,
  footer,
}: Props) {
  return (
    <AppPageChrome
      overline={overline}
      title={title}
      subtitle={subtitle}
      maxWidth="lg"
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
      <Stack spacing={3.5}>
        {sections.map((section) => (
          <Box key={section.title}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              {section.title}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
              }}
            >
              {section.items.map((item, index) => (
                <Reveal key={item.label} delay={index * 60} sx={{ height: '100%' }}>
                  <NavCard
                    to={item.to}
                    icon={item.icon ?? <AppsOutlinedIcon sx={{ fontSize: 26 }} />}
                    title={item.label}
                    description={item.description}
                    accent={item.accent ?? section.accent}
                    badge={item.badge}
                  />
                </Reveal>
              ))}
            </Box>
          </Box>
        ))}
        {footer}
      </Stack>
    </AppPageChrome>
  )
}
