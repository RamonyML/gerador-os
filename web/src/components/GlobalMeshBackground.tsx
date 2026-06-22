import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

/**
 * Textura "mesh" (treliça isométrica de cubos) usada como fundo global discreto
 * do app. Reaproveita o desenho da textura de menu (SidebarMesh), mas num
 * viewBox panorâmico e com um fade horizontal: a malha some à esquerda e fica
 * visível à direita. Monocromática, baixa opacidade e puramente estética
 * (`aria-hidden`, `pointerEvents: none`).
 */

const VIEW_W = 1440
const VIEW_H = 960
const R = 40
const COL = 1.5 * R
const ROW = Math.sqrt(3) * R

const f = (n: number) => Number(n.toFixed(1))

/** Vértices de um hexágono flat-top centrado em (cx, cy). */
function hexVertices(cx: number, cy: number): [number, number][] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i)
    return [f(cx + R * Math.cos(a)), f(cy + R * Math.sin(a))] as [number, number]
  })
}

const PATHS: string[] = []
const DOTS: { cx: number; cy: number }[] = []

;(() => {
  let k = 0
  for (let cx = -R; cx <= VIEW_W + R; cx += COL, k += 1) {
    const offset = k % 2 === 0 ? 0 : ROW / 2
    let r = 0
    for (let cy = -R + offset; cy <= VIEW_H + R; cy += ROW, r += 1) {
      const v = hexVertices(cx, cy)
      let d = `M ${v[0]![0]} ${v[0]![1]}`
      for (let i = 1; i < 6; i += 1) d += ` L ${v[i]![0]} ${v[i]![1]}`
      d += ' Z'
      const c = `${f(cx)} ${f(cy)}`
      d += ` M ${c} L ${v[0]![0]} ${v[0]![1]}`
      d += ` M ${c} L ${v[2]![0]} ${v[2]![1]}`
      d += ` M ${c} L ${v[4]![0]} ${v[4]![1]}`
      PATHS.push(d)
      if ((k + r) % 3 === 0) DOTS.push({ cx: f(cx), cy: f(cy) })
    }
  }
})()

export function GlobalMeshBackground() {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  // Fade horizontal: transparente à esquerda, cheio à direita.
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
        color: theme.palette.text.primary,
        opacity: dark ? 0.1 : 0.07,
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
        <g fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinejoin="round">
          {PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g fill="currentColor">
          {DOTS.map((dn) => (
            <circle key={`${dn.cx}-${dn.cy}`} cx={dn.cx} cy={dn.cy} r={1.7} />
          ))}
        </g>
      </Box>
    </Box>
  )
}
