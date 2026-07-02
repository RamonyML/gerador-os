import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { subscribeCatalogo } from '../lib/catalogoFirestore'
import type { CatalogoCategoria, CatalogoItem } from '../types/catalogo'

interface CatalogoState {
  status: 'loading' | 'ready' | 'error'
  items: CatalogoItem[]
}

export function useCatalogo(categoria: CatalogoCategoria): CatalogoState {
  const [state, setState] = useState<CatalogoState>({ status: 'loading', items: [] })

  useEffect(() => {
    setState({ status: 'loading', items: [] })
    return subscribeCatalogo(
      db,
      categoria,
      (items) => setState({ status: 'ready', items }),
      () => setState((s) => ({ ...s, status: 'error' })),
    )
  }, [categoria])

  return state
}
