import type { OsTemplateField } from '../../types/osTemplate'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'
import {
  AST,
  L_CIENTE,
  L_HEAD2,
  L_O1,
  L_O2,
  L_PROC,
  ALTPLAN_PLANO_ATUAL_OPTS,
  ALTPLAN_PLANO_ESCOLHIDO_OPTS,
  ALTPLAN_ROTEADOR_OPTS,
} from './remoto'

/**
 * ALTERAÇÃO DE PLANO — PRESENCIAL (cliente comparece à loja).
 *
 * Paridade caractere-a-caractere com:
 *  - titular  → legado-exemplo/suporte/altplan/altplan-remoto/presencial/index-altplan-remoto-presencial.html
 *  - terceiro → legado-exemplo/suporte/altplan/altplan-remoto/pres-terceiro1/altplan-remoto-pres-terc.html
 *
 * Sem encerramento (apenas Protocolo + O.S).
 */

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_PLANO = 'DETALHES DO PLANO'

export const P_TITULAR = 'titular'
export const P_TERCEIRO = 'terceiro'

export const ALTPLAN_PRESENCIAL_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{altplanPresencialTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{altplanPresencialTextoOS}}',
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

function splitDataHora(value: unknown): [string, string] {
  const partes = String(value ?? '').trim().split(/\s+/)
  return [partes[0] ?? '', partes[1] ?? '']
}

function sinalSaida(rawValues: Record<string, unknown>): string {
  const sig = formatSinalFibraSaida(String(rawValues.sinalONU ?? ''))
  const semSinal = String(rawValues.semSinal ?? '') === 'sim'
  return semSinal || !sig ? 'SEM SINAL' : sig
}

export function buildAltplanPresencialTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || P_TITULAR
  const cliente = upper(v.cliente)
  const clientePrimeiro = first(cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(solicitante)
  const parente = upper(v.parente)
  const canal = v.canal ?? ''
  const contato = digits(v.contato)
  const motivo = upper(v.motivo)
  const planoAtual = v.planoAtual ?? ''
  const planoEscolhido = v.planoEscolhido ?? ''
  const roteador = v.roteador ?? ''
  const dataContrato = v.dataContrato ?? ''
  const protocolo = v.protocolo ?? ''
  const sig = sinalSaida(rawValues)
  const [dataLigacao, horaLigacao] = splitDataHora(v.dataLigacao)
  const [dataProtocolo, horaProtocolo] = splitDataHora(v.dataProtocolo)
  const [dataAtendimento, horaAtendimento] = splitDataHora(v.dataAtendimento)

  const planoBloco = [
    `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${roteador}`,
    '',
    `PLANO SOLICITADO: ${planoEscolhido}`,
  ]

  const opcoesHead = [
    `INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO (${roteador}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.`,
    L_HEAD2,
    '',
    L_O1,
    '',
  ]

  if (tipo === P_TERCEIRO) {
    const protocoloTexto = [
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DE PLANO.`,
      '',
      AST,
      '',
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig} SEM OSCILAÇÃO.`,
      '',
      AST,
      `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
      '',
      ...planoBloco,
      '',
      'ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. ',
      '',
      '',
      AST,
      ...opcoesHead,
      L_O2,
      L_PROC,
      L_CIENTE,
      '',
      AST,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${clientePrimeiro} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR ${canal} (${contato}) SOB PROTOCOLO ${protocolo} EM ${dataLigacao} ÀS ${horaLigacao}. ${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.`,
      'CLIENTE NÃO TEM DÚVIDAS.',
    ].join('\n')

    const os = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) COMPARECEU NA LOJA E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${solicitantePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM ${clientePrimeiro} (ASSINANTE) POR ${canal} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR LIGAÇÃO GRAVADA (${contato}) SOB PROTOCOLO Nº${protocolo} EM ${dataLigacao} ÀS ${horaLigacao} HRS.`
    return {
      altplanPresencialTextoProtocolo: protocoloTexto,
      altplanPresencialTextoOS: os,
    }
  }

  // P_TITULAR
  const protocoloTexto = [
    `${clientePrimeiro} COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DE PLANO.`,
    '',
    AST,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sig}`,
    '',
    AST,
    `QUESTIONADO, CLIENTE DISSE QUE "${motivo}".`,
    '',
    ...planoBloco,
    '',
    'APLICATIVOS DISPONÍVEIS PARA SMARTPHONE OU SMART-TV QUE POSSUA COMPATIBILIDADE. ',
    '',
    '',
    AST,
    ...opcoesHead,
    `${L_O2} ${L_PROC}`,
    '',
    L_CIENTE,
    '',
    AST,
    '',
    `${clientePrimeiro} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA PRESENCIALMENTE DIA ${dataAtendimento} ÀS ${horaAtendimento} HRS`,
  ].join('\n')

  const os = `${clientePrimeiro} COMPARECEU À LOJA E SOLICITOU ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E ${clientePrimeiro} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº${protocolo} EM ${dataProtocolo} ÀS ${horaProtocolo} HRS.`
  return {
    altplanPresencialTextoProtocolo: protocoloTexto,
    altplanPresencialTextoOS: os,
  }
}

const CANAL_OPTS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const SEM_SINAL_OPTS = [
  { value: 'nao', label: 'Informar medida' },
  { value: 'sim', label: 'Sem sinal' },
]

const TERCEIRO = [P_TERCEIRO]

export const ALTPLAN_PRESENCIAL_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: P_TITULAR,
    options: [
      {
        value: P_TITULAR,
        label: 'Titular comparece (presencial)',
        icon: 'user-round',
      },
      {
        value: P_TERCEIRO,
        label: 'Terceiro comparece (titular autoriza)',
        icon: 'users-round',
      },
    ],
    layout: { md: 12 },
  },
  {
    id: 'solicitante',
    label: 'Nome do solicitante',
    control: 'text',
    placeholder: 'Quem compareceu à loja',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 6 },
  },
  {
    id: 'parente',
    label: 'Grau de parentesco',
    control: 'text',
    placeholder: 'Ex.: CÔNJUGE, FILHO(A)',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 6 },
  },
  {
    id: 'cliente',
    label: 'Nome completo (titular/assinante)',
    control: 'text',
    placeholder: 'Titular da conexão',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'canal',
    label: 'Canal da confirmação com titular',
    control: 'select',
    section: S_ID,
    options: CANAL_OPTS,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 3 },
  },
  {
    id: 'contato',
    label: 'Contato do titular',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 3 },
  },
  {
    id: 'dataLigacao',
    label: 'Data/hora da confirmação com titular',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: TERCEIRO },
    layout: { md: 4 },
  },
  {
    id: 'dataAtendimento',
    label: 'Data/hora do atendimento',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: P_TITULAR },
    layout: { md: 4 },
  },
  {
    id: 'semSinal',
    label: 'Sinal na ONU',
    control: 'radio',
    defaultValue: 'nao',
    section: S_ID,
    options: SEM_SINAL_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal da fibra',
    control: 'signal',
    placeholder: 'Ex.: 12.34 (sai -12.34DBM)',
    section: S_ID,
    showWhen: { field: 'semSinal', equals: 'nao' },
    layout: { md: 3 },
  },
  {
    id: 'motivo',
    label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)',
    control: 'text',
    placeholder: "Ex.: 'deseja cortar gastos'",
    section: S_PLANO,
    layout: { md: 12 },
  },
  {
    id: 'planoAtual',
    label: 'Plano atual',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_PLANO_ATUAL_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'planoEscolhido',
    label: 'Plano escolhido',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_PLANO_ESCOLHIDO_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    section: S_PLANO,
    options: ALTPLAN_ROTEADOR_OPTS,
    layout: { md: 6 },
  },
  {
    id: 'dataContrato',
    label: 'Plano contratado em',
    control: 'text',
    placeholder: 'mês/ano',
    section: S_PLANO,
    layout: { md: 3 },
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_PLANO,
    layout: { md: 3 },
  },
  {
    id: 'dataProtocolo',
    label: 'Data/hora do protocolo',
    control: 'datetime',
    placeholder: 'dd/mm/aaaa hh:mm',
    section: S_PLANO,
    showWhen: { field: 'tipoSolicitacao', equals: P_TITULAR },
    layout: { md: 6 },
  },
]

export function getAltplanPresencialDefaults() {
  return {
    slug: 'altplan-presencial',
    title: 'Alteração de plano — presencial',
    outputTemplate: ALTPLAN_PRESENCIAL_OUTPUT,
    demandCategory: 'alteracao-plano',
    fields: ALTPLAN_PRESENCIAL_FIELDS.map((f) => ({
      ...f,
      options: f.options?.map((o) => ({ ...o })),
    })),
  }
}
