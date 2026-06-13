import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

type Props = {
  /** Quando true, exibe a textura inteira e mais visível (para amostras/preview). */
  preview?: boolean
}

/**
 * Textura decorativa estilo "placa de circuito" para a barra lateral: traços
 * verticais que nascem embaixo e somem no topo. Usa `currentColor` + opacidade
 * baixa para se adaptar a tema claro/escuro. Puramente estética
 * (`aria-hidden`, `pointerEvents: none`).
 */
export function SidebarCircuit({ preview = false }: Props) {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  const mask = 'linear-gradient(to top, #000 0%, #000 32%, transparent 70%)'

  const lines = (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20,660 20,520 46,492 46,408" />
      <polyline points="44,660 44,560 70,532 70,392 96,364 96,286" />
      <polyline points="74,660 74,596 100,596 100,492" />
      <polyline points="116,660 116,452 142,424 142,330" />
      <polyline points="146,660 146,592 178,560 178,452 204,424 204,330" />
      <polyline points="188,660 188,520 214,520 214,420" />
      <polyline points="226,660 226,556 252,528 252,412" />
      <polyline points="268,660 268,596 296,568 296,468" />
      <polyline points="96,300 96,236 72,212 72,140" />
      <polyline points="120,286 150,286 150,200 174,176 174,96" />
      <polyline points="204,300 204,240 230,214 230,120" />
      <polyline points="252,300 252,228 278,202 278,116" />
      <polyline points="60,300 60,232 36,206 36,120" />
      <polyline points="174,140 174,72 150,48 150,0" />
      <polyline points="230,96 256,96 256,40" />
      <polyline points="96,200 122,200 122,128" />
      <polyline points="36,440 62,440 62,360" />
      <polyline points="296,360 296,300 272,276 272,210" />
    </g>
  )

  const dots = (
    <g fill="currentColor">
      <circle cx="46" cy="408" r="2.6" />
      <circle cx="96" cy="286" r="2.6" />
      <circle cx="100" cy="492" r="2.6" />
      <circle cx="142" cy="330" r="2.6" />
      <circle cx="204" cy="330" r="2.6" />
      <circle cx="214" cy="420" r="2.6" />
      <circle cx="252" cy="412" r="2.6" />
      <circle cx="296" cy="468" r="2.6" />
      <circle cx="72" cy="140" r="2.6" />
      <circle cx="174" cy="96" r="2.6" />
      <circle cx="230" cy="120" r="2.6" />
      <circle cx="278" cy="116" r="2.6" />
      <circle cx="36" cy="120" r="2.6" />
      <circle cx="150" cy="0" r="2.6" />
      <circle cx="256" cy="40" r="2.6" />
      <circle cx="122" cy="128" r="2.6" />
      <circle cx="62" cy="360" r="2.6" />
      <circle cx="272" cy="210" r="2.6" />
      <circle cx="120" cy="286" r="2.2" />
      <circle cx="120" cy="200" r="2.2" />
      <circle cx="60" cy="300" r="2.2" />
      <circle cx="204" cy="300" r="2.2" />
      <circle cx="252" cy="300" r="2.2" />
    </g>
  )

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        color: theme.palette.text.primary,
        opacity: preview ? (dark ? 0.5 : 0.4) : dark ? 0.12 : 0.07,
        overflow: 'hidden',
        ...(preview
          ? {}
          : { WebkitMaskImage: mask, maskImage: mask }),
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 320 660"
        preserveAspectRatio={preview ? 'xMidYMid slice' : 'xMidYMax slice'}
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        {lines}
        {dots}
      </Box>
    </Box>
  )
}
