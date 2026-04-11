import { createTheme } from '@mui/material/styles'

/** Verde institucional — tema claro */
export const GREEN_LIGHT = '#06402B'
/** Verde destaque — tema escuro */
export const GREEN_DARK = '#3F795E'

export type AppColorMode = 'light' | 'dark'

export function createAppTheme(mode: AppColorMode) {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? GREEN_DARK : GREEN_LIGHT },
      secondary: { main: isDark ? '#5c9a7e' : '#0a5c3a' },
      background: isDark
        ? { default: '#1e2120', paper: '#2a2e2c' }
        : { default: '#ffffff', paper: '#fafcfb' },
    },
    typography: {
      fontFamily: '"Ubuntu", "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 500 },
      h2: { fontWeight: 500 },
      h3: { fontWeight: 500 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: '"Ubuntu", "Segoe UI", system-ui, sans-serif',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}
