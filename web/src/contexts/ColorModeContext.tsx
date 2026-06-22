import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'gerador-os-color-mode'

export type ColorMode = 'light' | 'dark' | 'gelo' | 'cinza'

/** Verdadeiro para os modos que usam superfícies escuras. */
export function isDarkMode(mode: ColorMode): boolean {
  return mode === 'dark' || mode === 'cinza'
}

type ColorModeContextValue = {
  mode: ColorMode
  isDark: boolean
  setMode: (m: ColorMode) => void
  /** @deprecated use setMode — mantido para evitar quebras pontuais */
  toggle: () => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

function readStoredMode(): ColorMode {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === 'dark' || s === 'light' || s === 'gelo' || s === 'cinza') return s
  } catch {
    /* ignore */
  }
  return 'light'
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() =>
    typeof window !== 'undefined' ? readStoredMode() : 'light',
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  const setMode = useCallback((m: ColorMode) => {
    setModeState(m)
  }, [])

  const toggle = useCallback(() => {
    setModeState((m) => (isDarkMode(m) ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ mode, isDark: isDarkMode(mode), toggle, setMode }),
    [mode, toggle, setMode],
  )

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext)
  if (!ctx)
    throw new Error('useColorMode deve ser usado dentro de ColorModeProvider')
  return ctx
}
