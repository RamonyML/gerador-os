import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import { OPERADORES_OCAS_FIBRA_OPTIONS } from './shared/operadoresListaCurta'
import { VALOR_MAO_OBRA_DROP_OPTIONS } from './shared/valorMaoObraDrop'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES'
const S_AGE = 'AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E {{onuPrimeiro}} SEM SINAL.

REMOTAMENTE VERIFIQUEI QUE {{onuPrimeiro}} ESTÁ DESCONECTADO.

QUESTIONADO, DISSE QUE A {{onuPrimeiro}} ESTÁ COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E {{clientePrimeiro}} DISSE QUE "{{motivoUpper}}".

{{valor}}

{{clientePrimeiro}} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E FARÁ O PAGAMENTO EM {{formaPag}}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA {{dataVisita}} ÀS {{horaVisita}} HRS.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO DISSE QUE: "{{motivoUpper}}", E FICOU SEM ACESSO À INTERNET. PERGUNTEI SOBRE A {{onuPrimeiro}}, E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONU APAGADA. {{valor}} {{clientePrimeiro}} AUTORIZOU VISITA E PAGARÁ EM {{formaPag}} NO ATO. VISITA AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}} HRS.{{textoOSCtoSinalAlto}}
******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TÉCNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXÃO. CASO NÃO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZAÇÃO COM {{clientePrimeiro}}. TEMPO ESTIMADO 60 MIN.

=== Texto da Agenda ===
MAN {{alarmeAgendaPrefix}} (OCASIONADO) {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}{{agendaSinalAltoSuffix}}`

const CTO_RADIOS: OsTemplateField = {
  id: 'ctoType',
  label: 'Tipo CTO',
  control: 'radio',
  section: S_DET,
  layout: { md: 4 },
  options: [
    { value: 'CTOE', label: 'CTOE' },
    { value: 'CTOI', label: 'CTOI' },
  ],
}

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    section: S_ID,
    layout: { md: 12 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'motivo',
    label: 'Motivo (trecho entre aspas)',
    control: 'text',
    section: S_DET,
    layout: { md: 12 },
  },
  {
    id: 'alarme',
    label: 'Alarme',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'LUZ VERMELHA ACESA', label: 'Luz vermelha' },
      { value: 'LUZ PON PISCANDO', label: 'Luz PON piscando' },
    ],
  },
  {
    id: 'onu',
    label: 'ONU/ONT',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'ONU', label: 'ONU' },
      { value: 'ONT', label: 'ONT' },
    ],
  },
  CTO_RADIOS,
  {
    id: 'cto',
    label: 'CTO',
    control: 'text',
    placeholder: 'Ex.: 1035-A',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'passante',
    label: 'Passante',
    control: 'text',
    section: S_DET,
    layout: { md: 8 },
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 3 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    layout: { md: 2 },
    options: [
      { value: '08:30', label: '08:30' },
      { value: '09:30', label: '09:30' },
      { value: '10:30', label: '10:30' },
      { value: '11:30', label: '11:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
    ],
  },
  {
    id: 'valor',
    label: 'Valor',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: VALOR_MAO_OBRA_DROP_OPTIONS,
  },
  {
    id: 'formaPag',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    layout: { md: 2 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_AGE,
    layout: { md: 12 },
    options: OPERADORES_OCAS_FIBRA_OPTIONS,
  },
]

export function getManutLuzVmOcasFibraPadraoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-luz-vm-ocas-fibra-padrao',
    title: 'Luz vermelha ocasionado (fibra) — padrão titular',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
