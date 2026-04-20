import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'

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
    
{{clientePrimeiro}} OPTOU POR TRAZER O ROTEADOR NA LOJA EM {{dataLigacaoData}} ÀS {{dataLigacaoHora}}.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E INFORMOU QUE ESTÁ SEM CONEXÃO DE INTERNET EM TODOS OS DISPOSITIVOS DA CASA E QUE SUA REDE WIFI NÃO ESTÁ APARECENDO MAIS. REMOTAMENTE, VERIFIQUEI QUE ONU ESTÁ ACESA (SINAL {{sinalONUUpper}}) {{oscila}} E ROTEADOR ({{roteador}}) ESTÁ INACESSÍVEL. ORIENTEI {{clientePrimeiro}} A DESCONECTAR AS FONTES DE ENERGIA DA ONU E ROTEADOR DA TOMADA E RECONECTA-LAS APÓS 30 SEGUNDOS. FEZ PORÉM REDE WI-FI NÃO VOLTOU A APARECER. INFORMEI QUE ROTEADOR ESTÁ RESETADO; CLIENTE OPTOU POR TRAZER O EQUIPAMENTO À LOJA PARA RECONFIGURAÇÃO SEM CUSTO (DESLOCAMENTO). COMPARECIMENTO PREVISTO: {{dataLigacaoData}} ÀS {{dataLigacaoHora}}.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO (LOJA): RECONFIGURAR ROTEADOR, TESTAR COM CLIENTE OU ORIENTAR SOBRE ENTREGA. CONFERIR FONTE E CABOS SE O CLIENTE LEVAR. REGISTRAR ATENDIMENTO E PROTOCOLO.

=== Texto da Agenda ===
MAN ROTEADOR LOJA {{clienteUpper}} — {{dataLigacaoData}} {{dataLigacaoHora}} — {{bairroUpper}}`

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
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM ou SEM SINAL',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'oscila',
    label: 'Oscilação',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
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
    layout: { md: 4 },
    options: ROTEADOR_OPTS,
  },
  {
    id: 'dataLigacao',
    label: 'Quando o cliente virá à loja',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_ID,
    layout: { md: 8 },
  },
]

export function getManutRoteadorResetLojaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-roteador-reset-loja',
    title: 'Manutenção — Roteador resetado (presencial na loja)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
