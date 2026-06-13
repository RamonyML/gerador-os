import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

type Props = {
  /** Quando true, exibe a textura inteira e mais visível (para amostras/preview). */
  preview?: boolean
}

const VIEW_W = 320
const VIEW_H = 660
const STEP = 30

/** Grade pontilhada (linhas alternadas levemente deslocadas, para um ar orgânico). */
const DOTS: { cx: number; cy: number }[] = []
for (let row = 0, y = 16; y <= VIEW_H; y += STEP, row += 1) {
  const offset = row % 2 === 0 ? 0 : STEP / 2
  for (let x = 14 + offset; x <= VIEW_W; x += STEP) {
    DOTS.push({ cx: x, cy: y })
  }
}

/**
 * Textura decorativa de “pontos” (grade pontilhada) para o fundo do menu lateral.
 * Monocromática (`currentColor`), adapta a tema claro/escuro e esmaece no topo.
 * Puramente estética (`aria-hidden`, `pointerEvents: none`).
 */
export function SidebarDots({ preview = false }: Props) {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        color: theme.palette.text.primary,
        opacity: preview ? (dark ? 0.55 : 0.45) : dark ? 0.16 : 0.1,
        overflow: 'hidden',
        ...(preview
          ? {}
          : {
              WebkitMaskImage:
                'linear-gradient(to top, #000 0%, #000 32%, transparent 74%)',
              maskImage:
                'linear-gradient(to top, #000 0%, #000 32%, transparent 74%)',
            }),
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio={preview ? 'xMidYMid slice' : 'xMidYMax slice'}
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g fill="currentColor">
          {DOTS.map((d) => (
            <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r={2.1} />
          ))}
        </g>
      </Box>
    </Box>
  )
}
