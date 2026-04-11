import type { OsTemplateField } from '../types/osTemplate'

/**
 * Texto base do protocolo (equivalente a `textoProtocolo` do index-mud-end.html),
 * com placeholders {{id}}. Ajuste fino pode ser feito no editor de Modelos.
 */
export const MUD_END_OUTPUT_TEMPLATE = `{{cliente}} ENTROU EM CONTATO POR {{canal}} ({{contato}}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

===================================

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {{sinalONU}}.

===================================

QUESTIONADO, {{cliente}} DISSE QUE {{mudou}} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: {{adress}}, {{num}}
COMPLEMENTO: {{complemento}}
CEP: {{cep}}
BAIRRO: {{bairro}}
{{quandoMud}}

===================================

INFORMEI A {{cliente}} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

{{levouEquip}}{{esqueceuEquip}}

{{cliente}} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO {{formaPag}}.

MUDANÇA AGENDADA PARA DIA {{dataVisita}} {{horaVisita}} HRS.

===================================

>>> Este deve ser o ultimo comentário <<<

COMPROVANTE DE ENDEREÇO ({{comprovante}}{{tipoComp}}) EM ANEXO
NOME NO COMPROVANTE: {{nomeComprov}} ({{grauComp}})`

const LEVOU_SIM =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. QUESTIONEI O CLIENTE E O MESMO DISSE QUE JÁ LEVOU OS EQUIPAMENTOS AO NOVO ENDEREÇO.\n\n'
const LEVOU_NAO =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. INFORMEI AO CLIENTE QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA). CLIENTE CONFIRMOU QUE LEVARÁ POSTERIORMENTE.\n\n'

const ESQUECEU_SIM =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO AINDA ESTAVA ATIVA (COM IP). QUESTIONANDO, CLIENTE DISSE QUE ESQUECEU OS EQUIPAMENTOS NO ANTIGO ENDEREÇO. INFORMEI AO CLIENTE QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA). CLIENTE CONFIRMOU QUE LEVARÁ ATÉ O DIA DA MUDANÇA.\n\n'
const ESQUECEU_NAO =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO AINDA ESTAVA ATIVA (COM IP). QUESTIONEI O CLIENTE E O MESMO DISSE QUE VAI BUSCAR OS EQUIPAMENTOS ATÉ O DIA DA MUDANÇA.\n\n'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_END = 'NOVO ENDEREÇO DO CLIENTE'
const S_AGE = 'AGENDAMENTO'

/**
 * Campos alinhados ao fluxo legado (protocolo).
 * Seções e ordem espelham index-mud-end.html; `layout.md` em grid 12 colunas.
 */
export const MUD_END_FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Cliente (use o primeiro nome se quiser igual ao HTML antigo)',
    control: 'text',
    placeholder: 'Nome',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'canal',
    label: 'Canal de contato',
    control: 'text',
    placeholder: 'WhatsApp, telefone…',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'contato',
    label: 'Telefone / contato',
    control: 'text',
    placeholder: 'Somente números ou como registrar',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: 'Ex.: BOM, FRACO',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'mudou',
    label: 'Situação da mudança',
    control: 'radio',
    section: S_END,
    options: [
      { value: 'MUDOU DE RESIDÊNCIA E', label: 'Cliente já se mudou' },
      { value: 'AINDA NÃO SE MUDOU, PORÉM', label: 'Cliente ainda vai se mudar' },
    ],
    layout: { md: 12 },
  },
  { id: 'cep', label: 'CEP', control: 'text', section: S_END, layout: { md: 2 } },
  {
    id: 'adress',
    label: 'Endereço novo (logradouro)',
    control: 'text',
    section: S_END,
    layout: { md: 4 },
  },
  { id: 'num', label: 'Número', control: 'text', section: S_END, layout: { md: 2 } },
  { id: 'bairro', label: 'Bairro', control: 'text', section: S_END, layout: { md: 4 } },
  {
    id: 'complemento',
    label: 'Complemento',
    control: 'text',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'quandoMud',
    label: 'Quando / observação da mudança',
    control: 'textarea',
    section: S_END,
    placeholder: 'Ex.: Cliente informou que vai mudar na próxima semana.',
    layout: { md: 9 },
  },
  {
    id: 'levouEquip',
    label: 'Conexão sem IP — equipamentos (texto do protocolo)',
    control: 'radio',
    section: S_END,
    options: [
      { value: LEVOU_SIM, label: 'Sim — equipamentos já no novo endereço' },
      { value: LEVOU_NAO, label: 'Não — cliente levará depois' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'esqueceuEquip',
    label: 'Conexão com IP — equipamentos (texto do protocolo)',
    control: 'radio',
    section: S_END,
    options: [
      { value: ESQUECEU_SIM, label: 'Sim — esqueceu no endereço antigo' },
      { value: ESQUECEU_NAO, label: 'Não — buscará até o dia da mudança' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'comprovante',
    label: 'Tipo de comprovante',
    control: 'select',
    section: S_END,
    options: [
      { value: 'CEMIG', label: 'CEMIG' },
      { value: 'DMAE', label: 'DMAE' },
      { value: 'CONTRATO DE LOCAÇÃO', label: 'Contrato de locação' },
      { value: 'CONTRATO DE HABITAÇÃO', label: 'Contrato de habitação' },
      { value: 'OUTROS', label: 'Outros (preencha “tipo” abaixo)' },
    ],
    layout: { md: 2 },
  },
  {
    id: 'tipoComp',
    label: 'Tipo do comprovante (se “Outros”)',
    control: 'text',
    section: S_END,
    placeholder: 'Só se necessário',
    layout: { md: 3 },
  },
  {
    id: 'nomeComprov',
    label: 'Nome no comprovante',
    control: 'text',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'grauComp',
    label: 'Grau (assinante, terceiro, etc.)',
    control: 'text',
    section: S_END,
    layout: { md: 4 },
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'date',
    section: S_AGE,
    placeholder: 'dd/mm/aaaa',
    layout: { md: 4 },
  },
  {
    id: 'horaVisita',
    label: 'Horário da visita',
    control: 'select',
    section: S_AGE,
    options: [
      { value: 'ÀS 08:00', label: '08:00' },
      { value: 'ÀS 08:30', label: '08:30' },
      { value: 'ÀS 10:00', label: '10:00' },
      { value: 'ÀS 10:30', label: '10:30' },
      { value: 'ÀS 13:00', label: '13:00' },
      { value: 'ÀS 13:30', label: '13:30' },
      { value: 'ÀS 15:00', label: '15:00' },
      { value: 'ÀS 15:30', label: '15:30' },
      { value: 'ÀS 17:00', label: '17:00 (somente com autorização)' },
      { value: 'APÓS ÀS 11:00', label: 'Após 11:00 (sábados)' },
    ],
    layout: { md: 4 },
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento da taxa',
    control: 'select',
    section: S_AGE,
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'Dinheiro' },
      { value: 'CARTAO', label: 'Cartão' },
    ],
    layout: { md: 4 },
  },
]

export function getMudEndExampleDefaults() {
  return {
    slug: 'mud-end-protocolo',
    title: 'MUD END — protocolo (exemplo HTML)',
    outputTemplate: MUD_END_OUTPUT_TEMPLATE,
    demandCategory: 'mudanca-endereco',
    fields: MUD_END_FIELDS.map((f) => ({ ...f })),
  }
}
