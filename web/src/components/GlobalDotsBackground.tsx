import { Box } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

/**
 * Fundo global de grade de pontos — usado quando a textura escolhida é
 * "Nenhuma". Discreto, monocromático e com fade horizontal (some à esquerda),
 * mantendo o mesmo padrão visual dos demais fundos globais.
 * Puramente estético (`aria-hidden`, `pointerEvents: none`).
 */
export function GlobalDotsBackground() {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'
  const dot = alpha(theme.palette.text.primary, dark ? 0.05 : 0.045)

  const fade =
    'linear-gradient(to right, transparent 0%, transparent 10%, #000 58%)'

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `radial-gradient(${dot} 1px, transparent 0)`,
        backgroundSize: '24px 24px',
        backgroundPosition: '-12px -12px',
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    />
  )
}
