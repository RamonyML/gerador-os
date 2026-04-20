import { useEffect, useMemo, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { useColorMode } from '../contexts/ColorModeContext'
import { createAppTheme } from '../theme'

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { mode } = useColorMode()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
