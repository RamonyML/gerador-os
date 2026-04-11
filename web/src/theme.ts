import { createTheme } from '@mui/material/styles'

/** Tema claro — verdes corporativos */
const LIGHT = {
  primary: '#1B5E20',
  primaryHover: '#2E7D32',
  secondary: '#2E7D32',
  bg: '#FFFFFF',
  paper: '#FFFFFF',
  text: '#212121',
} as const

/** Tema escuro — verdes mais claros para contraste */
const DARK = {
  primary: '#66BB6A',
  primaryHover: '#81C784',
  secondary: '#81C784',
  bg: '#121212',
  paper: '#1E1E1E',
  text: '#E0E0E0',
} as const

export type AppColorMode = 'light' | 'dark'

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
    shape: { borderRadius: 10 },
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
        styleOverrides: {
          root: {
            '&.MuiButton-containedPrimary:hover': {
              backgroundColor: c.primaryHover,
            },
          },
        },
      },
    },
  })
}
