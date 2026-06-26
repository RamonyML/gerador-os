import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Fonte queimada (equipamento queimado) — fluxo unico com dois modos.
 * Paridade com legado-exemplo/suporte/equip-queimado/:
 * - fonte-queimada.html (com visita tecnica): Protocolo + O.S + Agenda
 * - fonte-queimada-loja.html (retirar na loja): Protocolo + "Encaminhar no grupo LEIA"
 *
 * Observacao: este fluxo tem duas formas de saida diferentes; por isso a saida e
 * composta dinamicamente (com ou sem O.S). Reproduz fielmente os separadores
 * `*`×19 e os espacamentos/trailing spaces do legado.
 */

export const M_VISITA = 'com-visita'
export const M_LOJA = 'loja'

const SEP19 = '*'.repeat(19)
const SEP42 = '*'.repeat(42)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRENCIA E AGENDAMENTO'

const PROC_INVERSAO =
  'ORIENTEI CLIENTE A INVERTER A FONTE DA ONU COM A DO ROTEADOR, E ASSIM EQUIPAMENTO FUNCIONOU'
const PROC_TOMADA =
  'ORIENTEI CLIENTE A CONECTAR A FONTE DE ENERGIA EM OUTRA TOMADA, E EQUIPAMENTO NAO LIGOU'

export const FONTE_QUEIMADA_OUTPUT = '{{fonteQueimadaSaida}}'

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

export function buildFonteQueimadaTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const modo = v.tipoSolicitacao || M_VISITA
  const clienteUpper = upper(v.cliente)
  const cp = first(clienteUpper)
  const canal = v.canal
  const contato = digits(v.contato)
  const sinalONU = upper(v.sinalONU)
  const bairro = upper(v.bairro)
  const equip = v.equip
  const dataVisita = v.dataVisita
  const protocolo = v.protocolo
  const formaPag = v.formaPag

  let protocoloTxt = ''
  let os = ''
  let agenda = ''
  let agendaLabel = 'Texto da Agenda'

  if (modo === M_LOJA) {
    const proced = upper(v.proced)
    const periodo = v.periodo
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E FIBRA COM SINAL: ${sinalONU}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
      sp(4),
      `REMOTAMENTE VERIFIQUEI QUE ${equip} ESTA DESCONECTADO. `,
      `${proced}`,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      '',
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA, E QUE DEVIDO ${cp} TER CONECTADO O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA MZNET, ESTARA ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      '',
      `SUGERI TAMBEM, A POSSIBILIDADE DE COMPARECER A LOJA E RETIRAR UMA NOVA FONTE DE ENERGIA SEM NENHUM CUSTO ADICIONAL.`,
      '',
      SEP19,
      sp(4),
      `${cp} OPTOU POR VIR A LOJA, DISSE QUE VIRA NO DIA ${dataVisita} NO PERIODO DA ${periodo}.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')
    agenda = `*${clienteUpper}*
CLIENTE VIRA NA LOJA RECOLHER UMA FONTE DE ${equip} SEM CUSTOS. EM  ${dataVisita} NO PERIODO DA ${periodo}.
PROTOCOLO Nº:${protocolo}`
    agendaLabel = 'Encaminhar no grupo LEIA'
  } else {
    // M_VISITA (com visita tecnica)
    const proced = v.proced
    const horaVisita = v.horaVisita
    protocoloTxt = [
      `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXAO.`,
      '',
      SEP19,
      sp(4),
      `CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU ${sinalONU}.`,
      sp(4),
      SEP19,
      sp(4),
      `QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NAO ESTA LIGANDO.`,
      '',
      `REMOTAMENTE VERIFIQUEI QUE ${equip} ESTA DESCONECTADO. `,
      `${proced}.`,
      sp(4),
      `PERGUNTEI A ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. `,
      sp(4),
      SEP19,
      sp(4),
      `INFORMEI QUE E NECESSARIO VISITA TECNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO ${cp} CONECTAR O EQUIPAMENTO A ENERGIA CONFORME RECOMENDACAO DA MZNET, ESTARA ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANCA DO DESLOCAMENTO DO TECNICO COM O CUSTO DE R$50,00.`,
      sp(4),
      SEP19,
      sp(4),
      `${cp} CONCORDOU COM OS TERMOS DA VISITA TECNICA E PAGARA EM ${formaPag}, DISSE QUE ESTARA PRESENTE PARA ACOMPANHAR O TECNICO. VISITA AGENDADA PARA O DIA ${dataVisita} A PARTIR DE ${horaVisita} HRS.`,
      '',
      `CLIENTE SEM DUVIDAS.`,
    ].join('\n')
    const intro = `${cp} ENTROU EM CONTATO POR ${canal} (${contato}) E DISSE QUE ESTA SEM CONEXAO COM A INTERNET. QUESTIONADO, DISSE "QUE ${equip} ESTA COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE ${equip} ESTA DESCONECTADO/APAGADA. ${proced}. PERGUNTEI ${cp} SE EFETUOU ALGUMA MODIFICACAO/INTERVENCAO NA INSTALACAO E CLIENTE DISSE QUE NAO. INFORMEI QUE E NECESSARIO VISITA TECNICA PARA REALIZAR A SUBSTITUICAO DA FONTE QUEIMADA POR OUTRA DE MODELO SIMILAR. VISITA TECNICA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO. ${cp} CONCORDOU E PAGARA NO ATO COM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} A PARTIR DE ${horaVisita} HRS.`
    const tecnico = `TECNICO: CONFERIR EQUIPAMENTOS E PARTE ELETRICA. SUBSTITUIR FONTE QUEIMADA E RESTABELECER ACESSO A INTERNET. CASO HAJA EQUIPAMENTOS DANIFICADOS POR MAL USO ENTRAR EM CONTATO COM O SUPORTE DE IMEDIATO PARA TRATATIVA. TESTAR REDE WI-FI E DISPOSITIVOS LIGADOS POR CABOS, CONFERIR NAVEGACAO IPv6 E AFERIR O PLANO CONTRATADO. SANAR TODAS AS DUVIDAS DE ${cp}, COLHER ASSINATURA DA ORDEM DE SERVICO E RECEBER SERVICO.`
    os = `${intro}

${SEP42}

INDICACAO TECNICA:

${tecnico}`
    agenda = `MAN TROCA FONTE ${clienteUpper} PROT:${protocolo} ${formaPag} (${operadorPrimeiroNome}) - ${bairro}`
  }

  const saida =
    modo === M_LOJA
      ? [
          '=== Texto Protocolo ===',
          protocoloTxt,
          '',
          `=== ${agendaLabel} ===`,
          agenda,
        ].join('\n')
      : [
          '=== Texto Protocolo ===',
          protocoloTxt,
          '',
          '=== Texto O.S ===',
          os,
          '',
          `=== ${agendaLabel} ===`,
          agenda,
        ].join('\n')

  return {
    fonteQueimadaTextoProtocolo: protocoloTxt,
    fonteQueimadaTextoOS: os,
    fonteQueimadaTextoAgenda: agenda,
    fonteQueimadaSaida: saida,
  }
}

const COM_VISITA = [M_VISITA]
const SO_LOJA = [M_LOJA]

export const FONTE_QUEIMADA_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Modo de atendimento',
    control: 'select',
    highlight: true,
    defaultValue: M_VISITA,
    options: [
      { value: M_VISITA, label: 'Com visita tecnica', icon: 'plug' },
      { value: M_LOJA, label: 'Retirar na loja', icon: 'plug' },
    ],
    layout: { md: 12 },
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
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo do titular da conexao',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
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
    layout: { md: 3 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal atual',
    control: 'text',
    placeholder: 'Ex.: -31.87 dBm',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 3 },
  },
  {
    id: 'equip',
    label: 'Tipo da fonte',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'ONU', label: 'Fonte ONU' },
      { value: 'ONT', label: 'Fonte ONT' },
      { value: 'ROTEADOR', label: 'Fonte Roteador' },
    ],
  },
  {
    id: 'proced',
    label: 'Procedimento',
    control: 'select',
    section: S_DET,
    layout: { md: 8 },
    options: [
      { value: PROC_INVERSAO, label: 'Realizado inversao das fontes (ONU/Roteador)' },
      { value: PROC_TOMADA, label: 'Realizado teste em outra tomada (ONT)' },
    ],
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_VISITA },
    layout: { md: 4 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'periodo',
    label: 'Periodo (visita na loja)',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: SO_LOJA },
    layout: { md: 4 },
    options: [
      { value: 'MANHA', label: 'Manha' },
      { value: 'TARDE', label: 'Tarde' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 4 },
  },
]

export function buildFonteQueimadaSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  const operadorPrimeiroNome = String(rawValues.operadorPrimeiroNome ?? '')
  const { fonteQueimadaTextoProtocolo } = buildFonteQueimadaTextos(rawValues, operadorPrimeiroNome)
  const segments = fonteQueimadaTextoProtocolo
    .split(/^[=*]{5,}$/gm)
    .map((s) => s.trim())
    .filter(Boolean)
  return { info: segments[0] ?? '', comentarios: segments.slice(1) }
}

export function getManutFonteQueimadaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-fonte-queimada',
    title: 'Fonte queimada',
    demandCategory: 'manutencao',
    outputTemplate: FONTE_QUEIMADA_OUTPUT,
    fields: FONTE_QUEIMADA_FIELDS.map((f) => ({ ...f })),
  }
}
