import { createTheme } from '@mui/material/styles'
import type { Shadows } from '@mui/material/styles'

/** Tema claro — verdes corporativos sobre canvas suave (estética SaaS). */
const LIGHT = {
  primary: '#1B5E20',
  primaryHover: '#2E7D32',
  secondary: '#2E7D32',
  bg: '#F4F6F8',
  paper: '#FFFFFF',
  text: '#1A2027',
} as const

/** Tema escuro — verdes mais claros para contraste, superfícies elevadas. */
const DARK = {
  primary: '#66BB6A',
  primaryHover: '#81C784',
  secondary: '#81C784',
  bg: '#0E1014',
  paper: '#171A20',
  text: '#E6E8EB',
} as const

export type AppColorMode = 'light' | 'dark'

/**
 * Escala de sombras suaves (estilo SaaS): camadas leves de profundidade,
 * sem o "drop-shadow" duro do Material clássico.
 */
function softShadows(isDark: boolean): Shadows {
  const rgb = isDark ? '0, 0, 0' : '16, 24, 40'
  const baseA = isDark ? 0.4 : 0.06
  const stepA = isDark ? 0.012 : 0.006
  const shadows: string[] = ['none']
  for (let i = 1; i <= 24; i += 1) {
    const y1 = Math.max(1, Math.round(i * 0.5))
    const b1 = Math.round(i * 1.2 + 2)
    const y2 = Math.max(2, Math.round(i * 1.1))
    const b2 = Math.round(i * 2.4 + 6)
    const a = baseA + i * stepA
    shadows.push(
      `0px ${y1}px ${b1}px rgba(${rgb}, ${(a * 0.5).toFixed(3)}), ` +
        `0px ${y2}px ${b2}px rgba(${rgb}, ${a.toFixed(3)})`,
    )
  }
  return shadows as unknown as Shadows
}

export function createAppTheme(mode: AppColorMode) {
  const isDark = mode === 'dark'
  const c = isDark ? DARK : LIGHT

  return createTheme({
    palette: {
      mode,
      primary: {
        main: c.primary,
        light: isDark ? DARK.primaryHover : LIGHT.primaryHover,
        dark: isDark ? '#43A047' : '#14532D',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: c.secondary,
        light: isDark ? '#A5D6A7' : '#4CAF50',
        dark: isDark ? '#66BB6A' : '#1B5E20',
        contrastText: '#FFFFFF',
      },
      background: {
        default: c.bg,
        paper: c.paper,
      },
      text: {
        primary: c.text,
        secondary: isDark ? 'rgba(224, 224, 224, 0.68)' : 'rgba(33, 33, 33, 0.65)',
        disabled: isDark ? 'rgba(224, 224, 224, 0.38)' : 'rgba(33, 33, 33, 0.38)',
      },
      divider: isDark ? 'rgba(224, 224, 224, 0.12)' : 'rgba(33, 33, 33, 0.12)',
    },
    typography: {
      fontFamily: '"Ubuntu", "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 500, color: c.text },
      h2: { fontWeight: 500, color: c.text },
      h3: { fontWeight: 500, color: c.text },
      h4: { fontWeight: 500, color: c.text },
      h5: { fontWeight: 500, color: c.text },
      h6: { fontWeight: 600, color: c.text },
      body1: { color: c.text },
      body2: { color: isDark ? 'rgba(224, 224, 224, 0.85)' : 'rgba(33, 33, 33, 0.87)' },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 14 },
    shadows: softShadows(isDark),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: '"Ubuntu", "Segoe UI", system-ui, sans-serif',
            backgroundColor: c.bg,
            color: c.text,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: c.paper,
            color: c.text,
            borderBottom: `1px solid ${isDark ? 'rgba(224,224,224,0.08)' : 'rgba(0,0,0,0.08)'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition:
              'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
            '&.MuiButton-containedPrimary:hover': {
              backgroundColor: c.primaryHover,
              boxShadow: `0 8px 20px ${
                isDark ? 'rgba(0,0,0,0.45)' : 'rgba(27, 94, 32, 0.22)'
              }`,
            },
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(224,224,224,0.10)' : 'rgba(16,24,40,0.08)'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  })
}
