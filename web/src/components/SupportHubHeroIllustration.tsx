import { alpha, useTheme } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'

type Props = {
  accent?: string
}

/** Ilustração para o Hub do Suporte (estilo clean inspirado em unDraw). */
export function SupportHubHeroIllustration({ accent: accentProp }: Props) {
  const theme = useTheme()
  const { mode } = useColorMode()
  const accent = accentProp ?? theme.palette.primary.main

  const bgCard = mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.95)
  const stroke = alpha(accent, mode === 'dark' ? 0.4 : 0.28)
  const muted = alpha(accent, mode === 'dark' ? 0.22 : 0.12)
  const ink = mode === 'light' ? alpha('#0b1220', 0.7) : alpha('#fff', 0.75)
  const skin = mode === 'light' ? '#f1b2a4' : '#c88678'
  const hair = mode === 'light' ? '#2a2d3a' : '#1b1d26'

  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label="Ilustração: hub do suporte"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 220 }}
    >
      <defs>
        <filter id="supportHeroShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor="#000"
            floodOpacity={mode === 'light' ? 0.08 : 0.35}
          />
        </filter>
      </defs>

      {/* Painel / cards de categorias */}
      <g filter="url(#supportHeroShadow)">
        <rect x="176" y="36" width="220" height="168" rx="18" fill={bgCard} stroke={stroke} strokeWidth="1.5" />
        <rect x="176" y="36" width="220" height="36" rx="18" fill={muted} />
        <rect x="176" y="54" width="220" height="18" fill={muted} />

        {/* cards internos */}
        <rect x="196" y="92" width="180" height="32" rx="12" fill={alpha(accent, 0.08)} />
        <rect x="196" y="132" width="180" height="32" rx="12" fill={alpha(accent, 0.06)} />
        <rect x="196" y="172" width="180" height="18" rx="9" fill={alpha(accent, 0.05)} />

        {/* ícones / chips */}
        <circle cx="214" cy="108" r="8" fill={alpha(accent, 0.55)} />
        <rect x="230" y="104" width="92" height="8" rx="4" fill={alpha(accent, 0.18)} />
        <rect x="330" y="102" width="36" height="12" rx="6" fill={alpha(accent, 0.22)} />

        <circle cx="214" cy="148" r="8" fill={alpha(accent, 0.45)} />
        <rect x="230" y="144" width="110" height="8" rx="4" fill={alpha(accent, 0.16)} />
        <rect x="330" y="142" width="36" height="12" rx="6" fill={alpha(accent, 0.2)} />
      </g>

      {/* Bloco “chat/atendimento” à esquerda */}
      <g filter="url(#supportHeroShadow)">
        <rect x="24" y="74" width="136" height="104" rx="16" fill={bgCard} stroke={stroke} strokeWidth="1.5" />
        <path
          d="M52 106h74c10 0 18 8 18 18v10c0 10-8 18-18 18H84l-16 12v-12H52c-10 0-18-8-18-18v-10c0-10 8-18 18-18z"
          fill={alpha(accent, 0.1)}
        />
        <circle cx="62" cy="130" r="4" fill={alpha(accent, 0.65)} />
        <circle cx="78" cy="130" r="4" fill={alpha(accent, 0.45)} />
        <circle cx="94" cy="130" r="4" fill={alpha(accent, 0.3)} />
      </g>

      {/* Personagem simplificado (operador) */}
      <g transform="translate(112, 98)">
        <circle cx="46" cy="28" r="16" fill={skin} />
        <path
          d="M34 26c2-12 12-20 24-14 7 3 9 10 8 18-1 8-6 8-8 8 1-6-2-10-8-11-6-1-10 3-16-1z"
          fill={hair}
        />
        {/* headset */}
        <path d="M30 30c0-12 8-22 20-22s20 10 20 22" fill="none" stroke={alpha(ink, 0.35)} strokeWidth="5" strokeLinecap="round" />
        <rect x="22" y="34" width="8" height="16" rx="4" fill={alpha(ink, 0.35)} />
        <rect x="70" y="34" width="8" height="16" rx="4" fill={alpha(ink, 0.35)} />
        <path d="M78 46c10 0 12 8 6 14" fill="none" stroke={alpha(ink, 0.35)} strokeWidth="4" strokeLinecap="round" />
        <circle cx="84" cy="62" r="4" fill={alpha(ink, 0.35)} />

        {/* corpo */}
        <path d="M28 54c10-10 34-10 44 0v48H28V54z" fill={alpha(ink, 0.12)} />
        <path d="M28 92h44v44c-18 10-30 10-44 0V92z" fill={alpha(ink, 0.55)} />
        {/* braço apontando */}
        <path d="M72 70c14 6 26 2 34-6" fill="none" stroke={alpha(ink, 0.45)} strokeWidth="6" strokeLinecap="round" />
        <circle cx="108" cy="62" r="6" fill={alpha(accent, 0.7)} />
      </g>
    </svg>
  )
}

