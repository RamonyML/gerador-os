import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES E AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.

*******************
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E SINAL {{onuPrimeiro}} {{sinalONUUpper}} {{oscilaUpper}}.
    
*******************
    
QUESTIONADO {{clientePrimeiro}} DISSE QUE ESTÁ SOFRENDO DESCONEXÕES REPETIDAS EM SUA REDE, ALEGA QUE OS DISPOSITIVOS ESTÃO CONECTADOS COM MENSAGEM DE CONECTADO SEM INTERNET OU APRESENTAM EXTREMA LENTIDÃO. 
    
VERIFIQUEI REMOTAMENTE {{onuPrimeiro}} ESTÁ COM SINAL ALTO FORA DO PADRÃO. REGISTRO DE ULTIMA MANUTENÇÃO ERA {{sinalONUAnUpper}} , SINAL ATUAL {{sinalONUUpper}} {{oscilaUpper}}. 
    
*******************
    
ORIENTEI {{clientePrimeiro}} A DESCONECTAR EQUIPAMENTOS ({{onu}}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. 
    
PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
    
*******************
    
INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERÁ COBRADO O VALOR REFERENTE AOS MESMOS.
    
*******************
    
{{clientePrimeiro}} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E CASO HAJA CUSTOS PAGARÁ EM {{formaPag}}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA {{dataVisita}} ÀS {{horaVisita}} HRS.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO VIA {{canal}} ({{contatoNumerico}}) E DISSE QUE ESTÁ COM DESCONEXÕES REPETIDAS, QUESTIONADO(A) DISSE QUE "TODOS APARELHOS DE SUA RESIDÊNCIA PERDEM CONEXÃO COM A INTERNET REPETIDAS VEZES DURANTE O DIA (FICA CONECTADO AO WIFI E SEM INTERNET)". REMOTAMENTE VERIFIQUEI QUE CONSTAM VÁRIAS DESCONEXÕES, ONU ACESA COM SINAL ALTO FORA DO PADRÃO ({{sinalONUUpper}} {{oscilaUpper}}), FOI INSTALADO COM {{sinalONUAnUpper}}. ORIENTEI CLIENTE A DESCONECTAR AS FONTES DE ENERGIA DOS EQUIPAMENTOS ({{onu}}) E RECONECTA-LOS APÓS 30 SEGUNDOS, FEITO PORÉM CONEXÃO E SINAL NÃO NORMALIZOU. PERGUNTEI {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI A {{clientePrimeiro}} QUE É NECESSÁRIO VISITA TÉCNICA, QUE HAVENDO PROBLEMAS DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO) COBRA-SE VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS DANIFICADOS. {{clientePrimeiro}} DISSE ESTÁ CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SERÁ PAGO NO ATO EM {{formaPag}}. VISITA AGENDADA PARA DIA {{dataVisita}} ÀS {{horaVisita}} HRS.{{textoOSCtoSinalAlto}}
******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE É DE OBRIGAÇÃO DO PROVEDOR, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZAÇÃO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APÓS RESTITUIR INTERNET, DAR EXPLICAÇÕES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO TIVER PADRÃO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 60 MIN.

=== Texto da Agenda ===
MAN SINAL ALTO {{clienteUpper}} PROT:{{protocoloUpper}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}{{agendaSinalAltoSuffix}}`

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
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
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU atual',
    control: 'text',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'sinalONUan',
    label: 'Sinal na última manutenção',
    control: 'text',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'oscila',
    label: 'Oscilação',
    control: 'text',
    placeholder: 'COM OSCILAÇÃO / SEM OSCILAÇÃO',
    section: S_DET,
    layout: { md: 4 },
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
    label: 'CTO (CTOE)',
    control: 'text',
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
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
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
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    section: S_DET,
    layout: { md: 3 },
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
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_DET,
    layout: { md: 12 },
    options: [
      { value: 'ANA', label: 'ANA CAROLINA' },
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'EDUARDO', label: 'EDUARDO' },
      { value: 'GABRIEL M.', label: 'GABRIEL MARTINS' },
      { value: 'HIAGO', label: 'HIAGO' },
      { value: 'KAROLAYNE', label: 'KAROLAYNE' },
      { value: 'LUIS', label: 'LUIS' },
      { value: 'PEDRO', label: 'PEDRO' },
      { value: 'RAMONY', label: 'RAMONY' },
      { value: 'VICTOR H.', label: 'VICTOR HUGO' },
      { value: 'VAGNER', label: 'VAGNER' },
    ],
  },
]

export function getManutSinalAltoPadraoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-sinal-alto-padrao',
    title: 'Manutenção — Sinal alto (padrão)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
