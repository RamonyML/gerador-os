import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'gerador-os:sidebarTexture'

export type SidebarTexture =
  | 'circuito'
  | 'ondas'
  | 'bolhas'
  | 'pontos'
  | 'hexagonos'
  | 'malha'
  | 'nenhuma'

type TextureOption = { value: SidebarTexture; label: string; description: string }

/**
 * Texturas exibidas atualmente no seletor (perfil). As demais permanecem no
 * código (ver `ARCHIVED_SIDEBAR_TEXTURES`) e continuam funcionando se já estiverem
 * salvas, mas não aparecem na escolha por enquanto.
 */
export const SIDEBAR_TEXTURES: TextureOption[] = [
  { value: 'nenhuma', label: 'Nenhuma', description: 'Menu liso, sem textura.' },
  { value: 'circuito', label: 'Circuitos', description: 'Traços e nós estilo placa de circuito.' },
  { value: 'malha', label: 'Mesh', description: 'Treliça isométrica de cubos.' },
]

/**
 * Texturas "arquivadas": prontas no código, mas fora do seletor por ora.
 * Para reativar alguma, basta movê-la de volta para `SIDEBAR_TEXTURES`.
 */
export const ARCHIVED_SIDEBAR_TEXTURES: TextureOption[] = [
  { value: 'ondas', label: 'Ondas', description: 'Faixas suaves e onduladas.' },
  { value: 'bolhas', label: 'Bolhas', description: 'Cápsulas arredondadas nos cantos.' },
  { value: 'pontos', label: 'Pontos', description: 'Grade pontilhada discreta.' },
  { value: 'hexagonos', label: 'Hexágonos', description: 'Conexões geométricas sutis.' },
]

type SidebarTextureContextValue = {
  texture: SidebarTexture
  setTexture: (t: SidebarTexture) => void
}

const SidebarTextureContext = createContext<SidebarTextureContextValue | null>(null)

function isTexture(v: unknown): v is SidebarTexture {
  return (
    v === 'circuito' ||
    v === 'ondas' ||
    v === 'bolhas' ||
    v === 'pontos' ||
    v === 'hexagonos' ||
    v === 'malha' ||
    v === 'nenhuma'
  )
}

function readStored(): SidebarTexture {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (isTexture(s)) return s
  } catch {
    /* ignore */
  }
  return 'nenhuma'
}

export function SidebarTextureProvider({ children }: { children: ReactNode }) {
  const [texture, setTextureState] = useState<SidebarTexture>(() =>
    typeof window !== 'undefined' ? readStored() : 'nenhuma',
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, texture)
    } catch {
      /* ignore */
    }
  }, [texture])

  const setTexture = useCallback((t: SidebarTexture) => {
    setTextureState(t)
  }, [])

  const value = useMemo(() => ({ texture, setTexture }), [texture, setTexture])

  return (
    <SidebarTextureContext.Provider value={value}>
      {children}
    </SidebarTextureContext.Provider>
  )
}

export function useSidebarTexture() {
  const ctx = useContext(SidebarTextureContext)
  if (!ctx)
    throw new Error('useSidebarTexture deve ser usado dentro de SidebarTextureProvider')
  return ctx
}
