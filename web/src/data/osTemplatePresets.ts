import { getAltplanRemotoDefaults } from './altplan/remoto'
import { getAltplanPresencialDefaults } from './altplan/presencial'
import { getAltplanSemTrocaVisitaIsentaDefaults } from './altplan/semTrocaVisitaIsenta'
import { getAltplanSemTrocaVisitaPagaDefaults } from './altplan/semTrocaVisitaPaga'
import { getAltplanTrocaVisitaIsentaDefaults } from './altplan/trocaVisitaIsenta'
import { getAltplanTrocaVisitaPagaDefaults } from './altplan/trocaVisitaPaga'
import { getManutLuzVermelhaDefaults } from './manutencao/luzVermelha'
import { getManutLuzVermelhaPjDefaults } from './manutencao/luzVermelhaPj'
import { getManutFibraExternaDefaults } from './manutencao/fibraExterna'
import { getManutOcasConectorDefaults } from './manutencao/ocasConector'
import { getManutOcasFibraDefaults } from './manutencao/ocasFibra'
import { getManutLuzVermelhaIsentoDefaults } from './manutencao/luzVermelhaIsento'
import { getManutSinalAltoDefaults } from './manutencao/sinalAlto'
import { getManutRealocFibraDefaults } from './manutencao/realocFibra'
import { getManutMudPontoIntDefaults } from './manutencao/mudPontoInterno'
import { getManutVisitaTestesDefaults } from './manutencao/visitaTestes'
import { getManutFonteQueimadaDefaults } from './manutencao/fonteQueimada'
import { getManutRoteadorQueimadoDefaults } from './manutencao/roteadorQueimado'
import { getManutOntQueimadaDefaults } from './manutencao/ontQueimada'
import { getManutOnuQueimadaDefaults } from './manutencao/onuQueimada'
import { getManutRoteadorResetDefaults } from './manutencao/roteadorReset'
import { getMidiaRokuPadraoDefaults } from './midiaTv/rokuPadrao'
import { getMidiaRokuPresencialDefaults } from './midiaTv/rokuPresencial'
import { getAlteraSenhaDefaults } from './senhaRede/alteraSenha'
import { getTermoRespPadraoDefaults } from './termoDocs/termoRespPadrao'
import { getMudEndPadraoDefaults } from './mudEnd/padrao'
import { getMudEndComFibraDefaults } from './mudEnd/comFibra'
import { getMudEndEquipamentosDefaults } from './mudEnd/equipamentos'
import { getMudEndAltplanPropostaDefaults } from './mudEnd/altplanProposta'
import { getMudEndAltplanPagoDefaults } from './mudEnd/altplanPago'
import { getMudEndInviabilidadeDefaults } from './mudEnd/inviabilidade'
import type { OsOperatorGuidance, OsTemplateField } from '../types/osTemplate'

/** Retorno comum para definir um fluxo de O.S em código. */
export type OsTemplatePresetPayload = {
  slug: string
  title: string
  outputTemplate: string
  demandCategory: string
  fields: OsTemplateField[]
  /** Orientação opcional ao operador (collapse acima do formulário). */
  operatorGuidance?: OsOperatorGuidance
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
  {
    id: 'manut-luz-vermelha-pj',
    category: 'Manutenção',
    label: 'Luz vermelha — pessoa jurídica',
    getDefaults: getManutLuzVermelhaPjDefaults,
  },
  {
    id: 'manut-luz-vermelha-isento',
    category: 'Manutenção',
    label: 'Luz vermelha — isento (7 dias)',
    getDefaults: getManutLuzVermelhaIsentoDefaults,
  },
  {
    id: 'manut-fibra-externa',
    category: 'Manutenção',
    label: 'Fibra óptica externa — rompimento externo',
    getDefaults: getManutFibraExternaDefaults,
  },
  {
    id: 'manut-ocas-conector',
    category: 'Manutenção',
    label: 'Dano ocasionado — conector (interno)',
    getDefaults: getManutOcasConectorDefaults,
  },
  {
    id: 'manut-ocas-fibra',
    category: 'Manutenção',
    label: 'Dano ocasionado — fibra (externa)',
    getDefaults: getManutOcasFibraDefaults,
  },
  {
    id: 'manut-sinal-alto',
    category: 'Manutenção',
    label: 'Sinal alto',
    getDefaults: getManutSinalAltoDefaults,
  },
  {
    id: 'manut-realoc-fibra',
    category: 'Manutenção',
    label: 'Remanejamento de fibra',
    getDefaults: getManutRealocFibraDefaults,
  },
  {
    id: 'manut-mud-ponto-int',
    category: 'Manutenção',
    label: 'Mudança de ponto interno',
    getDefaults: getManutMudPontoIntDefaults,
  },
  {
    id: 'manut-visita-testes',
    category: 'Manutenção',
    label: 'Visita de Testes',
    getDefaults: getManutVisitaTestesDefaults,
  },
  {
    id: 'manut-fonte-queimada',
    category: 'Manutenção',
    label: 'Fonte queimada',
    getDefaults: getManutFonteQueimadaDefaults,
  },
  {
    id: 'manut-roteador-queimado',
    category: 'Manutenção',
    label: 'Roteador queimado',
    getDefaults: getManutRoteadorQueimadoDefaults,
  },
  {
    id: 'manut-ont-queimada',
    category: 'Manutenção',
    label: 'ONT queimada',
    getDefaults: getManutOntQueimadaDefaults,
  },
  {
    id: 'manut-onu-queimada',
    category: 'Manutenção',
    label: 'ONU queimada',
    getDefaults: getManutOnuQueimadaDefaults,
  },
  {
    id: 'manut-roteador-reset',
    category: 'Manutenção',
    label: 'Roteador resetado',
    getDefaults: getManutRoteadorResetDefaults,
  },
  {
    id: 'midia-roku-padrao',
    category: 'Conversores / TV',
    label: 'Compra Roku TV — padrão',
    getDefaults: getMidiaRokuPadraoDefaults,
  },
  {
    id: 'midia-roku-presencial',
    category: 'Conversores / TV',
    label: 'Compra Roku TV — presencial',
    getDefaults: getMidiaRokuPresencialDefaults,
  },
  {
    id: 'senha-altera-senha',
    category: 'Senha / SSID Wi-Fi',
    label: 'Alteração de SSID / Senha',
    getDefaults: getAlteraSenhaDefaults,
  },
  {
    id: 'termo-resp-padrao',
    category: 'Termos e documentos',
    label: 'Termo de responsabilidade — padrão',
    getDefaults: getTermoRespPadraoDefaults,
  },
]

export function presetCategories(): string[] {
  const s = new Set(OS_TEMPLATE_PRESETS.map((p) => p.category))
  return Array.from(s)
}
