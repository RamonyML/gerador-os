import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Alteração de SSID / Senha do Wi-Fi.
 * Fluxo curto: gera APENAS o Texto Protocolo (sem O.S, sem Agenda).
 *
 * Paridade caractere-a-caractere com:
 *   legado-exemplo/suporte/altera-senha/altera-senha.html
 *
 * Observações do legado:
 *  - `cliente`, `sinalONU` e `solicitacao` saem em CAIXA ALTA.
 *  - `atualSSID`, `novoSSID`, `atualSenha`, `novaSenha` saem EXATAMENTE como
 *    digitados (sem uppercase) — senha/SSID são case-sensitive.
 *  - O bloco SSID/SENHA é CONDICIONADO pela solicitação (melhoria pedida pela
 *    operação): `SSID` mostra só as linhas de SSID; `SENHA` só as de senha;
 *    `SSID E SENHA` mostra ambas (idêntico ao legado, que sempre imprimia as 4).
 *  - Não há operador no texto.
 */

const SEP = '*'.repeat(23)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_REG = 'REGISTRO DA ALTERAÇÃO'

const SOL_SENHA = 'SENHA'
const SOL_SSID = 'SSID'
const SOL_AMBOS = 'SSID E SENHA'

export const ALTERA_SENHA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{alteraSenhaTextoProtocolo}}',
].join('\n')

function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function buildAlteraSenhaTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const cliente = upper(v.cliente)
  const cp = first(cliente)
  const canal = v.canal
  const contato = digits(v.contato)
  const sinalONU = upper(v.sinalONU)
  const solicitacao = upper(v.solicitacao)
  // SSID e senha são case-sensitive: preservar exatamente o que foi digitado.
  const atualSSID = v.atualSSID
  const novoSSID = v.novoSSID
  const atualSenha = v.atualSenha
  const novaSenha = v.novaSenha

  const showSsid = solicitacao === SOL_SSID || solicitacao === SOL_AMBOS
  const showSenha = solicitacao === SOL_SENHA || solicitacao === SOL_AMBOS

  const lines: string[] = [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU A ALTERAÇÃO DA ${solicitacao} DO WI-FI.`,
    '',
    SEP,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU ${sinalONU} SEM OSCILAÇÃO.`,
    '',
    SEP,
    '',
    `QUESTIONADO ${cp} DESEJA ALTERAR A ${solicitacao} DE SUA REDE WI-FI POR MOTIVO PESSOAL.`,
    '    ',
  ]

  if (showSsid) {
    lines.push(`SSID ATUAL: ${atualSSID}`, `SSID NOVA: ${novoSSID}`)
  }
  // Linha em branco entre os blocos só quando ambos aparecem (como no legado).
  if (showSsid && showSenha) {
    lines.push('')
  }
  if (showSenha) {
    lines.push(`SENHA ATUAL: ${atualSenha}`, `SENHA NOVA: ${novaSenha}`)
  }

  lines.push('', '    ', `${solicitacao} ALTERADA COM SUCESSO E ${cp} CONFIRMOU CONEXÃO.`)

  const protocolo = lines.join('\n')

  return { alteraSenhaTextoProtocolo: protocolo }
}

export const ALTERA_SENHA_FIELDS: OsTemplateField[] = [
  {
    id: 'cpf',
    label: 'CPF / CNPJ',
    control: 'text',
    placeholder: 'Somente números',
    section: S_ID,
    layout: { md: 5 },
  },
  {
    id: 'cliente',
    label: 'Nome Completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 7 },
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
    placeholder: 'Somente os números',
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
    id: 'solicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    section: S_REG,
    highlight: true,
    layout: { md: 12 },
    options: [
      { value: SOL_SENHA, label: 'Senha' },
      { value: SOL_SSID, label: 'SSID (nome da rede)' },
      { value: SOL_AMBOS, label: 'SSID e Senha' },
    ],
  },
  {
    id: 'atualSSID',
    label: 'SSID atual',
    control: 'text',
    placeholder: 'Insira o nome atual da rede',
    section: S_REG,
    layout: { md: 6 },
    showWhen: { field: 'solicitacao', equals: [SOL_SSID, SOL_AMBOS] },
  },
  {
    id: 'novoSSID',
    label: 'SSID nova',
    control: 'text',
    placeholder: 'Insira o novo nome da rede',
    section: S_REG,
    layout: { md: 6 },
    showWhen: { field: 'solicitacao', equals: [SOL_SSID, SOL_AMBOS] },
  },
  {
    id: 'atualSenha',
    label: 'Senha atual',
    control: 'text',
    placeholder: 'Insira a senha atual da rede',
    section: S_REG,
    layout: { md: 6 },
    showWhen: { field: 'solicitacao', equals: [SOL_SENHA, SOL_AMBOS] },
  },
  {
    id: 'novaSenha',
    label: 'Senha nova',
    control: 'text',
    placeholder: 'Insira a nova senha da rede',
    section: S_REG,
    layout: { md: 6 },
    showWhen: { field: 'solicitacao', equals: [SOL_SENHA, SOL_AMBOS] },
  },
]

export function buildAlteraSenhaSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const cp = first(upper(v.cliente))
  const canal = v.canal
  const contato = digits(v.contato)
  const sinalONU = upper(v.sinalONU)
  const solicitacao = upper(v.solicitacao)
  const atualSSID = v.atualSSID
  const novoSSID = v.novoSSID
  const atualSenha = v.atualSenha
  const novaSenha = v.novaSenha

  const showSsid = solicitacao === SOL_SSID || solicitacao === SOL_AMBOS
  const showSenha = solicitacao === SOL_SENHA || solicitacao === SOL_AMBOS

  const info = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E SOLICITOU A ALTERACAO DA ${solicitacao} DO WI-FI.`

  const onu = `CLIENTE SEM BLOQUEIO, SEM REDUCAO, E ONU ${sinalONU} SEM OSCILACAO.`

  const registroLines: string[] = [
    `QUESTIONADO ${cp} DESEJA ALTERAR A ${solicitacao} DE SUA REDE WI-FI POR MOTIVO PESSOAL.`,
    '    ',
  ]
  if (showSsid) {
    registroLines.push(`SSID ATUAL: ${atualSSID}`, `SSID NOVA: ${novoSSID}`)
  }
  if (showSsid && showSenha) {
    registroLines.push('')
  }
  if (showSenha) {
    registroLines.push(`SENHA ATUAL: ${atualSenha}`, `SENHA NOVA: ${novaSenha}`)
  }
  registroLines.push('', '    ', `${solicitacao} ALTERADA COM SUCESSO E ${cp} CONFIRMOU CONEXAO.`)

  return {
    info,
    comentarios: [onu, registroLines.join('\n')],
  }
}

export function getAlteraSenhaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'senha-altera-senha',
    title: 'Alteração de SSID / Senha',
    demandCategory: 'senha-rede',
    outputTemplate: ALTERA_SENHA_OUTPUT,
    fields: ALTERA_SENHA_FIELDS.map((f) => ({ ...f })),
  }
}
