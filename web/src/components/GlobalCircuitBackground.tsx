import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

/**
 * Fundo global no estilo "placa de circuito" (PCB): traços ortogonais que fluem
 * da esquerda para a direita, com curvas em 90° e "pads" nos cantos. Equivalente
 * panorâmico da textura de menu `SidebarCircuit`. Gerado de forma determinística
 * (sem flicker entre renders), com fade horizontal (some à esquerda).
 * Puramente estético (`aria-hidden`, `pointerEvents: none`).
 */

const VIEW_W = 1440
const VIEW_H = 960
const STEP = 48
const ROWS = Math.round(VIEW_H / STEP)

const f = (n: number) => Number(n.toFixed(1))

/** PRNG determinístico (mulberry32) para gerar sempre o mesmo traçado. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TRACES: string[] = []
const PADS: { x: number; y: number }[] = []

;(() => {
  const rand = mulberry32(20260614)
  for (let row = 1; row < ROWS; row += 1) {
    if (rand() < 0.35) continue
    let cx = -STEP
    let cy = row * STEP
    const pts: [number, number][] = [[cx, cy]]
    let guard = 0
    while (cx < VIEW_W + STEP && guard < 40) {
      guard += 1
      const run = (1 + Math.floor(rand() * 4)) * STEP
      cx += run
      pts.push([f(cx), f(cy)])
      // Eventual curva vertical (jog), mantendo dentro da faixa visível.
      if (rand() < 0.5 && cx < VIEW_W) {
        const dir = rand() < 0.5 ? -1 : 1
        const jog = (1 + Math.floor(rand() * 2)) * STEP
        const ny = cy + dir * jog
        if (ny > STEP && ny < VIEW_H - STEP) {
          cy = ny
          pts.push([f(cx), f(cy)])
          PADS.push({ x: f(cx), y: f(cy) })
        }
      }
    }
    TRACES.push(pts.map((p) => `${p[0]},${p[1]}`).join(' '))
  }
})()

export function GlobalCircuitBackground() {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  const fade =
    'linear-gradient(to right, transparent 0%, transparent 10%, #000 58%)'

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        color: theme.palette.text.primary,
        opacity: dark ? 0.12 : 0.07,
        overflow: 'hidden',
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {TRACES.map((pts, i) => (
            <polyline key={i} points={pts} />
          ))}
        </g>
        <g fill="currentColor">
          {PADS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.4} />
          ))}
        </g>
      </Box>
    </Box>
  )
}
