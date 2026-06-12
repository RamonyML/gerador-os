import { getAltplanRemotoDefaults } from './altplan/remoto'
import { getAltplanPresencialDefaults } from './altplan/presencial'
import { getAltplanSemTrocaVisitaIsentaDefaults } from './altplan/semTrocaVisitaIsenta'
import { getAltplanSemTrocaVisitaPagaDefaults } from './altplan/semTrocaVisitaPaga'
import { getAltplanTrocaVisitaIsentaDefaults } from './altplan/trocaVisitaIsenta'
import { getAltplanTrocaVisitaPagaDefaults } from './altplan/trocaVisitaPaga'
import { getManutLuzVermelhaDefaults } from './manutencao/luzVermelha'
import { getMudEndPadraoDefaults } from './mudEnd/padrao'
import { getMudEndComFibraDefaults } from './mudEnd/comFibra'
import { getMudEndEquipamentosDefaults } from './mudEnd/equipamentos'
import { getMudEndAltplanPropostaDefaults } from './mudEnd/altplanProposta'
import { getMudEndAltplanPagoDefaults } from './mudEnd/altplanPago'
import { getMudEndInviabilidadeDefaults } from './mudEnd/inviabilidade'
import type { OsTemplateField } from '../types/osTemplate'

/** Retorno comum para definir um fluxo de O.S em código. */
export type OsTemplatePresetPayload = {
  slug: string
  title: string
  outputTemplate: string
  demandCategory: string
  fields: OsTemplateField[]
}

export type OsTemplatePreset = {
  id: string
  category: string
  label: string
  getDefaults: () => OsTemplatePresetPayload
}

/**
 * Catálogo de fluxos de O.S em código (fonte única via osTemplateRegistry.ts).
 * Novos fluxos: adicione um módulo em data/ e registre uma entrada aqui.
 *
 * Para fluxos tipo manutenção/suporte: use três marcadores explícitos — `=== Texto Protocolo ===`,
 * `=== Texto O.S ===` e `=== Texto da Agenda ===` (linhas só com `=` no corpo do texto não viram abas).
 */
export const OS_TEMPLATE_PRESETS: OsTemplatePreset[] = [
  {
    id: 'mud-end-padrao',
    category: 'Mudança de endereço',
    label: 'Mudança de endereço — padrão',
    getDefaults: getMudEndPadraoDefaults,
  },
  {
    id: 'mud-end-com-fibra',
    category: 'Mudança de endereço',
    label: 'Mudança de endereço — com fibra existente',
    getDefaults: getMudEndComFibraDefaults,
  },
  {
    id: 'mud-end-buscar-equipamentos',
    category: 'Mudança de endereço',
    label: 'Mudança de endereço — buscar equipamentos',
    getDefaults: getMudEndEquipamentosDefaults,
  },
  {
    id: 'mud-end-altplan-proposta',
    category: 'Mudança de endereço',
    label: 'Mudança de endereço — alt plano proposta',
    getDefaults: getMudEndAltplanPropostaDefaults,
  },
  {
    id: 'mud-end-altplan-pago',
    category: 'Mudança de endereço',
    label: 'Mudança de endereço — alt plano pago',
    getDefaults: getMudEndAltplanPagoDefaults,
  },
  {
    id: 'mud-end-inviabilidade',
    category: 'Mudança de endereço',
    label: 'Mudança de endereço — inviabilidade',
    getDefaults: getMudEndInviabilidadeDefaults,
  },
  {
    id: 'altplan-remoto',
    category: 'Alteração de plano',
    label: 'Alteração de plano — remoto',
    getDefaults: getAltplanRemotoDefaults,
  },
  {
    id: 'altplan-presencial',
    category: 'Alteração de plano',
    label: 'Alteração de plano — presencial',
    getDefaults: getAltplanPresencialDefaults,
  },
  {
    id: 'altplan-sem-troca-visita-isenta',
    category: 'Alteração de plano',
    label: 'Alteração de plano — sem troca visita isenta',
    getDefaults: getAltplanSemTrocaVisitaIsentaDefaults,
  },
  {
    id: 'altplan-sem-troca-visita-paga',
    category: 'Alteração de plano',
    label: 'Alteração de plano — sem troca visita paga',
    getDefaults: getAltplanSemTrocaVisitaPagaDefaults,
  },
  {
    id: 'altplan-troca-visita-isenta',
    category: 'Alteração de plano',
    label: 'Alteração de plano — com troca visita isenta',
    getDefaults: getAltplanTrocaVisitaIsentaDefaults,
  },
  {
    id: 'altplan-troca-visita-paga',
    category: 'Alteração de plano',
    label: 'Alteração de plano — com troca visita paga',
    getDefaults: getAltplanTrocaVisitaPagaDefaults,
  },
  {
    id: 'manut-luz-vermelha',
    category: 'Manutenção',
    label: 'Luz vermelha — padrão',
    getDefaults: getManutLuzVermelhaDefaults,
  },
]

export function presetCategories(): string[] {
  const s = new Set(OS_TEMPLATE_PRESETS.map((p) => p.category))
  return Array.from(s)
}
