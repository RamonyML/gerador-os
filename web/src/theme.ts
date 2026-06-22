import { createTheme } from '@mui/material/styles'
import type { Shadows } from '@mui/material/styles'
import type { ColorMode } from './contexts/ColorModeContext'

/** Dia — verdes corporativos sobre canvas suave (estética SaaS). */
const LIGHT = {
  primary: '#3CAE63',
  primaryHover: '#52BE78',
  secondary: '#2A9452',
  bg: '#F4F6F8',
  paper: '#FFFFFF',
  text: '#1A2027',
} as const

/** Noite — verdes mais claros para contraste, superfícies elevadas. */
const DARK = {
  primary: '#66BB6A',
  primaryHover: '#81C784',
  secondary: '#81C784',
  bg: '#0E1014',
  paper: '#171A20',
  text: '#E6E8EB',
} as const

/**
 * Gelo — fundo branco-gelo, texto quase-preto levemente azulado.
 * Primário em slate-blue neutro, zero verde.
 */
const GELO = {
  primary: '#5B7BA8',
  primaryHover: '#7095BE',
  secondary: '#7A94B4',
  bg: '#F0F2F5',
  paper: '#FAFBFC',
  text: '#1D2533',
} as const

/**
 * Cinza (tema "Dark") — superfícies escuras em cinza puro,
 * texto branco, acento neutro grafite-claro. Zero verde.
 */
const CINZA = {
  primary: '#9EADC0',
  primaryHover: '#B4C2D1',
  secondary: '#7F8FA0',
  bg: '#080A0C',
  paper: '#0F1114',
  text: '#F2F4F6',
} as const

export type AppColorMode = ColorMode

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
  const muiMode = mode === 'dark' || mode === 'cinza' ? 'dark' : 'light'
  const isDark = muiMode === 'dark'

  const c =
    mode === 'gelo'  ? GELO  :
    mode === 'cinza' ? CINZA :
    mode === 'dark'  ? DARK  :
    LIGHT

  return createTheme({
    palette: {
      mode: muiMode,
      primary: {
        main: c.primary,
        light: c.primaryHover,
        dark: mode === 'gelo'  ? '#4A6A97' :
              mode === 'cinza' ? '#8090A0' :
              isDark           ? '#43A047' : '#2A9452',
        contrastText: mode === 'cinza' ? '#0E1012' : '#FFFFFF',
      },
      secondary: {
        main: c.secondary,
        light: mode === 'gelo'  ? '#9AAFC8' :
               mode === 'cinza' ? '#9AAFC8' :
               isDark           ? '#A5D6A7' : '#4CAF50',
        dark: mode === 'gelo'   ? '#3A5A80' :
              mode === 'cinza'  ? '#5C6878' :
              isDark            ? '#66BB6A' : '#1B5E20',
        contrastText: '#FFFFFF',
      },
      /* Nos temas sem verde, success e info viram tons neutros */
      ...(mode === 'gelo' ? {
        success: {
          main: '#4A8FA4',
          light: '#6BAABB',
          dark: '#346D80',
          contrastText: '#FFFFFF',
        },
        info: {
          main: '#5B7BA8',
          light: '#7095BE',
          dark: '#3F5F8A',
          contrastText: '#FFFFFF',
        },
      } : mode === 'cinza' ? {
        success: {
          main: '#7A8FA0',
          light: '#96A8B8',
          dark: '#5C6F7E',
          contrastText: '#FFFFFF',
        },
        info: {
          main: '#7A8FA0',
          light: '#96A8B8',
          dark: '#5C6F7E',
          contrastText: '#FFFFFF',
        },
      } : {}),
      background: {
        default: c.bg,
        paper: c.paper,
      },
      text: {
        primary: c.text,
        secondary:
          mode === 'gelo'  ? 'rgba(29, 37, 51, 0.60)'   :
          mode === 'cinza' ? 'rgba(242, 244, 246, 0.62)' :
          isDark           ? 'rgba(224, 224, 224, 0.68)' :
                             'rgba(33, 33, 33, 0.65)',
        disabled:
          mode === 'gelo'  ? 'rgba(29, 37, 51, 0.36)'   :
          mode === 'cinza' ? 'rgba(242, 244, 246, 0.36)' :
          isDark           ? 'rgba(224, 224, 224, 0.38)' :
                             'rgba(33, 33, 33, 0.38)',
      },
      divider:
        mode === 'gelo'  ? 'rgba(91, 123, 168, 0.12)'  :
        mode === 'cinza' ? 'rgba(158, 173, 192, 0.12)' :
        isDark           ? 'rgba(224, 224, 224, 0.12)'  :
                           'rgba(33, 33, 33, 0.12)',
    },
    typography: {
      fontFamily:
        'var(--app-font, "Google Sans Flex", "Ubuntu", "Segoe UI", system-ui, sans-serif)',
      h1: { fontWeight: 500, color: c.text },
      h2: { fontWeight: 500, color: c.text },
      h3: { fontWeight: 500, color: c.text },
      h4: { fontWeight: 500, color: c.text },
      h5: { fontWeight: 500, color: c.text },
      h6: { fontWeight: 600, color: c.text },
      body1: { color: c.text },
      body2: {
        color:
          mode === 'gelo'  ? 'rgba(29, 37, 51, 0.82)'   :
          mode === 'cinza' ? 'rgba(242, 244, 246, 0.88)' :
          isDark           ? 'rgba(224, 224, 224, 0.85)'  :
                             'rgba(33, 33, 33, 0.87)',
      },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 14 },
    shadows: softShadows(isDark),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily:
              'var(--app-font, "Google Sans Flex", "Ubuntu", "Segoe UI", system-ui, sans-serif)',
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
            borderBottom: `1px solid ${
              mode === 'gelo'  ? 'rgba(91, 123, 168, 0.14)'  :
              mode === 'cinza' ? 'rgba(158, 173, 192, 0.10)' :
              isDark           ? 'rgba(224,224,224,0.08)'      :
                                 'rgba(0,0,0,0.08)'
            }`,
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
              boxShadow:
                mode === 'gelo'  ? `0 8px 20px rgba(91,123,168,0.30)`    :
                mode === 'cinza' ? `0 8px 20px rgba(0,0,0,0.50)`          :
                isDark           ? `0 8px 20px rgba(0,0,0,0.45)`           :
                                   `0 8px 20px rgba(60,174,99,0.28)`,
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
            border: `1px solid ${
              mode === 'gelo'  ? 'rgba(91, 123, 168, 0.14)'  :
              mode === 'cinza' ? 'rgba(158, 173, 192, 0.10)' :
              isDark           ? 'rgba(224,224,224,0.10)'      :
                                 'rgba(16,24,40,0.08)'
            }`,
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
