type Props = {
  accent: string
  muted: string
}

/** Ilustração vetorial simples (formas planas, sombras suaves, cor de destaque). */
export function LoginHeroIllustration({ accent, muted }: Props) {
  return (
    <svg
      viewBox="0 0 640 420"
      role="img"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <linearGradient id="loginHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
        </linearGradient>
        <filter id="loginHeroShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="12"
            floodColor="#000"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      <ellipse cx="320" cy="360" rx="260" ry="28" fill={muted} opacity="0.35" />

      <rect
        x="120"
        y="72"
        width="400"
        height="260"
        rx="28"
        fill="#fff"
        opacity="0.92"
        filter="url(#loginHeroShadow)"
      />
      <rect x="148" y="104" width="344" height="196" rx="16" fill={muted} opacity="0.25" />

      <rect x="176" y="132" width="120" height="12" rx="6" fill={accent} opacity="0.35" />
      <rect x="176" y="156" width="200" height="10" rx="5" fill={accent} opacity="0.2" />
      <rect x="176" y="178" width="160" height="10" rx="5" fill={accent} opacity="0.15" />

      <rect x="176" y="210" width="288" height="44" rx="12" fill="#fff" stroke={accent} strokeOpacity="0.35" />
      <rect x="192" y="224" width="96" height="16" rx="8" fill={accent} opacity="0.2" />

      <circle cx="492" cy="154" r="44" fill="url(#loginHeroGrad)" opacity="0.9" />
      <path
        d="M478 154l10 10 22-26"
        fill="none"
        stroke="#fff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <ellipse cx="420" cy="312" rx="36" ry="36" fill={accent} opacity="0.85" />
      <path
        d="M420 278c-18 0-32 14-32 32v8h64v-8c0-18-14-32-32-32z"
        fill={accent}
        opacity="0.95"
      />
      <ellipse cx="420" cy="250" rx="28" ry="28" fill={accent} />

      <path
        d="M468 296c28 8 48 34 52 62"
        fill="none"
        stroke={accent}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="528" cy="372" r="10" fill={accent} opacity="0.45" />

      <rect x="96" y="248" width="72" height="96" rx="18" fill="#fff" opacity="0.95" filter="url(#loginHeroShadow)" />
      <rect x="112" y="264" width="40" height="56" rx="10" fill={muted} opacity="0.35" />
      <circle cx="132" cy="288" r="6" fill={accent} opacity="0.6" />
    </svg>
  )
}
