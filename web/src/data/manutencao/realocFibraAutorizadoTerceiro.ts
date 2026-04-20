import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import { VALOR_MAO_OBRA_DROP_OPTIONS } from './shared/valorMaoObraDrop'

const S_ID = 'IDENTIFICAÇÃO'
const S_SOL = 'DETALHES DA SOLICITAÇÃO'
const S_AGE = 'AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E SOLICITOU SUPORTE.

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {{sinalONUUpper}}.

QUESTIONADO {{clientePrimeiro}} DISSE QUE {{motivoUpper}}.

{{valor}} VALOR PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.
    
{{clientePrimeiro}} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA, PAGAMENTO SERÁ FEITO NO ATO EM {{formaPag}}, {{clientePrimeiro}} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {{autorizadoUpper}} ({{parenteUpper}}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {{dataVisita}} ÀS {{horaVisita}} HRS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) PARA SOLICITAR SUPORTE. QUESTIONADO, DISSE "{{motivoUpper}}". {{valor}} CLIENTE PAGARÁ EM {{formaPag}}. {{clientePrimeiro}} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU {{autorizadoUpper}} ({{parenteUpper}}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {{dataVisita}} ÀS {{horaVisita}} HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: VERIFICAR DROP INTERNO E EXTERNO, SE SOBRA TÉCNICA FOR SUFICIENTE, USAR PARA REPARO E RESTABELECER CONEXÃO. CASO NÃO SEJA PASSAR OUTRO DROP. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO. AO FINALIZAR ENTRAR EM CONTATO COM SUPORTE PARA CONFERIR SINAL E CONFIRMAR NORMALIZAÇÃO COM CLIENTE. TEMPO ESTIMADO 60 MIN.

=== Texto da Agenda ===
MAN REMANEJAMENTO DE FIBRA {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}`

const OP: NonNullable<OsTemplateField['options']> = [
  { value: 'ANDREZA', label: 'ANDREZA' },
  { value: 'BRUNA', label: 'BRUNA' },
  { value: 'DEIVIT', label: 'DEIVIT' },
  { value: 'EDUARDO', label: 'EDUARDO' },
  { value: 'GABRIEL M.', label: 'GABRIEL MARTINS' },
  { value: 'GABRIEL V.', label: 'GABRIEL VICTOR' },
  { value: 'HIAGO', label: 'HIAGO' },
  { value: 'IZABELA', label: 'IZABELA' },
  { value: 'KAROLAYNE', label: 'KAROLAYNE' },
  { value: 'LETÍCIA', label: 'LETICIA' },
  { value: 'LUIS', label: 'LUIS' },
  { value: 'PEDRO', label: 'PEDRO' },
  { value: 'RAMONY', label: 'RAMONY' },
  { value: 'RENATA', label: 'RENATA' },
  { value: 'VICTOR H.', label: 'VICTOR HUGO' },
  { value: 'VITOR M.', label: 'VITOR MANOEL' },
  { value: 'VAGNER', label: 'VAGNER' },
]

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Assinante (nome completo)',
    control: 'text',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'autorizado',
    label: 'Autorizado a acompanhar (nome)',
    control: 'text',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'parente',
    label: 'Grau de parentesco',
    control: 'text',
    placeholder: 'Ex.: CÔNJUGE',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 2 },
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
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'motivo',
    label: 'Motivo do remanejamento',
    control: 'text',
    section: S_SOL,
    layout: { md: 9 },
  },
  {
    id: 'protocolo',
    label: 'Protocolo',
    control: 'text',
    section: S_SOL,
    layout: { md: 3 },
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
      { value: '13:30', label: '13:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
    ],
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
    label: 'Valor',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: VALOR_MAO_OBRA_DROP_OPTIONS,
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: OP,
  },
]

export function getManutRealocFibraAutorizadoTerceiroDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-realoc-fibra-autorizado-terceiro',
    title: 'Remanejamento de fibra — titular ausente (autorizado)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
