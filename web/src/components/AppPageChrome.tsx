import type { ReactNode } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'

type Props = {
  overline: string
  title: string
  subtitle?: ReactNode
  /** Largura máxima do conteúdo (default `lg`). */
  maxWidth?: 'lg' | 'xl' | false
  /** Ex.: botão primário alinhado ao título em telas maiores. */
  headerRight?: ReactNode
  children: ReactNode
}

/**
 * Faixa superior com gradiente suave + hero tipográfico, alinhado ao Painel / Hub Suporte.
 */
export function AppPageChrome({
  overline,
  title,
  subtitle,
  maxWidth = 'lg',
  headerRight,
  children,
}: Props) {
  const theme = useTheme()
  const { mode } = useColorMode()
  const primary = theme.palette.primary.main

  const heroGradient =
    mode === 'light'
      ? `linear-gradient(135deg, ${alpha(primary, 0.12)} 0%, ${alpha(primary, 0.03)} 45%, transparent 100%)`
      : `linear-gradient(135deg, ${alpha(primary, 0.2)} 0%, ${alpha('#000', 0.12)} 48%, transparent 100%)`

  const inner = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
          >
            {overline}
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Box sx={{ mt: 0.5, maxWidth: 800 }}>{subtitle}</Box>
          ) : null}
        </Box>
        {headerRight ? (
          <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>{headerRight}</Box>
        ) : null}
      </Box>
      {children}
    </Box>
  )

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        background: heroGradient,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {maxWidth === false ? (
        <Box sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>{inner}</Box>
      ) : (
        <Container
          maxWidth={maxWidth}
          sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}
        >
          {inner}
        </Container>
      )}
    </Box>
  )
}
