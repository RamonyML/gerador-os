import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

type Props = {
  /** Quando true, exibe a textura inteira e mais visível (para amostras/preview). */
  preview?: boolean
}

const VIEW_W = 320
const VIEW_H = 660

/** Cápsulas/“pílulas” arredondadas em diagonal (traço grosso com ponta redonda). */
const BARS = [
  'M16,560 L82,494',
  'M40,628 L110,558',
  'M-2,604 L50,552',
  'M70,648 L122,596',
  'M120,640 L182,578',
  'M170,650 L226,594',
  'M232,636 L300,568',
  'M276,648 L320,604',
  'M150,560 L210,500',
  'M210,560 L262,508',
  'M60,520 L110,470',
  'M250,520 L300,470',
  'M110,500 L150,460',
  'M24,470 L24,508 L62,508',
  'M296,470 L258,470 L258,508',
  'M40,360 L96,304',
  'M250,360 L300,304',
  'M150,360 L206,304',
]

const DOTS = [
  [96, 560],
  [190, 560],
  [286, 560],
  [40, 470],
  [300, 440],
  [150, 470],
  [230, 520],
  [70, 628],
] as const

/**
 * Textura decorativa de “bolhas” (cápsulas arredondadas) para o fundo do menu
 * lateral. Monocromática (`currentColor`), adapta a tema claro/escuro e esmaece
 * no topo. Puramente estética (`aria-hidden`, `pointerEvents: none`).
 */
export function SidebarBubbles({ preview = false }: Props) {
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
        opacity: preview ? (dark ? 0.5 : 0.4) : dark ? 0.13 : 0.09,
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
        preserveAspectRatio={preview ? 'xMidYMid slice' : 'xMidYMax slice'}
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {BARS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="currentColor">
          {DOTS.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.2} />
          ))}
        </g>
      </Box>
    </Box>
  )
}
