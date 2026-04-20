import { alpha, useTheme } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'

type Props = {
  accent?: string
}

/** Ilustração “dashboard/upgrades” em estilo clean (inspirada em unDraw). */
export function UpgradesHeroIllustration({ accent: accentProp }: Props) {
  const theme = useTheme()
  const { mode } = useColorMode()
  const accent = accentProp ?? theme.palette.primary.main

  const bgCard = mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.95)
  const stroke = alpha(accent, mode === 'dark' ? 0.4 : 0.3)
  const muted = alpha(accent, mode === 'dark' ? 0.22 : 0.14)
  const ink = mode === 'light' ? alpha('#0b1220', 0.72) : alpha('#fff', 0.72)
  const skin = mode === 'light' ? '#f3b6a8' : '#c9897c'
  const hair = mode === 'light' ? '#2a2d3a' : '#1b1d26'

  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Ilustração: registros e gráficos de upgrades"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 220 }}
    >
      <defs>
        <filter id="upHeroShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor="#000"
            floodOpacity={mode === 'light' ? 0.08 : 0.35}
          />
        </filter>
        <linearGradient id="upHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity={mode === 'light' ? 0.55 : 0.45} />
        </linearGradient>
      </defs>

      {/* Card grande (dashboard) */}
      <g filter="url(#upHeroShadow)">
        <rect x="164" y="36" width="232" height="168" rx="18" fill={bgCard} stroke={stroke} strokeWidth="1.5" />
        <rect x="164" y="36" width="232" height="34" rx="18" fill={muted} />
        <rect x="164" y="52" width="232" height="18" fill={muted} />
        <circle cx="184" cy="53" r="4.2" fill={alpha(accent, 0.55)} />
        <circle cx="198" cy="53" r="4.2" fill={alpha(accent, 0.35)} />
        <circle cx="212" cy="53" r="4.2" fill={alpha(accent, 0.22)} />

        {/* barras */}
        <rect x="188" y="94" width="12" height="64" rx="6" fill="url(#upHeroGrad)" />
        <rect x="208" y="110" width="12" height="48" rx="6" fill={alpha(accent, 0.75)} />
        <rect x="228" y="84" width="12" height="74" rx="6" fill={alpha(accent, 0.6)} />
        <rect x="248" y="124" width="12" height="34" rx="6" fill={alpha(accent, 0.5)} />
        <rect x="268" y="104" width="12" height="54" rx="6" fill={alpha(accent, 0.68)} />
        <rect x="188" y="160" width="124" height="6" rx="3" fill={alpha(accent, 0.18)} />

        {/* mini linhas à direita */}
        <rect x="318" y="92" width="54" height="10" rx="5" fill={alpha(accent, 0.22)} />
        <rect x="318" y="112" width="66" height="10" rx="5" fill={alpha(accent, 0.18)} />
        <rect x="318" y="132" width="46" height="10" rx="5" fill={alpha(accent, 0.14)} />
        <rect x="318" y="154" width="72" height="28" rx="10" fill={alpha(accent, 0.16)} />
      </g>

      {/* Card pequeno à esquerda (preview gráfico) */}
      <g filter="url(#upHeroShadow)">
        <rect x="24" y="62" width="132" height="104" rx="16" fill={bgCard} stroke={stroke} strokeWidth="1.5" />
        <rect x="40" y="84" width="92" height="8" rx="4" fill={alpha(accent, 0.18)} />
        <rect x="40" y="100" width="76" height="7" rx="3.5" fill={alpha(accent, 0.14)} />
        <rect x="40" y="122" width="18" height="32" rx="6" fill={alpha(accent, 0.5)} />
        <rect x="64" y="112" width="18" height="42" rx="6" fill={alpha(accent, 0.72)} />
        <rect x="88" y="128" width="18" height="26" rx="6" fill={alpha(accent, 0.42)} />
        <rect x="112" y="106" width="18" height="48" rx="6" fill={alpha(accent, 0.6)} />
      </g>

      {/* Personagem simplificado (estilo unDraw) */}
      <g transform="translate(104, 88)">
        {/* cabeça */}
        <circle cx="44" cy="30" r="16" fill={skin} />
        {/* cabelo/coque */}
        <path
          d="M32 26c2-12 12-20 24-14 7 3 9 10 8 18-1 8-6 8-8 8 1-6-2-10-8-11-6-1-10 3-16-1z"
          fill={hair}
        />
        <circle cx="56" cy="10" r="8" fill={hair} />
        {/* corpo */}
        <path d="M26 56c8-10 28-10 36 0v44H26V56z" fill={alpha(ink, 0.12)} />
        {/* calça */}
        <path d="M26 100h36v44c-14 8-26 8-36 0v-44z" fill={alpha(ink, 0.55)} />
        {/* braço + gráfico */}
        <path d="M26 70c-10 6-18 12-18 18 0 6 8 10 14 6l12-8" fill="none" stroke={alpha(ink, 0.45)} strokeWidth="6" strokeLinecap="round" />
        <rect x="-6" y="60" width="34" height="26" rx="6" fill={bgCard} stroke={stroke} strokeWidth="1.2" />
        <rect x="2" y="78" width="6" height="6" rx="3" fill={alpha(accent, 0.75)} />
        <rect x="10" y="70" width="6" height="14" rx="3" fill={alpha(accent, 0.62)} />
        <rect x="18" y="74" width="6" height="10" rx="3" fill={alpha(accent, 0.5)} />
      </g>

      {/* destaque circular */}
      <circle cx="222" cy="88" r="22" fill={alpha('#ff4d6d', mode === 'light' ? 0.65 : 0.45)} />
      <path d="M230 70l18-10" stroke={alpha(ink, 0.45)} strokeWidth="3" strokeLinecap="round" />
      <path d="M246 58l3 8-8-3" fill={alpha(ink, 0.45)} />
    </svg>
  )
}

