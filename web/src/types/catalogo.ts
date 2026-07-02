export type CatalogoCategoria =
  | 'planos-altplan'
  | 'planos-extend'
  | 'planos-mudend'
  | 'equipamentos'
  | 'formas-pag'
  | 'canais'
  | 'parentesco'

export type PlanGrupo = 'atual' | 'ofertado'

/** Categorias que usam sub-grupos (plano atual / plano ofertado). */
export const PLAN_CATEGORIAS = new Set<CatalogoCategoria>([
  'planos-altplan',
  'planos-extend',
  'planos-mudend',
])

export interface CatalogoItem {
  id: string
  label: string
  value: string
  ativo: boolean
  ordem: number
  /** Usado nas categorias de planos: 'atual' | 'ofertado'. */
  grupo?: PlanGrupo
}

export interface CatalogoItemDraft {
  label: string
  value: string
  ativo: boolean
  ordem: number
  grupo?: PlanGrupo
}

export const CATALOGO_CATEGORIAS: Record<
  CatalogoCategoria,
  { titulo: string; hint: string }
> = {
  'planos-altplan': {
    titulo: 'Planos — Altplan',
    hint: 'Planos usados nos formulários de Alteração de Plano. Sub-grupos: Plano Atual e Plano Ofertado.',
  },
  'planos-extend': {
    titulo: 'Planos — Wi-Fi Extend',
    hint: 'Planos usados nos formulários de Wi-Fi Extend. Sub-grupos: Plano Atual e Plano Ofertado.',
  },
  'planos-mudend': {
    titulo: 'Planos — Mud End + Alt Plano',
    hint: 'Planos usados nos formulários de Mudança de Endereço + Alteração de Plano. Sub-grupos: Plano Atual e Plano Ofertado.',
  },
  'equipamentos': {
    titulo: 'Equipamentos / Roteadores',
    hint: 'Roteadores e ONTs disponíveis no estoque. Rótulo e valor geralmente iguais.',
  },
  'formas-pag': {
    titulo: 'Formas de Pagamento',
    hint: 'Opções de pagamento usadas nos formulários. Rótulo e valor geralmente iguais.',
  },
  'canais': {
    titulo: 'Canais de Contato',
    hint: 'Rótulo = exibido no select (ex.: Telefone). Valor = inserido no texto (ex.: LIGAÇÃO).',
  },
  'parentesco': {
    titulo: 'Grau de Parentesco',
    hint: 'Sugestões de vínculo/parentesco para autocomplete. Rótulo e valor iguais.',
  },
}
