import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import { OPERADORES_MUD_PONTO_INTERNO_OPTIONS } from './shared/operadoresMudPontoInterno'
import { VALOR_MUD_PONTO_INTERNO_OPTIONS } from './shared/valorMudPontoInterno'

const S_ID = 'IDENTIFICAÇÃO'
const S_DET = 'DETALHES DA SOLICITAÇÃO'
const S_AGE = 'AGENDAMENTO'

const INDICACAO_TECNICA = `INDICAÇÃO TÉCNICA:

TÉCNICO: EFETUAR A MUDANÇA DE PONTO DOS EQUIPAMENTOS PARA O LOCAL ESPECIFICADO PELO CLIENTE, CASO SEJA POSSÍVEL REAPROVEITAR CABO DROP USANDO A SOBRA E RECONECTORIZAR. SE NÃO DER TAMANHO, SERÁ NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO PARA CONCLUIR O SERVIÇO. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DA CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. ATUALIZAR FIRMWARE DO ROTEADOR SE NECESSÁRIO. TEMPO ESTIMADO: 60 MIN.`

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) SOLICITANDO INFORMAÇÕES SOBRE MUDANÇA DE PONTO INTERNO
---
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {{sinalONUUpper}}.
---
QUESTIONADO {{clientePrimeiro}} DISSE QUE {{motivoUpper}}.

AMBIENTE ATUAL: {{ambienteAtualUpper}}
NOVO AMBIENTE: {{ambienteNovoUpper}}

{{valor}} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.
    
***********************************
    
{{clientePrimeiro}} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM {{formaPag}}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA {{dataVisita}} ÀS {{horaVisita}} HRS.

=== Texto O.S ===
{{clientePrimeiro}} SOLICITOU POR {{canal}} ({{contatoNumerico}}) MUDANÇA DE PONTO INTERNO, RETIRAR EQUIPAMENTOS DE: {{ambienteAtualUpper}}, E REINSTALAR EM: {{ambienteNovoUpper}}. MOTIVO: {{motivoUpper}}. {{valor}} CLIENTE PAGARÁ EM {{formaPag}}. AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}} HORAS.

***********************************

${INDICACAO_TECNICA}

=== Texto da Agenda ===
MAN MUD PONTO INTERNO {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}`

const HORA_OPTS: NonNullable<OsTemplateField['options']> = [
  { value: '08:30', label: '08:30' },
  { value: '09:30', label: '09:30' },
  { value: '10:30', label: '10:30' },
  { value: '11:30', label: '11:30' },
  { value: '13:30', label: '13:30' },
  { value: '14:30', label: '14:30' },
  { value: '15:30', label: '15:30' },
  { value: '16:30', label: '16:30' },
  { value: '17:30', label: '17:30' },
]

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
    layout: { md: 3 },
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
    layout: { md: 3 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM ou SEM SINAL',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'motivo',
    label: 'Motivo (após “disse que”)',
    control: 'text',
    section: S_DET,
    layout: { md: 12 },
  },
  {
    id: 'ambienteAtual',
    label: 'Ambiente atual',
    control: 'text',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'ambienteNovo',
    label: 'Novo ambiente',
    control: 'text',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'protocolo',
    label: 'Protocolo',
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
    options: HORA_OPTS,
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
    id: 'valor',
    label: 'Valor (texto explicativo)',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: VALOR_MUD_PONTO_INTERNO_OPTIONS,
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: OPERADORES_MUD_PONTO_INTERNO_OPTIONS,
  },
]

export function getManutMudPontoInternoPadraoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-mud-ponto-int-padrao',
    title: 'Mudança de ponto interno — titular presente',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
