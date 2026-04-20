import { alpha, useTheme } from '@mui/material/styles'
import { useColorMode } from '../contexts/ColorModeContext'

type Props = {
  /** Cor principal (equivale ao destaque teal do unDraw). */
  accent?: string
}

/**
 * Ilustração no estilo unDraw “Add user”: janela de app + avatar + selo “+”.
 * Vetor próprio, inspirado na composição do unDraw (uso interno no painel).
 */
export function AddUserHeroIllustration({ accent: accentProp }: Props) {
  const theme = useTheme()
  const { mode } = useColorMode()
  const accent = accentProp ?? theme.palette.primary.main
  const windowFill = mode === 'light' ? '#ffffff' : alpha(theme.palette.background.paper, 0.95)
  const chromeBar = mode === 'light' ? alpha(theme.palette.text.primary, 0.06) : alpha('#fff', 0.08)
  const lineMuted = alpha(accent, mode === 'dark' ? 0.35 : 0.22)
  const avatarFill = alpha(accent, 0.88)
  const skinTone = mode === 'light' ? '#c4a882' : '#a08060'
  const hairTone = mode === 'light' ? '#3d3229' : '#2a221c'

  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label="Ilustração: adicionar usuário"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 200 }}
    >
      <defs>
        <filter id="addUserShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="8"
            floodColor="#000"
            floodOpacity={mode === 'light' ? 0.1 : 0.35}
          />
        </filter>
      </defs>

      {/* Janela estilo browser */}
      <g filter="url(#addUserShadow)">
        <rect
          x="24"
          y="36"
          width="220"
          height="160"
          rx="14"
          fill={windowFill}
          stroke={alpha(accent, 0.35)}
          strokeWidth="1.5"
        />
        <rect x="24" y="36" width="220" height="28" rx="14" fill={chromeBar} />
        <rect x="24" y="50" width="220" height="14" fill={chromeBar} />
        <circle cx="42" cy="50" r="4" fill="#ff5f57" opacity="0.9" />
        <circle cx="58" cy="50" r="4" fill="#febc2e" opacity="0.9" />
        <circle cx="74" cy="50" r="4" fill="#28c840" opacity="0.9" />
        {/* Linhas de conteúdo */}
        <rect x="44" y="82" width="100" height="8" rx="4" fill={lineMuted} />
        <rect x="44" y="98" width="160" height="6" rx="3" fill={lineMuted} opacity="0.75" />
        <rect x="44" y="112" width="140" height="6" rx="3" fill={lineMuted} opacity="0.55" />
        <rect x="44" y="132" width="180" height="40" rx="8" fill={alpha(accent, 0.06)} />
      </g>

      {/* Avatar + pessoa (estilo flat unDraw) */}
      <g transform="translate(158, 88)">
        <circle cx="72" cy="72" r="56" fill={avatarFill} opacity="0.95" />
        <circle cx="72" cy="58" r="22" fill={skinTone} />
        {/* cabelo coque duplo simplificado */}
        <ellipse cx="58" cy="48" rx="10" ry="12" fill={hairTone} />
        <ellipse cx="86" cy="48" rx="10" ry="12" fill={hairTone} />
        <ellipse cx="72" cy="44" rx="20" ry="16" fill={hairTone} />
        <path
          d="M 40 100 Q 72 78 104 100 L 104 120 Q 72 108 40 120 Z"
          fill={alpha(accent, 0.95)}
        />
        {/* Selo + */}
        <circle cx="118" cy="38" r="22" fill={accent} />
        <path
          d="M 118 30 v16 M 110 38 h16"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
