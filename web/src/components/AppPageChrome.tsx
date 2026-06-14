import type { ReactNode } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'
import { Reveal } from './Reveal'
import { HeroIllustration } from './HeroIllustration'
import { ILLUSTRATIONS, type IllustrationKey } from '../data/illustrations'

type Props = {
  overline: string
  title: string
  subtitle?: ReactNode
  /** Largura máxima do conteúdo (default `lg`). */
  maxWidth?: 'lg' | 'xl' | false
  /** Ex.: botão primário alinhado ao título em telas maiores. */
  headerRight?: ReactNode
  /** Cor de destaque do hero (default = primary). Use para temas alternativos. */
  accentColor?: string
  /** Ilustração (estilo Storyset) exibida à direita do hero em telas md+. */
  illustration?: IllustrationKey
  /** Texto alternativo da ilustração. */
  illustrationAlt?: string
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
  accentColor,
  illustration,
  illustrationAlt,
  children,
}: Props) {
  const { mode } = useColorMode()

  // Sem fundo verde global: por padrão a página é transparente e mostra a
  // textura discreta do app. Só pinta um leve degradê quando a página pede um
  // accent explícito (ex.: vermelho da inviabilidade).
  const heroGradient = accentColor
    ? mode === 'light'
      ? `linear-gradient(135deg, ${alpha(accentColor, 0.12)} 0%, ${alpha(accentColor, 0.03)} 45%, transparent 100%)`
      : `linear-gradient(135deg, ${alpha(accentColor, 0.2)} 0%, ${alpha('#000', 0.12)} 48%, transparent 100%)`
    : undefined

  const hasIllustration = illustration != null

  const inner = (
    <Reveal>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0, flex: hasIllustration ? '1 1 auto' : undefined }}>
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
          {/* Quando há ilustração, os controles ficam abaixo do título (lado direito reservado à arte). */}
          {hasIllustration && headerRight ? (
            <Box sx={{ mt: 2 }}>{headerRight}</Box>
          ) : null}
        </Box>

        {hasIllustration ? (
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              width: '100%',
              maxWidth: 300,
              flexShrink: 0,
              ml: 2,
            }}
          >
            <HeroIllustration
              src={ILLUSTRATIONS[illustration]}
              alt={illustrationAlt ?? ''}
              maxWidth={300}
            />
          </Box>
        ) : headerRight ? (
          <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>{headerRight}</Box>
        ) : null}
      </Box>
      {children}
    </Box>
    </Reveal>
  )

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        background: heroGradient,
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
