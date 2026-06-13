import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

type Props = {
  /** Quando true, exibe a textura inteira e mais visível (para amostras/preview). */
  preview?: boolean
}

const VIEW_W = 320
const VIEW_H = 660

function hexPath(cx: number, cy: number, r: number): string {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i + 30)
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
  })
  return `M ${points.join(' L ')} Z`
}

const HEXES = [
  { cx: 18, cy: 120, r: 46 },
  { cx: 82, cy: 214, r: 34 },
  { cx: 18, cy: 340, r: 54 },
  { cx: 116, cy: 452, r: 42 },
  { cx: 34, cy: 566, r: 46 },
  { cx: 176, cy: 568, r: 62 },
  { cx: 148, cy: 112, r: 18 },
  { cx: 204, cy: 250, r: 28 },
  { cx: 74, cy: 496, r: 14 },
].map((h) => ({ ...h, d: hexPath(h.cx, h.cy, h.r) }))

const LINKS = [
  'M 52 214 L 48 340',
  'M 58 496 L 34 566',
  'M 102 496 L 138 538',
  'M 110 214 L 176 250',
  'M 118 120 L 148 112',
  'M 204 250 L 248 250',
]

const NODES = [
  [52, 214],
  [48, 340],
  [58, 496],
  [102, 496],
  [138, 538],
  [176, 250],
  [248, 250],
] as const

/**
 * Textura decorativa com hexágonos e conexões finas, inspirada em padrões
 * tecnológicos/moleculares. Monocromática, adaptada ao tema e com fade no topo.
 */
export function SidebarHexagons({ preview = false }: Props) {
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
        opacity: preview ? (dark ? 0.48 : 0.38) : dark ? 0.13 : 0.085,
        overflow: 'hidden',
        ...(preview
          ? {}
          : {
              WebkitMaskImage:
                'linear-gradient(to top, #000 0%, #000 34%, transparent 74%)',
              maskImage:
                'linear-gradient(to top, #000 0%, #000 34%, transparent 74%)',
            }),
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio={preview ? 'xMidYMid slice' : 'xMinYMax slice'}
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {HEXES.map((h) => (
            <path key={`${h.cx}-${h.cy}`} d={h.d} />
          ))}
          {LINKS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="currentColor">
          {NODES.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.4} />
          ))}
        </g>
      </Box>
    </Box>
  )
}
