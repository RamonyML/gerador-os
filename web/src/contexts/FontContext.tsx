import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'gerador-os:appFont'

export type AppFont = 'google-sans-flex' | 'cantarell' | 'ubuntu' | 'poppins'

/** Pilha de fontes (com fallbacks) aplicada à variável CSS `--app-font`. */
export const FONT_STACKS: Record<AppFont, string> = {
  'google-sans-flex':
    "'Google Sans Flex', 'Ubuntu', 'Segoe UI', system-ui, sans-serif",
  cantarell: "'Cantarell', 'Ubuntu', 'Segoe UI', system-ui, sans-serif",
  ubuntu: "'Ubuntu', 'Segoe UI', system-ui, sans-serif",
  poppins: "'Poppins', 'Ubuntu', 'Segoe UI', system-ui, sans-serif",
}

type FontOption = { value: AppFont; label: string; description: string }

export const APP_FONTS: FontOption[] = [
  {
    value: 'google-sans-flex',
    label: 'Google Sans Flex',
    description: 'Fonte padrão do sistema.',
  },
  {
    value: 'cantarell',
    label: 'Cantarell',
    description: 'Humanista, leve e arredondada.',
  },
  {
    value: 'ubuntu',
    label: 'Ubuntu Linux',
    description: 'Clássica do projeto.',
  },
  {
    value: 'poppins',
    label: 'Poppins (antigo Gerador de O.S)',
    description: 'Geométrica, usada na versão anterior.',
  },
]

type FontContextValue = {
  font: AppFont
  setFont: (f: AppFont) => void
}

const FontContext = createContext<FontContextValue | null>(null)

function isFont(v: unknown): v is AppFont {
  return (
    v === 'google-sans-flex' ||
    v === 'cantarell' ||
    v === 'ubuntu' ||
    v === 'poppins'
  )
}

function readStored(): AppFont {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (isFont(s)) return s
  } catch {
    /* ignore */
  }
  return 'google-sans-flex'
}

function applyFont(font: AppFont) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--app-font', FONT_STACKS[font])
}

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<AppFont>(() =>
    typeof window !== 'undefined' ? readStored() : 'google-sans-flex',
  )

  useEffect(() => {
    applyFont(font)
    try {
      localStorage.setItem(STORAGE_KEY, font)
    } catch {
      /* ignore */
    }
  }, [font])

  const setFont = useCallback((f: AppFont) => {
    setFontState(f)
  }, [])

  const value = useMemo(() => ({ font, setFont }), [font, setFont])

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>
}

export function useAppFont() {
  const ctx = useContext(FontContext)
  if (!ctx) throw new Error('useAppFont deve ser usado dentro de FontProvider')
  return ctx
}
