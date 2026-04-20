import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_AGE = 'AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.


*******************

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {{sinalONUUpper}} {{oscila}}.

*******************
    
QUESTIONADO {{clientePrimeiro}} DISSE QUE ESTÁ SEM CONEXÃO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE O NOME DE SUA REDE WIFI NÃO ESTÁ APARECENDO MAIS.
    
REMOTAMENTE, VERIFIQUEI QUE ONU ESTÁ ACESA (SINAL {{sinalONUUpper}}) {{oscila}} E ROTEADOR ({{roteador}}) ESTÁ INACESSÍVEL. 
    
*******************
    
ORIENTEI {{clientePrimeiro}} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APÓS 30 SEGUNDOS. FEZ PORÉM REDE WI-FI NÃO VOLTOU A APARECER. 
    
PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
    
*******************
    
INFORMEI QUE O ROTEADOR ESTÁ RESETADO, E REPASSEI AO CLIENTE 2 OPÇÕES PARA SOLUÇÃO DO PROBLEMA.

1ª. AGENDAMENTO DE UMA VISITA TÉCNICA PARA RECONFIGURAR O ROTEADOR, NO QUAL ESSA VISITA POSSUI UM CUSTO DE R$50,00 REFERENTE O DESLOCAMENTO TÉCNICO. ESTE VALOR PODE SER PAGO NO ATO EM DINHEIRO, PIX OU CARTÃO.

2ª. TRAZER O ROTEADOR NA LOJA PARA RECONFIGURÁ-LO. ESTA OPÇÃO NÃO TERÁ CUSTOS
*******************
    
{{clientePrimeiro}} OPTOU PELA VISITA TÉCNICA, CONCORDOU COM OS TERMOS REPASSADOS E SOLICITOU PAGAR EM {{formaPag}}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA {{dataVisita}} ÀS {{horaVisita}} HRS.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E INFORMOU QUE ESTÁ SEM CONEXÃO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE SUA REDE WIFI NÃO ESTÁ APARECENDO MAIS. REMOTAMENTE, VERIFIQUEI QUE ONU ESTÁ ACESA (SINAL {{sinalONUUpper}}) {{oscila}} E ROTEADOR ({{roteador}}) ESTÁ INACESSÍVEL. ORIENTEI {{clientePrimeiro}} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APÓS 30 SEGUNDOS. FEZ PORÉM REDE WI-FI NÃO VOLTOU A APARECER. INFORMEI QUE ROTEADOR ESTÁ RESETADO, É NECESSÁRIA VISITA TÉCNICA PARA RECONFIGURÁ-LO, QUE ESTE SERVIÇO POSSUI CUSTO R$50,00. {{clientePrimeiro}} CONCORDOU E SOLICITOU PAGAR NO ATO EM {{formaPag}}. VISITA AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}} HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: ANALISAR ESTRUTURA INTERNA CONFERIR EQUIPAMENTOS SE DANIFICADOS, ANALISAR FONTE E ROTEADOR. CONFIGURAR EQUIPAMENTO, RESTABELECER CONEXÃO E REALIZAR OS DEVIDOS TESTES, FILMAR, FOTOGRAFAR E APRESENTAR A {{clientePrimeiro}}. EXPLICAR SOBRE REDE 2 E 5GHZ, E SUAS ABRANGÊNCIAS.  ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADA. TEMPO ESTIMADO 40 MIN.

=== Texto da Agenda ===
MAN ROTEADOR RESETADO {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}`

const ROTEADOR_OPTS = [
  { value: 'MULTILASER', label: 'MULTILASER' },
  { value: 'TP-LINK 840', label: 'TP-LINK 840' },
  { value: 'TP LINK C-20', label: 'TP LINK C-20' },
  { value: 'D-LINK DIR 842', label: 'D-LINK DIR 842' },
  { value: 'TP LINK C-5', label: 'TP LINK C-5' },
  { value: 'TP LINK G-5', label: 'TP LINK G-5' },
  { value: 'GREATEK', label: 'GREATEK' },
  { value: 'INTELBRAS', label: 'INTELBRAS' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ZTE H196-MESH', label: 'ZTE H196-MESH' },
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
  { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
]

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente números',
    section: S_ID,
    layout: { md: 3 },
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
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Bairro do cliente',
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
    id: 'oscila',
    label: 'Oscilação',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
    options: [
      { value: '', label: 'Selecione…' },
      { value: 'COM OSCILAÇÃO', label: 'Sim' },
      { value: 'SEM OSCILAÇÃO', label: 'Não' },
    ],
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
    options: ROTEADOR_OPTS,
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 2 },
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
      { value: 'PIX', label: 'Pix' },
      { value: 'DINHEIRO', label: 'Dinheiro' },
      { value: 'CARTÃO', label: 'Cartão' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 2 },
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: 'ANA', label: 'ANA CAROLINA' },
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'EDUARDO', label: 'EDUARDO' },
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
      { value: 'VINICIUS', label: 'VINICIUS' },
      { value: 'VITOR M.', label: 'VITOR MANOEL' },
      { value: 'VAGNER', label: 'VAGNER' },
    ],
  },
]

export function getManutRoteadorResetDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-roteador-reset',
    title: 'Manutenção — Roteador resetado',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
