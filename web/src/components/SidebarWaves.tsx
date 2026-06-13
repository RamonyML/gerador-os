import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

type Props = {
  /** Quando true, exibe a textura inteira e mais visível (para amostras/preview). */
  preview?: boolean
}

const VIEW_W = 240
const VIEW_H = 520

/**
 * Camada ondulada vertical no estilo "paper-cut": preenche da borda esquerda até
 * uma linha vertical sinuosa em torno de `baseX`. Camadas sobrepostas com
 * larguras diferentes criam a sensação de profundidade.
 */
function verticalWaveLayer(baseX: number, amp: number, seg = 78, dirStart = 1): string {
  const top = -20
  const bottom = VIEW_H + 20
  let d = `M ${baseX} ${top}`
  let y = top
  let dir = dirStart
  while (y < bottom) {
    const ctrlY = y + seg / 2
    const nextY = y + seg
    d += ` Q ${baseX + dir * amp} ${ctrlY} ${baseX} ${nextY}`
    y = nextY
    dir *= -1
  }
  d += ` L 0 ${y} L 0 ${top} Z`
  return d
}

const LAYERS = [
  { baseX: 168, amp: 26, dirStart: -1, factor: 0.7 },
  { baseX: 132, amp: 22, dirStart: 1, factor: 0.85 },
  { baseX: 96, amp: 24, dirStart: -1, factor: 1 },
  { baseX: 58, amp: 18, dirStart: 1, factor: 1.2 },
].map((l) => ({ ...l, d: verticalWaveLayer(l.baseX, l.amp, 78, l.dirStart) }))

/**
 * Textura decorativa de "faixas onduladas" verticais (paper-cut) para o fundo do
 * menu lateral. Monocromática (`currentColor`), adapta a tema claro/escuro e
 * esmaece para a direita para não competir com os itens. Puramente estética.
 */
export function SidebarWaves({ preview = false }: Props) {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'
  const base = preview ? 0.34 : dark ? 0.14 : 0.1

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        color: theme.palette.text.primary,
        overflow: 'hidden',
        ...(preview
          ? {}
          : {
              WebkitMaskImage:
                'linear-gradient(to top, #000 0%, #000 32%, transparent 72%)',
              maskImage:
                'linear-gradient(to top, #000 0%, #000 32%, transparent 72%)',
            }),
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMinYMid slice"
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g fill="currentColor">
          {LAYERS.map((l) => (
            <path
              key={l.baseX}
              d={l.d}
              fillOpacity={Math.min(1, base * l.factor)}
            />
          ))}
        </g>
      </Box>
    </Box>
  )
}
