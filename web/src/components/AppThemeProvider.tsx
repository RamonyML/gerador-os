import { useEffect, useMemo, type ReactNode } from 'react'
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material'
import { useColorMode } from '../contexts/ColorModeContext'
import { createAppTheme } from '../theme'

const globalStyles = (
  <GlobalStyles
    styles={{
      'html, body': { height: '100%', overflow: 'hidden', margin: 0 },
      '#root': { height: '100%' },
    }}
  />
)

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { mode } = useColorMode()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      {children}
    </ThemeProvider>
  )
}
