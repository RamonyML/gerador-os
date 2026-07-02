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
 * Variante isenta de custos: instalacao realizada dentro de 07 dias, visita
 * tecnica sem cobranca. Nao ha forma de pagamento.
 *
 * Paridade com legado-exemplo/suporte/luz-vermelha-7dias/:
 * - index-luzverm-padrao.html (titular) — fiel ao legado
 * - luz-padrao1.html (terceiro solicita, titular ausente) — fiel ao legado
 * - luz-padrao2.html (terceiro solicita, titular presente) — fiel ao legado
 * - luz-padrao3.html (titular autoriza terceiro) — COMPOSTO POR ANALOGIA:
 *   no legado, este HTML nao foi atualizado para isento (ficou com a redacao
 *   "com custo" R$50,00). Aqui ele foi reescrito para isento, mantendo a
 *   estrutura do fluxo "titular autoriza terceiro". Validar com a operacao.
 */

const SEP28 = '='.repeat(28)
const SEP19 = '*'.repeat(19)
const SEP_OS = '='.repeat(39)

const INFORMEI_ISENTO =
  'INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO. INSTALACAO REALIZADA DENTRO DE 07 DIAS.'

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
  return `TECNICO: VERIFICAR CONECTOR, DROP INTERNO E EXTERNO. ACHANDO O PROBLEMA, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. APOS TERMINO DO SERVICO, PERGUNTA A ${quem} (OU QUEM ESTIVER ACOMPANHADO SERVICO) SE HA NECESSIDADE DE QUALQUER OUTRA ORIENTACAO SOBRE A INTERNET.`
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
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      '',
      SEP19,
      '',
      INFORMEI_ISENTO,
      '',
      SEP19,
      '',
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      luzVmIsentoTextoProtocolo: protocolo,
      luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n${sp(18)}\nINDICACAO TECNICA:\n${sp(20)}\n${tecnico(sp_)}`,
      luzVmIsentoTextoAgenda: agenda,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = [
      `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
      `ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      '',
      INFORMEI_ISENTO,
      '',
      SEP19,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${sp_} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTA-LOS APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      luzVmIsentoTextoProtocolo: protocolo,
      luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n\nINDICACAO TECNICA:\n\n${tecnico(sp_)}`,
      luzVmIsentoTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    // Composto por analogia (legado luz-padrao3 nao foi atualizado para isento).
    const protocolo = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      sp(20),
      SEP19,
      sp(24),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(24),
      SEP19,
      sp(24),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
      sp(24),
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
      `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
      sp(24),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(24),
      SEP19,
      sp(20),
      INFORMEI_ISENTO,
      sp(20),
      SEP19,
      sp(20),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      luzVmIsentoTextoProtocolo: protocolo,
      luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n\nINDICACAO TECNICA:\n${sp(20)}\n${tecnico(cp)}`,
      luzVmIsentoTextoAgenda: agenda,
    }
  }

  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP28,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    sp(8),
    SEP28,
    sp(8),
    `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
    sp(8),
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    sp(8),
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
    sp(8),
    SEP28,
    '',
    INFORMEI_ISENTO,
    sp(8),
    SEP28,
    sp(8),
    `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA. DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${op} ESTA COM ${alarme}". REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIA VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E RESTABELECER A CONEXAO. VISITA ISENTA MEDIANTE EQUIPAMENTOS EMPRESTADOS ESTAREM EM PERFEITO ESTADO DE CONSERVACAO E INSTALACAO REALIZADA DENTRO DE 07 DIAS. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
  return {
    luzVmIsentoTextoProtocolo: protocolo,
    luzVmIsentoTextoOS: osBase + ctoLine + `${SEP_OS}\n\n> INDICACAO TECNICA:\n\n${tecnico(cp)}`,
    luzVmIsentoTextoAgenda: agenda,
  }
}

const S_AGE = 'AGENDAMENTO'

export const LUZ_VERMELHA_ISENTO_FIELDS: OsTemplateField[] = [
  ...LUZ_VERMELHA_FIELDS.filter((f) => f.id !== 'formaPag').map((f) => ({ ...f })),
  {
    id: 'dataVisita',
    label: 'Visita Tecnica',
    control: 'date' as const,
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select' as const,
    section: S_AGE,
    options: [
      { value: '08:00', label: '08:00' },
      { value: '08:30', label: '08:30' },
      { value: '10:00', label: '10:00' },
      { value: '10:30', label: '10:30' },
      { value: '13:00', label: '13:00' },
      { value: '13:30', label: '13:30' },
      { value: '15:00', label: '15:00' },
      { value: '15:30', label: '15:30' },
      { value: '17:00', label: '17:00 (somente com autorizacao)' },
      { value: 'APOS AS 11:00', label: 'Apos as 11:00 (aos sabados)' },
    ],
    layout: { md: 4 },
  },
]

export function buildLuzVermelhaIsentoSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; osDescricao: string; osIndicacoes: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo       = v.tipoSolicitacao || T_TITULAR
  const cp         = first(upper(v.cliente))
  const sol        = first(upper(v.solicitante))
  const solFull    = upper(v.solicitante)
  const parente    = upper(v.parente)
  const canal      = upper(v.canal)
  const contato    = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu        = upper(v.onu) || 'ONU'
  const op         = first(onu)
  const alarme     = upper(v.alarme) || 'LUZ VERMELHA ACESA'
  const dataV      = v.dataVisita || 'XX/XX/XXXX'
  const horaV      = v.horaVisita || 'XX:XX'

  const _osRaw = buildLuzVermelhaIsentoTextos(rawValues, '').luzVmIsentoTextoOS
  const _mark = 'INDICACAO TECNICA:'
  const _midx = _osRaw.indexOf(_mark)
  const osDescricao = _midx >= 0 ? _osRaw.slice(0, _midx).replace(/[\s=>*]+$/, '') : _osRaw
  const osIndicacoes = _midx >= 0 ? _osRaw.slice(_midx + _mark.length).trimStart() : ''

  if (tipo === T_TERCEIRO_TERCEIRO) {
    return {
      info: `${sol} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
        `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.\nORIENTEI ${sol} A DESCONECTAR EQUIPAMENTO (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.`,
        `PERGUNTEI A ${sol} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
        INFORMEI_ISENTO,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${parente}) ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    return {
      info: `${sol} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
        `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.\nORIENTEI ${sol} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.`,
        `PERGUNTEI A ${sol} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
        INFORMEI_ISENTO,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    return {
      info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
        `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.\nORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.`,
        `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
        INFORMEI_ISENTO,
        `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR E ASSINAR O.S. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  // T_TITULAR (default)
  return {
    info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    comentarios: [
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM ${alarme}.`,
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.\nORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.`,
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
      INFORMEI_ISENTO,
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA. DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
    ],
    osDescricao,
    osIndicacoes,
  }
}

export function getManutLuzVermelhaIsentoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-luz-vermelha-isento',
    title: 'Luz vermelha — isento (7 dias)',
    demandCategory: 'manutencao',
    outputTemplate: LUZ_VERMELHA_ISENTO_OUTPUT,
    fields: LUZ_VERMELHA_ISENTO_FIELDS.map((f) => ({ ...f })),
  }
}
