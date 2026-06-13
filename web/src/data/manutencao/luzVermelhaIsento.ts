import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { LUZ_VERMELHA_FIELDS } from './luzVermelha'

/**
 * Luz vermelha / PON piscando — ISENTO (dentro dos 7 dias).
 * Variante isenta de custos: instalação realizada dentro de 07 dias, visita
 * técnica sem cobrança. Não há forma de pagamento.
 *
 * Paridade com legado-exemplo/suporte/luz-vermelha-7dias/:
 * - index-luzverm-padrao.html (titular) — fiel ao legado
 * - luz-padrao1.html (terceiro solicita, titular ausente) — fiel ao legado
 * - luz-padrao2.html (terceiro solicita, titular presente) — fiel ao legado
 * - luz-padrao3.html (titular autoriza terceiro) — COMPOSTO POR ANALOGIA:
 *   no legado, este HTML não foi atualizado para isento (ficou com a redação
 *   "com custo" R$50,00). Aqui ele foi reescrito para isento, mantendo a
 *   estrutura do fluxo "titular autoriza terceiro". Validar com a operação.
 */

const SEP28 = '='.repeat(28)
const SEP19 = '*'.repeat(19)
const SEP_OS = '='.repeat(39)

const INFORMEI_ISENTO =
  'INFORMEI QUE É NECESSÁRIA VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXÃO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVAÇÃO E INSTALAÇÃO REALIZADA DENTRO DE 07 DIAS.'

export const LUZ_VERMELHA_ISENTO_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{luzVmIsentoTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{luzVmIsentoTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{luzVmIsentoTextoAgenda}}',
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

function sp(n: number): string {
  return ' '.repeat(n)
}

function alarmeAgendaPrefix(alarme: string): string {
  return alarme.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ')
}

function ctoBlock(ctoType: string, cto: string, passante: string): string {
  if (ctoType === 'CTOE') return `\nCTOE: ${cto} // ${passante}.\n`
  if (ctoType === 'CTOI') return `\nCTOI // ${passante}.\n`
  return ''
}

function tecnico(quem: string): string {
  return `TÉCNICO: VERIFICAR CONECTOR, DROP INTERNO E EXTERNO. ACHANDO O PROBLEMA, TOMAR PROVIDÊNCIAS E RESTITUIR SEM CUSTO. APÓS TÉRMINO DO SERVIÇO, PERGUNTA À ${quem} (OU QUEM ESTIVER ACOMPANHADO SERVIÇO) SE HÁ NECESSIDADE DE QUALQUER OUTRA ORIENTAÇÃO SOBRE A INTERNET.`
}

function buildAgenda(
  v: Record<string, string>,
  clienteUpper: string,
  operadorPrimeiroNome: string,
): string {
  const ctoType = v.ctoType || 'CTOE'
  let agenda = `DENTRO DOS 7 DIAS // MAN ${alarmeAgendaPrefix(v.alarme ?? '')} ${clienteUpper} PROT:${v.protocolo ?? ''} ISENTO (${operadorPrimeiroNome}) - ${upper(v.bairro)}`
  if (ctoType === 'CTOI') agenda += ' *CTOI*'
  return agenda
}

export function buildLuzVermelhaIsentoTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || T_TITULAR
  const clienteUpper = upper(v.cliente)
  const cp = first(clienteUpper)
  const solicitanteUpper = upper(v.solicitante)
  const sp_ = first(solicitanteUpper)
  const parente = upper(v.parente)
  const canal = v.canal
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu = upper(v.onu)
  const op = first(onu)
  const alarme = upper(v.alarme)
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const ctoType = v.ctoType || 'CTOE'
  const cto = upper(v.cto)
  const passante = upper(v.passante)
  const ctoLine = ctoBlock(ctoType, cto, passante)
  const agenda = buildAgenda(v, clienteUpper, operadorPrimeiroNome)

  if (tipo === T_TERCEIRO_TERCEIRO) {
    const protocolo = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      '',
      SEP19,
      '',
      INFORMEI_ISENTO,
      '',
      SEP19,
      '',
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIA VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXÃO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVAÇÃO E INSTALAÇÃO REALIZADA DENTRO DE 07 DIAS. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    return {
      luzVmIsentoTextoProtocolo: protocolo,
      luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n${sp(18)}\nINDICAÇÃO TÉCNICA:\n${sp(20)}\n${tecnico(sp_)}`,
      luzVmIsentoTextoAgenda: agenda,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(4),
      SEP19,
      '',
      INFORMEI_ISENTO,
      '',
      SEP19,
      '',
      `POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTA-LOS APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIA VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXÃO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVAÇÃO E INSTALAÇÃO REALIZADA DENTRO DE 07 DIAS. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    return {
      luzVmIsentoTextoProtocolo: protocolo,
      luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n\n${tecnico(sp_)}`,
      luzVmIsentoTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    // Composto por analogia (legado luz-padrao3 não foi atualizado para isento).
    const protocolo = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
      sp(20),
      SEP19,
      sp(24),
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
      sp(24),
      SEP19,
      sp(24),
      `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
      sp(24),
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
      `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
      sp(24),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. `,
      sp(24),
      SEP19,
      sp(20),
      INFORMEI_ISENTO,
      sp(20),
      SEP19,
      sp(20),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIA VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXÃO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVAÇÃO E INSTALAÇÃO REALIZADA DENTRO DE 07 DIAS. ${cp} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    return {
      luzVmIsentoTextoProtocolo: protocolo,
      luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n\nINDICAÇÃO TÉCNICA:\n${sp(20)}\n${tecnico(cp)}`,
      luzVmIsentoTextoAgenda: agenda,
    }
  }

  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.`,
    '',
    SEP28,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${op} SEM SINAL.`,
    sp(8),
    SEP28,
    sp(8),
    `QUESTIONADO, DISSE QUE A ${op} ESTÁ COM ${alarme}.`,
    sp(8),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. `,
    sp(8),
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO.`,
    sp(8),
    SEP28,
    '',
    INFORMEI_ISENTO,
    sp(8),
    SEP28,
    sp(8),
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTÁ COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTÁ DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIA VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXÃO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVAÇÃO E INSTALAÇÃO REALIZADA DENTRO DE 07 DIAS. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} ÀS ${horaVisita} HRS.`
  return {
    luzVmIsentoTextoProtocolo: protocolo,
    luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n\n> INDICAÇÃO TÉCNICA:\n\n${tecnico(cp)}`,
    luzVmIsentoTextoAgenda: agenda,
  }
}

export const LUZ_VERMELHA_ISENTO_FIELDS: OsTemplateField[] = LUZ_VERMELHA_FIELDS.filter(
  (f) => f.id !== 'formaPag',
).map((f) => ({ ...f }))

export function getManutLuzVermelhaIsentoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-luz-vermelha-isento',
    title: 'Luz vermelha — isento (7 dias)',
    demandCategory: 'manutencao',
    outputTemplate: LUZ_VERMELHA_ISENTO_OUTPUT,
    fields: LUZ_VERMELHA_ISENTO_FIELDS.map((f) => ({ ...f })),
  }
}
