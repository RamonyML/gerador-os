import { getAltplanRemotoPadraoExampleDefaults } from './altplanRemotoPadraoExample'
import { getAltplanRemotoTerceirosExampleDefaults } from './altplanRemotoTerceirosExample'
import { getManutFonteQueimadaComVisitaDefaults } from './manutencao/fonteQueimadaComVisita'
import { getManutFonteQueimadaLojaDefaults } from './manutencao/fonteQueimadaLoja'
import { getManutLentidaoIsentoDefaults } from './manutencao/lentidaoIsento'
import { getManutLuzVmOcasFibra1Defaults } from './manutencao/luzVmOcasFibra1'
import { getManutLuzVmOcasFibra2Defaults } from './manutencao/luzVmOcasFibra2'
import { getManutLuzVmOcasFibra3Defaults } from './manutencao/luzVmOcasFibra3'
import { getManutLuzVmOcasFibraPadraoDefaults } from './manutencao/luzVmOcasFibraPadrao'
import { getManutMudPontoInternoAssinantePresenteDefaults } from './manutencao/mudPontoInternoAssinantePresente'
import { getManutMudPontoInternoAutorizadoDefaults } from './manutencao/mudPontoInternoAutorizado'
import { getManutMudPontoInternoPadraoDefaults } from './manutencao/mudPontoInternoPadrao'
import { getManutMudPontoInternoPjDefaults } from './manutencao/mudPontoInternoPj'
import { getManutMudPontoInternoTerceiroAutorizaDefaults } from './manutencao/mudPontoInternoTerceiroAutoriza'
import { getManutMonitoramentoClienteSemSinalDefaults } from './manutencao/monitoramentoClienteSemSinal'
import { getManutOntQueimadaDefaults } from './manutencao/ontQueimada'
import { getManutRealocFibraAssinantePresenteDefaults } from './manutencao/realocFibraAssinantePresente'
import { getManutRealocFibraAutorizadoTerceiroDefaults } from './manutencao/realocFibraAutorizadoTerceiro'
import { getManutRealocFibraPjDefaults } from './manutencao/realocFibraPj'
import { getManutRealocFibraTerceiroComAutorizacaoDefaults } from './manutencao/realocFibraTerceiroComAutorizacao'
import { getManutRealocFibraTitularDefaults } from './manutencao/realocFibraTitular'
import { getManutOnuQueimadaDefaults } from './manutencao/onuQueimada'
import { getManutRoteadorResetDefaults } from './manutencao/roteadorReset'
import { getManutRoteadorResetLojaDefaults } from './manutencao/roteadorResetLoja'
import { getManutSinalAltoPadraoDefaults } from './manutencao/sinalAltoPadrao'
import { getManutVisitaInstrutivaDefaults } from './manutencao/visitaInstrutiva'
import { getMudEndExampleDefaults } from './mudEndExample'
import type { OsTemplateField } from '../types/osTemplate'

/** Retorno comum para preencher o formulário do admin (novo documento). */
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
 * Atalhos para publicar modelos no Firestore (código-fonte), não confundir com
 * os documentos já salvos na coleção `osTemplates`.
 * Novos exemplos: adicione uma entrada aqui — a UI usa um único select.
 *
 * Para fluxos tipo manutenção/suporte: use três marcadores explícitos — `=== Texto Protocolo ===`,
 * `=== Texto O.S ===` e `=== Texto da Agenda ===` (linhas só com `=` no corpo do texto não viram abas).
 */
export const OS_TEMPLATE_PRESETS: OsTemplatePreset[] = [
  {
    id: 'mud-end-protocolo',
    category: 'Mudança de endereço',
    label: 'MUD END — protocolo (HTML legado)',
    getDefaults: getMudEndExampleDefaults,
  },
  {
    id: 'altplan-padrao-remoto',
    category: 'Alteração de plano',
    label: 'Alt plan — remoto (padrão, titular)',
    getDefaults: getAltplanRemotoPadraoExampleDefaults,
  },
  {
    id: 'altplan-remoto-terceiros',
    category: 'Alteração de plano',
    label: 'Alt plan — remoto (terceiros)',
    getDefaults: getAltplanRemotoTerceirosExampleDefaults,
  },
  {
    id: 'manut-monitoramento-cliente-sem-sinal',
    category: 'Manutenção (legado)',
    label: 'Monitoramento — cliente sem sinal',
    getDefaults: getManutMonitoramentoClienteSemSinalDefaults,
  },
  {
    id: 'manut-roteador-reset',
    category: 'Manutenção (legado)',
    label: 'Roteador resetado',
    getDefaults: getManutRoteadorResetDefaults,
  },
  {
    id: 'manut-fonte-queimada-com-visita',
    category: 'Manutenção (legado)',
    label: 'Fonte queimada (com visita)',
    getDefaults: getManutFonteQueimadaComVisitaDefaults,
  },
  {
    id: 'manut-visita-instrutiva',
    category: 'Manutenção (legado)',
    label: 'Visita instrutiva (drop / CTO)',
    getDefaults: getManutVisitaInstrutivaDefaults,
  },
  {
    id: 'manut-fonte-queimada-loja',
    category: 'Manutenção (legado)',
    label: 'Fonte queimada (retirada na loja)',
    getDefaults: getManutFonteQueimadaLojaDefaults,
  },
  {
    id: 'manut-roteador-reset-loja',
    category: 'Manutenção (legado)',
    label: 'Roteador resetado (presencial na loja)',
    getDefaults: getManutRoteadorResetLojaDefaults,
  },
  {
    id: 'manut-onu-queimada',
    category: 'Manutenção (legado)',
    label: 'ONU queimada',
    getDefaults: getManutOnuQueimadaDefaults,
  },
  {
    id: 'manut-ont-queimada',
    category: 'Manutenção (legado)',
    label: 'ONT queimada',
    getDefaults: getManutOntQueimadaDefaults,
  },
  {
    id: 'manut-lentidao-isento',
    category: 'Manutenção (legado)',
    label: 'Lentidão (visita isenta)',
    getDefaults: getManutLentidaoIsentoDefaults,
  },
  {
    id: 'manut-sinal-alto-padrao',
    category: 'Manutenção (legado)',
    label: 'Sinal alto (padrão)',
    getDefaults: getManutSinalAltoPadraoDefaults,
  },
  {
    id: 'manut-realoc-fibra-titular',
    category: 'Manutenção (legado)',
    label: 'Remanejamento fibra — titular presente',
    getDefaults: getManutRealocFibraTitularDefaults,
  },
  {
    id: 'manut-realoc-fibra-autorizado-terceiro',
    category: 'Manutenção (legado)',
    label: 'Remanejamento fibra — titular ausente (autorizado)',
    getDefaults: getManutRealocFibraAutorizadoTerceiroDefaults,
  },
  {
    id: 'manut-realoc-fibra-terceiro-com-autorizacao',
    category: 'Manutenção (legado)',
    label: 'Remanejamento fibra — terceiro (assinante autoriza)',
    getDefaults: getManutRealocFibraTerceiroComAutorizacaoDefaults,
  },
  {
    id: 'manut-realoc-fibra-assinante-presente',
    category: 'Manutenção (legado)',
    label: 'Remanejamento fibra — terceiro (assinante presente)',
    getDefaults: getManutRealocFibraAssinantePresenteDefaults,
  },
  {
    id: 'manut-realoc-fibra-pj',
    category: 'Manutenção (legado)',
    label: 'Remanejamento fibra — PJ',
    getDefaults: getManutRealocFibraPjDefaults,
  },
  {
    id: 'manut-luz-vm-ocas-fibra-padrao',
    category: 'Manutenção (legado)',
    label: 'LV ocasionado fibra — titular',
    getDefaults: getManutLuzVmOcasFibraPadraoDefaults,
  },
  {
    id: 'manut-luz-vm-ocas-fibra-1',
    category: 'Manutenção (legado)',
    label: 'LV ocasionado fibra — terceiro (1)',
    getDefaults: getManutLuzVmOcasFibra1Defaults,
  },
  {
    id: 'manut-luz-vm-ocas-fibra-2',
    category: 'Manutenção (legado)',
    label: 'LV ocasionado fibra — terceiro (2)',
    getDefaults: getManutLuzVmOcasFibra2Defaults,
  },
  {
    id: 'manut-luz-vm-ocas-fibra-3',
    category: 'Manutenção (legado)',
    label: 'LV ocasionado fibra — titular ausente',
    getDefaults: getManutLuzVmOcasFibra3Defaults,
  },
  {
    id: 'manut-mud-ponto-int-padrao',
    category: 'Manutenção (legado)',
    label: 'Mud ponto interno — titular presente',
    getDefaults: getManutMudPontoInternoPadraoDefaults,
  },
  {
    id: 'manut-mud-ponto-int-pj',
    category: 'Manutenção (legado)',
    label: 'Mud ponto interno — PJ',
    getDefaults: getManutMudPontoInternoPjDefaults,
  },
  {
    id: 'manut-mud-ponto-int-autorizado',
    category: 'Manutenção (legado)',
    label: 'Mud ponto interno — titular ausente (autorizado)',
    getDefaults: getManutMudPontoInternoAutorizadoDefaults,
  },
  {
    id: 'manut-mud-ponto-int-terceiro-autoriza',
    category: 'Manutenção (legado)',
    label: 'Mud ponto interno — terceiro (assinante autoriza)',
    getDefaults: getManutMudPontoInternoTerceiroAutorizaDefaults,
  },
  {
    id: 'manut-mud-ponto-int-assinante-presente',
    category: 'Manutenção (legado)',
    label: 'Mud ponto interno — terceiro (assinante presente)',
    getDefaults: getManutMudPontoInternoAssinantePresenteDefaults,
  },
]

export function presetCategories(): string[] {
  const s = new Set(OS_TEMPLATE_PRESETS.map((p) => p.category))
  return Array.from(s)
}
