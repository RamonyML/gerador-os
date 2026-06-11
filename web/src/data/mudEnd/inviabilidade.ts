import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

/**
 * MUD END — INVIABILIDADE (sem viabilidade técnica de fibra).
 * Fluxo curto: gera apenas o Texto Protocolo. Tema em tons de VERMELHO.
 * Origem (3 variações):
 *  - index-mud-end-inviab.html ... PF, solicitado pelo assinante (titular)
 *  - inviab1.html ................ PF, solicitado por terceiro
 *  - inviab-pj.html ............. PJ (terceiro/representante)
 */

const SEP = '*'.repeat(15)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_END = 'NOVO ENDEREÇO DO CLIENTE'

export const I_TITULAR = 'inviab-titular'
export const I_TERCEIRO = 'inviab-terceiro'
export const I_PJ = 'inviab-pj'

const ONU_ONT_OPTIONS = [
  { value: 'ONU DATA', label: 'ONU DATA' },
  { value: 'ONU ZTE', label: 'ONU ZTE' },
  { value: 'ONU TENDA', label: 'ONU TENDA' },
  { value: 'ONU SHORELINE', label: 'ONU SHORELINE' },
  { value: 'ONU FIBERHOME', label: 'ONU FIBERHOME' },
  { value: 'ONT ONT TP LINK 220', label: 'ONT TP LINK 220' },
  { value: 'ONT ONT TP LINK 230', label: 'ONT TP LINK 230' },
  { value: 'ONT ONT ZTE AZUL', label: 'ONT ZTE (azul)' },
  { value: 'ONT ONT ZTE VERDE', label: 'ONT ZTE (verde)' },
]

export const MUD_END_INVIAB_OUTPUT = ['=== Texto Protocolo ===', '{{mudEndTextoProtocolo}}'].join(
  '\n',
)

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildMudEndInviabilidadeTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || I_TITULAR
  const cliente = upper(v.cliente)
  const c0 = first(cliente)
  const solicitante = upper(v.solicitante)
  const s0 = first(solicitante)
  const parente = upper(v.parente)
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const adress = upper(v.adress)
  const complemento = upper(v.complemento)
  const bairro = upper(v.bairro)
  const num = digits(v.num)
  const quandoMud = upper(v.quandoMud)
  const equipPrefix = upper(v.onuOnt).startsWith('ONT') ? 'ONT' : 'ONU'
  const sinalSaida = formatSinalFibraSaida(v.sinalONU)
  const canal = v.canal ?? ''

  const ehTerceiro = tipo === I_TERCEIRO || tipo === I_PJ
  const proto0 = ehTerceiro ? s0 : c0

  const header =
    tipo === I_PJ
      ? `${s0} (${parente}) ENTROU EM CONTATO POR ${canal} (${contatoSol})`
      : tipo === I_TERCEIRO
        ? `${s0} (${parente} DE ${c0}) ENTROU EM CONTATO POR ${canal} (${contatoSol})`
        : `${c0} ENTROU EM CONTATO POR ${canal} (${contato})`

  const mudouFrase = ehTerceiro ? 'VAI SE MUDAR E' : v.mudou ?? ''

  const cancelamento = ehTerceiro
    ? `${cliente} (ASSINANTE) DEVE SOLICITAR O CANCELAMENTO DO SERVIÇO`
    : 'O ASSINANTE DEVE SOLICITAR O CANCELAMENTO DO SERVIÇO'

  const protocolo = `${header} E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinalSaida}.

${SEP}

QUESTIONADO, ${proto0} DISSE QUE ${mudouFrase} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}

${quandoMud}

${SEP}

INFORMEI À ${proto0} QUE NÃO POSSUÍMOS VIABILIDADE TÉCNICA PARA INSTALAÇÃO DE FIBRA ÓPTICA NO ENDEREÇO SOLICITADO. CONFORME CONSTA NO CONTRATO, EM SITUAÇÕES ONDE NÃO É POSSÍVEL ATENDER O CLIENTE COM O SERVIÇO DE FIBRA ÓPTICA, O ASSINANTE DEVE PROSSEGUIR COM A MUDANÇA PARA OUTRO ENDEREÇO VIÁVEL (SEJA PARA SI PRÓPRIO OU ALGUM PARENTE), CIENTE DE QUE AS RESPONSABILIDADES PELO CONTRATO E EQUIPAMENTOS PERMANECEM COM O ASSINANTE. CASO A MUDANÇA NÃO SEJA POSSÍVEL, ${cancelamento}. REFORÇAMOS QUE A COBERTURA DE FIBRA NÃO É GARANTIDA EM TODA A ÁREA URBANA DE UBERLÂNDIA, VIDE CONTRATO.

O ATENDIMENTO (${canal}) FOI DIRECIONADO AO SETOR FINANCEIRO PARA TRATATIVAS.`

  return { mudEndTextoProtocolo: protocolo }
}

export const MUD_END_INVIAB_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    tone: 'red',
    defaultValue: I_TITULAR,
    options: [
      { value: I_TITULAR, label: 'Pessoa física — solicitado pelo assinante', icon: 'user-round' },
      { value: I_TERCEIRO, label: 'Pessoa física — solicitado por terceiro', icon: 'users-round' },
      { value: I_PJ, label: 'Pessoa jurídica', icon: 'users-round' },
    ],
    layout: { md: 12 },
  },
  {
    id: 'cliente',
    label: 'Nome do titular (assinante)',
    control: 'text',
    placeholder: 'Nome completo do titular da conexão',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: I_TITULAR },
    layout: { md: 3 },
  },
  {
    id: 'solicitante',
    label: 'Solicitante',
    control: 'text',
    placeholder: 'Nome completo do solicitante',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: [I_TERCEIRO, I_PJ] },
    layout: { md: 6 },
  },
  {
    id: 'parente',
    label: 'Parentesco / vínculo',
    control: 'text',
    placeholder: 'Ex.: Mãe, Irmão, Representante...',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: [I_TERCEIRO, I_PJ] },
    layout: { md: 3 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: [I_TERCEIRO, I_PJ] },
    layout: { md: 3 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
    layout: { md: 3 },
  },
  { id: 'sinalONU', label: 'Sinal da fibra', control: 'signal', placeholder: 'Ex.: 12.34 (sai -12.34DBM)', section: S_ID, layout: { md: 3 } },
  { id: 'onuOnt', label: 'ONU/ONT', control: 'select', section: S_ID, options: ONU_ONT_OPTIONS, layout: { md: 3 } },
  { id: 'cep', label: 'CEP', control: 'text', placeholder: 'Insira o CEP da rua', section: S_END, layout: { md: 3 } },
  { id: 'adress', label: 'Logradouro', control: 'text', placeholder: 'Preenchido pelo CEP', section: S_END, layout: { md: 7 } },
  { id: 'num', label: 'Nº', control: 'text', placeholder: 'Número', section: S_END, layout: { md: 2 } },
  { id: 'bairro', label: 'Bairro', control: 'text', placeholder: 'Preenchido pelo CEP', section: S_END, layout: { md: 5 } },
  { id: 'complemento', label: 'Complemento (cond. bl, ap)', control: 'text', section: S_END, layout: { md: 4 } },
  { id: 'quandoMud', label: 'Quando / observação da mudança', control: 'text', placeholder: 'Cliente informou que vai mudar na próxima semana.', section: S_END, layout: { md: 12 } },
  {
    id: 'mudou',
    label: 'Situação da mudança',
    control: 'radio',
    defaultValue: 'AINDA NÃO SE MUDOU, PORÉM',
    section: S_END,
    showWhen: { field: 'tipoSolicitacao', equals: I_TITULAR },
    options: [
      { value: 'MUDOU DE RESIDÊNCIA E', label: 'Cliente já se mudou' },
      { value: 'AINDA NÃO SE MUDOU, PORÉM', label: 'Cliente ainda vai se mudar' },
    ],
    layout: { md: 12 },
  },
]

export function getMudEndInviabilidadeDefaults() {
  return {
    slug: 'mud-end-inviabilidade',
    title: 'Mudança de endereço — inviabilidade',
    outputTemplate: MUD_END_INVIAB_OUTPUT,
    demandCategory: 'mudanca-endereco',
    fields: MUD_END_INVIAB_FIELDS.map((f) => ({ ...f })),
  }
}
