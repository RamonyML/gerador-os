import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES E AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.

*******************

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E {{onuPrimeiro}} SEM SINAL.

*******************

QUESTIONADO, DISSE DISSE QUE "{{motivoUpper}}".
PERGUNTEI SOBRE {{onu}} E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA ACESA.

REMOTAMENTE VERIFIQUEI QUE {{onuPrimeiro}} ESTÁ DESCONECTADO/APAGADA. 
ORIENTEI {{clientePrimeiro}} A DESCONECTAR EQUIPAMENTOS ({{onu}}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 

PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO.

*******************

INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. {{clientePrimeiro}} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS.
    
*******************
    
{{clientePrimeiro}} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM {{formaPag}}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {{dataVisita}} ÀS {{horaVisita}}HRS.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E DISSE QUE "{{motivoUpper}}", E FICOU SEM CONEXÃO COM A INTERNET. PERGUNTEI SOBRE {{onu}} E CLIENTE DISSE QUE ESTÁ COM LUZ VERMELHA PISCANDO. PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE SERÁ NECESSÁRIO VISITA TÉCNICA E CASO SEJA NECESSÁRIO A TROCA DO CABO DROP, IRÍAMOS TROCAR DO POSTE ATÉ OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NÃO OCASIONADO PELO CLIENTE A MANUTENÇÃO NÃO TEM CUSTO. {{clientePrimeiro}} TAMBÉM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. {{clientePrimeiro}} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM {{formaPag}}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA {{dataVisita}} ÀS {{horaVisita}}HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.{{textoOSCtoInstrutiva}}

=== Texto da Agenda ===
MAN {{alarmeAgendaPrefix}} {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}`

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome do cliente',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
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
    placeholder: 'Somente números',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'motivo',
    label: 'Resumo do ocorrido (entre aspas no legado)',
    control: 'text',
    placeholder: 'Texto após “disse que:”',
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
  {
    id: 'ctoType',
    label: 'Tipo CTO',
    control: 'radio',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'CTOE', label: 'CTOE' },
      { value: 'CTOI', label: 'CTOI' },
    ],
  },
  {
    id: 'cto',
    label: 'CTO (ex.: 1035-A) — só CTOE',
    control: 'text',
    placeholder: 'Ex.: 1035-A',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'passante',
    label: 'Localização do passante',
    control: 'text',
    placeholder: 'Ex.: passante no poste…',
    section: S_DET,
    layout: { md: 8 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Bairro',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
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
    label: 'Forma de pagamento',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_DET,
    layout: { md: 12 },
    options: [
      { value: 'ANA', label: 'ANA CAROLINA' },
      { value: 'CARLOS', label: 'CARLOS' },
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'EUNICE', label: 'EUNICE' },
      { value: 'GABRIEL M.', label: 'GABRIEL MARTINS' },
      { value: 'GABRIEL V.', label: 'GABRIEL VICTOR' },
      { value: 'HIAGO', label: 'HIAGO' },
      { value: 'KAROLAYNE', label: 'KAROLAYNE' },
      { value: 'LUIS', label: 'LUIS' },
      { value: 'PEDRO', label: 'PEDRO' },
      { value: 'PRISCILA', label: 'PRISCILA' },
      { value: 'RAMONY', label: 'RAMONY' },
      { value: 'VICTOR H.', label: 'VICTOR HUGO' },
      { value: 'VITOR M.', label: 'VITOR MANOEL' },
      { value: 'VAGNER', label: 'VAGNER' },
    ],
  },
]

export function getManutVisitaInstrutivaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-visita-instrutiva',
    title: 'Manutenção — Visita instrutiva (drop / CTO)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
