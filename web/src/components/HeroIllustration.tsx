import { Box } from '@mui/material'
import { useColorMode } from '../contexts/ColorModeContext'

type Props = {
  src: string
  alt?: string
  /** Largura máxima da ilustração (px). */
  maxWidth?: number
}

/**
 * Renderiza uma ilustração (estilo Storyset) com sombra suave e sem fundo,
 * adaptando o realce ao tema claro/escuro.
 */
export function HeroIllustration({ src, alt = '', maxWidth = 420 }: Props) {
  const { isDark } = useColorMode()
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        width: '100%',
        maxWidth,
        height: 'auto',
        display: 'block',
        mx: 'auto',
        userSelect: 'none',
        filter:
          isDark
            ? 'drop-shadow(0 16px 34px rgba(0,0,0,0.5))'
            : 'drop-shadow(0 16px 30px rgba(16,24,40,0.1))',
      }}
    />
  )
}
