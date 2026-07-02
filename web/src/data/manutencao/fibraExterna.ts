import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'

/**
 * Fibra optica externa (rompimento externo) — fluxo unico com variacoes.
 * Paridade com legado-exemplo/suporte/luz-vermelha/fibra-externa/:
 * - fibra-ext-padrao.html (titular)
 * - fibra-ext-pj.html (pessoa juridica)
 * - fibra-ext1.html (terceiro solicita, titular ausente)
 * - fibra-ext2.html (terceiro solicita, titular presente)
 * - fibra-ext3.html (titular solicita e autoriza terceiro)
 */

export const T_PJ = 'pessoa-juridica'

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)
const SEP_OS = '='.repeat(39)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA OCORRENCIA'
const S_AGE = 'AGENDAMENTO'

const TECNICO =
  'TECNICO: VERIFICAR CONECTOR E DROP INTERNO E EXTERNO, ACHANDO O PROBLEMA APRESENTAR AO CLIENTE. SENDO DEFEITO EM QUE E DE OBRIGACAO DO PROVEDOR, TOMAR PROVIDENCIAS E RESTITUIR SEM CUSTO. SENDO OCASIONADO PEDIR AUTORIZACAO DO CLIENTE PARA CORRIGIR E RESTABELECER LEMBRANDO DO VALOR A SER COBRADO NO ATO. APOS RESTITUIR INTERNET, DAR EXPLICACOES SOBRE PLANO, WI-FI E DISPOSITIVOS, CORRIGIR QUALQUER INCONSISTENCIAS NA INSTALACAO QUE NAO TIVER PADRAO, ATUALIZAR FIRMWARE DO ROTEADOR SE ESTIVER DESATUALIZADO. TEMPO ESTIMADO 60 MIN.'

export const FIBRA_EXTERNA_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{fibraExtTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{fibraExtTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{fibraExtTextoAgenda}}',
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

function osTailBlank(): string {
  return `${SEP_OS}

INDICACAO TECNICA:

${TECNICO}`
}

function osTailExt1(): string {
  return `${SEP_OS}

INDICACAO TECNICA:
${sp(20)}
${TECNICO}`
}

function buildAgenda(
  alarme: string,
  clienteUpper: string,
  protocolo: string,
  formaPag: string,
  operadorPrimeiroNome: string,
  bairro: string,
  ctoType: string,
): string {
  let agenda = `MAN ${alarmeAgendaPrefix(alarme)} ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  if (ctoType === 'CTOI') agenda += ' *CTOI*'
  return agenda
}

export function buildFibraExternaTextos(
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
  const cargo = upper(v.cargo)
  const canal = v.canal
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu = upper(v.onu)
  const op = first(onu)
  const motivo = upper(v.motivo)
  const formaPag = v.formaPag
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const ctoType = v.ctoType || 'CTOE'
  const cto = upper(v.cto)
  const passante = upper(v.passante)
  const ctoLine = ctoBlock(ctoType, cto, passante)
  const agenda = buildAgenda(
    v.alarme ?? '',
    clienteUpper,
    v.protocolo ?? '',
    formaPag,
    operadorPrimeiroNome,
    upper(v.bairro),
    ctoType,
  )

  if (tipo === T_PJ) {
    const protocolo = [
      `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
      '',
      SEP19,
      '',
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      '',
      SEP19,
      '',
      `${sp_} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. PERGUNTEI SOBRE A ${op}, E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${sp_} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} AUTORIZOU VISITA E PAGARA EM ${formaPag} NO ATO. VISITA AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      fibraExtTextoProtocolo: protocolo,
      fibraExtTextoOS: osBase + ctoLine + osTailBlank(),
      fibraExtTextoAgenda: agenda,
    }
  }

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
      `QUESTIONADO, ${sp_} DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
      sp(4),
      `PERGUNTEI A ${sp_} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      '',
      SEP42,
      '',
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      sp(4),
      SEP42,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${sp_} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitanteUpper} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      fibraExtTextoProtocolo: protocolo,
      fibraExtTextoOS: osBase + ctoLine + osTailExt1(),
      fibraExtTextoAgenda: agenda,
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
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sp_} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
      sp(4),
      SEP19,
      '',
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      sp(4),
      SEP19,
      '',
      `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${sp_} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${sp_} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${sp_} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      fibraExtTextoProtocolo: protocolo,
      fibraExtTextoOS: osBase + ctoLine + osTailBlank(),
      fibraExtTextoAgenda: agenda,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const protocolo = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      sp(20),
      SEP19,
      sp(24),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      sp(24),
      SEP19,
      sp(24),
      `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA. `,
      sp(24),
      SEP19,
      sp(20),
      'INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.',
      sp(20),
      SEP19,
      sp(20),
      `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`,
      '',
      'CLIENTE SEM DUVIDAS.',
    ].join('\n')
    const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO DISSE QUE: "${motivo}", E FICOU SEM ACESSO A INTERNET. REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA DESCONECTADO DO SISTEMA E ${op} APAGADA. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solicitanteUpper} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita} HRS.`
    return {
      fibraExtTextoProtocolo: protocolo,
      fibraExtTextoOS: osBase + ctoLine + osTailBlank(),
      fibraExtTextoAgenda: agenda,
    }
  }

  const protocolo = [
    `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
    '',
    SEP19,
    '',
    `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    '',
    SEP19,
    '',
    `QUESTIONADO, DISSE DISSE QUE "${motivo}".`,
    `PERGUNTEI SOBRE ${onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA.`,
    '',
    `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA. `,
    `ORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU. `,
    '',
    `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
    '',
    SEP19,
    '',
    `INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
    sp(4),
    SEP19,
    sp(4),
    `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita}HRS.`,
    '',
    'CLIENTE SEM DUVIDAS.',
  ].join('\n')
  const osBase = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE "${motivo}", E FICOU SEM CONEXAO COM A INTERNET. PERGUNTEI SOBRE ${onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA PISCANDO. PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO. ${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS. ${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataVisita} AS ${horaVisita}HRS.`
  return {
    fibraExtTextoProtocolo: protocolo,
    fibraExtTextoOS: osBase + ctoLine + osTailBlank(),
    fibraExtTextoAgenda: agenda,
  }
}

const CTO_RADIOS: OsTemplateField = {
  id: 'ctoType',
  label: 'Tipo CTO',
  control: 'radio',
  section: S_DET,
  defaultValue: 'CTOE',
  layout: { md: 4 },
  options: [
    { value: 'CTOE', label: 'CTOE' },
    { value: 'CTOI', label: 'CTOI' },
  ],
}

const COM_SOLICITANTE = [T_PJ, T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO]
const COM_TERCEIRO = [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO]
const COM_CONTATO_SOL = [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO]

export const FIBRA_EXTERNA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitacao',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      { value: T_TITULAR, label: 'Titular solicita e acompanha', icon: 'user-round' },
      { value: T_PJ, label: 'Pessoa juridica', icon: 'factory' },
      {
        value: T_TERCEIRO_TERCEIRO,
        label: 'Terceiro solicita (titular ausente)',
        icon: 'users-round',
      },
      {
        value: T_TERCEIRO_TITULAR,
        label: 'Terceiro solicita (titular presente)',
        icon: 'users-round',
      },
      {
        value: T_TITULAR_TERCEIRO,
        label: 'Titular solicita e autoriza terceiro',
        icon: 'user-round',
      },
    ],
    layout: { md: 12 },
  },
  {
    id: 'solicitante',
    label: 'Solicitante',
    control: 'text',
    placeholder: 'Nome completo de quem entrou em contato',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_SOLICITANTE },
    layout: { md: 8 },
  },
  {
    id: 'cargo',
    label: 'Cargo/Funcao',
    control: 'text',
    placeholder: 'Ex.: Socio, Admin, Gerente…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: [T_PJ] },
    layout: { md: 4 },
  },
  {
    id: 'parente',
    label: 'Grau de relacionamento',
    control: 'text',
    placeholder: 'Ex.: Mae, Filho, Irmao, Esposa…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_TERCEIRO },
    layout: { md: 4 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: 'Somente os numeros',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_CONTATO_SOL },
    layout: { md: 4 },
  },
  {
    id: 'cpf',
    label: 'CPF / CNPJ',
    control: 'text',
    placeholder: 'Somente numeros',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Nome completo / Razao social',
    control: 'text',
    placeholder: 'Nome completo (ou razao social, p/ pessoa juridica)',
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
      { value: 'LIGACAO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os numeros',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'motivo',
    label: 'Resumo do ocorrido',
    control: 'text',
    placeholder: "Ex.: 'um veiculo alto passou na rua rompendo o cabo drop'",
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
  CTO_RADIOS,
  {
    id: 'cto',
    label: 'CTO',
    control: 'text',
    placeholder: 'Ex.: 1035-A',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'passante',
    label: 'Localizacao do passante',
    control: 'text',
    placeholder: "Ex.: 'Passante no poste proximo ao sobrado'",
    section: S_DET,
    layout: { md: 8 },
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
]

export function buildFibraExternaSegmentos(
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
  const cargo      = upper(v.cargo)
  const canal      = upper(v.canal)
  const contato    = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const onu        = upper(v.onu) || 'ONU'
  const op         = first(onu)
  const motivo     = upper(v.motivo)
  const formaPag   = upper(v.formaPag)
  const dataV      = v.dataVisita || 'XX/XX/XXXX'
  const horaV      = v.horaVisita || 'XX:XX'

  const sInformeiHavendo =
    `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE ` +
    `HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTOS, MAS, SENDO ` +
    `PROBLEMA OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ` +
    `CASO OS EQUIPAMENTOS TENHAM DEFEITOS OCASIONADOS, SERA COBRADO O VALOR REFERENTE AOS MESMOS.`

  const _osRaw = buildFibraExternaTextos(rawValues, '').fibraExtTextoOS
  const _mark = 'INDICACAO TECNICA:'
  const _midx = _osRaw.indexOf(_mark)
  const osDescricao = _midx >= 0 ? _osRaw.slice(0, _midx).replace(/[\s=>*]+$/, '') : _osRaw
  const osIndicacoes = _midx >= 0 ? _osRaw.slice(_midx + _mark.length).trimStart() : ''

  if (tipo === T_PJ) {
    return {
      info: `${sol} (${cargo}) ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sol} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        sInformeiHavendo,
        `${sol} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TERCEIRO_TERCEIRO) {
    return {
      info: `${sol} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, ${sol} DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sol} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        `PERGUNTEI A ${sol} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
        sInformeiHavendo,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solFull} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TERCEIRO_TITULAR) {
    return {
      info: `${sol} (${parente} DE ${cp}) ENTROU EM CONTATO POR ${canal} (${contatoSol}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${sol} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        sInformeiHavendo,
        `POR PROCEDIMENTO PADRAO ENTREI EM CONTATO POR ${canal} (${contato}) COM ${cp} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU A VISITA. ${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E CASO HAJA CUSTOS PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA PARA O DIA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    return {
      info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
      comentarios: [
        `QUESTIONADO, DISSE QUE A ${op} ESTA COM LUZ VERMELHA ACESA. PERGUNTEI O MOTIVO E ${cp} DISSE QUE "${motivo}", E FICOU SEM ACESSO A INTERNET.`,
        `REMOTAMENTE VERIFIQUEI QUE ${onu} ESTA DESCONECTADO/APAGADA.`,
        sInformeiHavendo,
        `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. ${cp} DISSE QUE NAO ESTARA PRESENTE, MAS AUTORIZOU ${solFull} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO CASO HOUVER. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
      ],
      osDescricao,
      osIndicacoes,
    }
  }

  // T_TITULAR (default)
  return {
    info: `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUCAO E ${op} SEM SINAL.`,
    comentarios: [
      `QUESTIONADO, DISSE QUE "${motivo}".\nPERGUNTEI SOBRE ${onu} E CLIENTE DISSE QUE ESTA COM LUZ VERMELHA ACESA.`,
      `REMOTAMENTE VERIFIQUEI QUE ${op} ESTA DESCONECTADO/APAGADA.\nORIENTEI ${cp} A DESCONECTAR EQUIPAMENTOS (${onu}) DA REDE ELETRICA E RECONECTAR APOS 30 SEGUNDOS. FEZ, POREM CONEXAO NAO RESTABELECEU.`,
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO.`,
      `INFORMEI QUE SERA NECESSARIO VISITA TECNICA E CASO SEJA NECESSARIO A TROCA DO CABO DROP, IRIAMOS TROCAR DO POSTE ATE OS EQUIPAMENTOS INTERNOS E POR SE TRATAR DE UM PROBLEMA NAO OCASIONADO PELO CLIENTE A MANUTENCAO NAO TEM CUSTO.`,
      `${cp} TAMBEM FOI INFORMADO QUE CASO PROBLEMA IDENTIFICADO FOI OCASIONADO (ESPONTANEO OU NAO), SERA COBRADA VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS SE DANIFICADOS.`,
      `${cp} CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO COM ${formaPag}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA ${dataV} AS ${horaV} HRS.\n\nCLIENTE SEM DUVIDAS.`,
    ],
    osDescricao,
    osIndicacoes,
  }
}

export function getManutFibraExternaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-fibra-externa',
    title: 'Fibra optica externa — rompimento externo',
    demandCategory: 'manutencao',
    outputTemplate: FIBRA_EXTERNA_OUTPUT,
    fields: FIBRA_EXTERNA_FIELDS.map((f) => ({ ...f })),
  }
}
