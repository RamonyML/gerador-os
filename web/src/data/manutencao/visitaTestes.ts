import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Visita de Testes (lentidao / instabilidades) — fluxo unico com variacoes.
 * Paridade com legado-exemplo/suporte/lentidao/:
 * - index-lentidao.html (pessoa fisica)
 * - index-lentidao-pj.html (pessoa juridica)
 * - isento/index-lentidao.html (isento — pessoa fisica)
 * - isento/index-lentidao-pj.html (isento — pessoa juridica)
 * - disp-remoto/index-lentidao-disp.html (dispensou suporte remoto — pessoa fisica)
 * - disp-remoto/index-lentidao-disp-pj.html (dispensou suporte remoto — pessoa juridica)
 *
 * Observacao: este fluxo NAO gera texto de protocolo (apenas O.S e Agenda).
 * O legado tem inconsistencias de espacamento no trecho do repetidor entre
 * isento-PF (`POR CABO. ${repetidor}.`) e os demais (`POR CABO.${repetidor}`)
 * — reproduzidas fielmente.
 */

export const T_PF = 'pf'
export const T_PJ = 'pj'
export const T_ISENTO_PF = 'isento-pf'
export const T_ISENTO_PJ = 'isento-pj'
export const T_DISP_PF = 'disp-pf'
export const T_DISP_PJ = 'disp-pj'

const SEP = '*'.repeat(42)

const S_ID = 'IDENTIFICACAO DO CLIENTE'
const S_SOL = 'DADOS DO SOLICITANTE'
const S_DET = 'DETALHES DA SOLICITACAO'
const S_AGE = 'AGENDAMENTO'

const REP_WIFI =
  ' CLIENTE TAMBEM MENCIONOU QUE POSSUI REPETIDOR E O MESMO ESTA LIGADO POR WI-FI.'
const REP_CABO =
  ' CLIENTE TAMBEM MENCIONOU QUE POSSUI REPETIDOR E O MESMO ESTA LIGADO POR CABO DE REDE.'
const REP_MESH =
  ' CLIENTE POSSUI WI-FI EXTEND E O MESMO ESTA CONECTADO POR WI-FI (MESH).'
const REP_EXT_CABO =
  ' CLIENTE POSSUI WI-FI EXTEND E O MESMO ESTA CONECTADO POR CABO DE REDE.'
const REP_SEM = ' CLIENTE NAO POSSUI REPETIDOR DE SINAL.'

export const VISITA_TESTES_OUTPUT = [
  '=== Texto O.S ===',
  '{{visitaTestesTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{visitaTestesTextoAgenda}}',
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

function osText(intro: string, tecnico: string): string {
  return `${intro}

${SEP}

INDICACAO TECNICA:

${tecnico}`
}

export function buildVisitaTestesTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || T_PF
  const clienteUpper = upper(v.cliente)
  const cp = first(clienteUpper)
  const solicitanteUpper = upper(v.solicitante)
  const sp_ = first(solicitanteUpper)
  const cargo = upper(v.cargo)
  const canal = v.canal
  const contato = digits(v.contato)
  const sinalONU = upper(v.sinalONU)
  const oscila = v.oscila
  const repetidor = v.repetidor
  const disp1 = v.disp1
  const disp2 = v.disp2
  const disp3 = v.disp3
  const bairro = upper(v.bairro)
  const gestor = v.gestor
  const dataVisita = v.dataVisita
  const horaVisita = v.horaVisita
  const protocolo = v.protocolo
  const formaPag = v.formaPag

  const isento = tipo === T_ISENTO_PF || tipo === T_ISENTO_PJ
  const agendaPag = isento ? 'ISENTO' : formaPag
  const agenda = `MAN TESTES ${clienteUpper} PROT:${protocolo} ${agendaPag} (${operadorPrimeiroNome}) - ${bairro}`

  // Nome usado no corpo (primeiro nome do titular ou do solicitante PJ)
  const isPJ = tipo === T_PJ || tipo === T_ISENTO_PJ || tipo === T_DISP_PJ
  const nome = isPJ ? sp_ : cp
  const abertura = isPJ ? `${sp_} (${cargo})` : cp
  const local = isPJ ? 'EMPRESA' : 'RESIDENCIA'

  let os = ''

  if (tipo === T_DISP_PF || tipo === T_DISP_PJ) {
    const intro = `${abertura} ENTROU EM CONTATO VIA ${canal} (${contato}) E SOLICITOU VISITA TECNICA. QUESTIONADO, ${nome} DISSE QUE "INTERNET ESTA RUIM E DISPENSOU O SUPORTE REMOTO PARA QUAISQUER PROCEDIMENTOS". INFORMEI QUE VISITA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TECNICO, QUE ESTE PODERA SER PAGO EM DINHEIRO, CARTAO OU PIX E QUE PODERA SER ACRESCIDO O CUSTO DE EQUIPAMENTOS DANIFICADOS SE HOUVER. SE DE FATO TIVER PROBLEMAS NA CONEXAO DE INTERNET DE RESPONSABILIDADE DO PROVEDOR VISITA E ISENTA DE CUSTOS. ${nome} CONCORDOU E CASO HAJA COBRANCA PAGARA NO ATO COM ${formaPag}. VISITA AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS.`
    const tecnico = `TECNICO: PEDIR PARA ${nome} APRESENTAR PROBLEMA DE TESTE DE INTERNET QUE ELE DIZ TER. COMPARAR MESMO TESTE COM NOTEBOOK E CELULAR DO KIT TECNICO FOTOGRAFAR/FILMAR. SE HOUVER PROBLEMA NOS EQUIPAMENTOS DA EMPRESA (ROTEADOR OU ONU) QUE NAO SEJAM OCASIONADOS, REPARAR OU TROCAR. SE HOUVER PROBLEMAS NESTE QUE FOREM OCASIONADOS, APRESENTAR AO CLIENTE E INFORMAR CUSTOS. CONFERIR INSTALACAO E LIGACOES ELETRICAS, INSTRUIR SOBRE COBERTURA WI-FI (SE NECESSARIO). CASO NAO HAJA PROBLEMAS E VISITA TER SIDO SOMENTE INSTRUTIVA, COBRAR VALOR DA VISITA E SOLICITAR REALIZACAO DO FEEDBACK. TEMPO ESTIMADO: 40 MINUTOS.`
    os = osText(intro, tecnico)
  } else if (isento) {
    // O isento-PF tem espacamento diferente no trecho do repetidor.
    const repTrecho =
      tipo === T_ISENTO_PF ? `POR CABO. ${repetidor}. ` : `POR CABO.${repetidor} `
    const intro = `${abertura} ENTROU EM CONTATO VIA ${canal} (${contato}) E DISSE QUE ESTA COM LENTIDAO NA CONEXAO COM A INTERNET, QUESTIONADO INFORMOU QUE "TODOS OS DISPOSITIVOS DA ${local} FICAM COM A INTERNET LENTA REPETIDAS VEZES AO LONGO DO DIA E NAO CONSEGUE AFERIR A VELOCIDADE DO PLANO EM NENHUM DE SEUS DISPOSITIVOS". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA CONECTADO, SINAL ONU (${sinalONU} ${oscila}) NAO CONSTAM DESCONEXOES, NO MOMENTO HA ${disp1} DISPOSITIVOS CONECTADOS AO ROTEADOR, ${disp2} VIA WI-FI E ${disp3} ${repTrecho}${nome} SOLICITOU VISITA TECNICA PARA VERIFICAR PROBLEMA QUE "DIZ TER". ${gestor} AUTORIZOU VISITA ISENTA DE CUSTOS DESDE QUE OS EQUIPAMENTOS ESTEJAM EM PERFEITO ESTADO DE CONSERVACAO. ${nome} DISSE ESTAR CIENTE E CONCORDOU COM A VISITA QUE FOI AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS.`
    const tecnico = `TECNICO: PEDIR PARA QUE ${nome} APRESENTE OS “PROBLEMAS DE INTERNET” QUE DIZ TER. COMPARAR TESTES ENTRE DISPOSITIVOS DELES COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT TECNICO. VISITA ISENTA DE CUSTOS (CORTESIA). CASO APRESENTAR ALGUM PROBLEMA ATUALIZAR O ROTEADOR COM UMA NOVA FIRMWARE E TESTAR NOVAMENTE, E SE AINDA NAO RESOLVER SUBSTITUIR O ROTEADOR POR UM NOVO. EXPLICAR E TIRAR TODAS AS DUVIDAS DO CLIENTE. TEMPO ESTIMADO 60 MINUTOS.`
    os = osText(intro, tecnico)
  } else {
    // T_PF / T_PJ (padrao com custo)
    const intro = `${abertura} ENTROU EM CONTATO VIA ${canal} (${contato}) E DISSE QUE ESTA COM LENTIDAO NA CONEXAO COM A INTERNET, QUESTIONADO INFORMOU QUE "TODOS OS DISPOSITIVOS DA ${local} FICAM COM A INTERNET LENTA REPETIDAS VEZES AO LONGO DO DIA E NAO CONSEGUE AFERIR A VELOCIDADE DO PLANO EM NENHUM DE SEUS DISPOSITIVOS". REMOTAMENTE VERIFIQUEI QUE USUARIO ESTA CONECTADO, SINAL ONU (${sinalONU} ${oscila}) NAO CONSTAM DESCONEXOES, NO MOMENTO HA ${disp1} DISPOSITIVOS CONECTADOS AO ROTEADOR, ${disp2} VIA WI-FI E ${disp3} POR CABO.${repetidor} ${nome} SOLICITOU VISITA TECNICA PARA VERIFICAR PROBLEMA QUE "DIZ TER". INFORMEI QUE HAVENDO PROBLEMA DE RESPONSABILIDADE DO PROVEDOR VISITA NAO TERA CUSTO, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NAO) OU SOMENTE PARA INSTRUCAO DE USO COBRAMOS VISITA TECNICA DE R$50,00 E ATE MESMO EQUIPAMENTOS DANIFICADOS. ${nome} DISSE ESTAR CIENTE E CONCORDOU COM A VISITA E CASO HAJA COBRANCA SOLICITOU PAGAR NO ATO ${formaPag}. VISITA AGENDADA PARA ${dataVisita} AS ${horaVisita} HRS.`
    const tecnico = `TECNICO: PEDIR PARA QUE ${nome} APRESENTE OS “PROBLEMAS DE INTERNET” QUE DIZ TER. COMPARAR TESTES ENTRE DISPOSITIVOS DELES COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT TECNICO. CASO NAO TIVER OU APRESENTAR NENHUM PROBLEMA COBRAR VALOR MINIMO DA VISITA DE R$50,00, CASO APRESENTAR ALGUM PROBLEMA ATUALIZAR O ROTEADOR COM UMA NOVA FIRMWARE E TESTAR NOVAMENTE, E SE AINDA NAO RESOLVER SUBSTITUIR O ROTEADOR POR UM NOVO. EXPLICAR E TIRAR TODAS AS DUVIDAS DO CLIENTE. TEMPO ESTIMADO 60 MINUTOS.`
    os = osText(intro, tecnico)
  }

  return {
    visitaTestesTextoOS: os,
    visitaTestesTextoAgenda: agenda,
  }
}

const COM_PJ = [T_PJ, T_ISENTO_PJ, T_DISP_PJ]
const COM_DETALHE = [T_PF, T_PJ, T_ISENTO_PF, T_ISENTO_PJ]
const COM_GESTOR = [T_ISENTO_PF, T_ISENTO_PJ]
const COM_FORMA_PAG = [T_PF, T_PJ, T_DISP_PF, T_DISP_PJ]

export const VISITA_TESTES_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitacao',
    control: 'select',
    highlight: true,
    defaultValue: T_PF,
    options: [
      { value: T_PF, label: 'Pessoa fisica', icon: 'user-round' },
      { value: T_PJ, label: 'Pessoa juridica', icon: 'factory' },
      { value: T_ISENTO_PF, label: 'Isento — pessoa fisica', icon: 'banknote-x' },
      { value: T_ISENTO_PJ, label: 'Isento — pessoa juridica', icon: 'banknote-x' },
      {
        value: T_DISP_PF,
        label: 'Dispensou suporte remoto — pessoa fisica',
        icon: 'octagon-x',
      },
      {
        value: T_DISP_PJ,
        label: 'Dispensou suporte remoto — pessoa juridica',
        icon: 'octagon-x',
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
    showWhen: { field: 'tipoSolicitacao', equals: COM_PJ },
    layout: { md: 8 },
  },
  {
    id: 'cargo',
    label: 'Cargo/Funcao',
    control: 'text',
    placeholder: 'Ex.: Socio, Admin, Gerente…',
    section: S_SOL,
    showWhen: { field: 'tipoSolicitacao', equals: COM_PJ },
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Nome completo / Razao social',
    control: 'text',
    placeholder: 'Nome completo (ou razao social, p/ pessoa juridica)',
    section: S_ID,
    layout: { md: 12 },
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
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_DETALHE },
    layout: { md: 4 },
  },
  {
    id: 'oscila',
    label: 'Sinal oscilando?',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_DETALHE },
    layout: { md: 4 },
    options: [
      { value: 'COM OSCILACAO', label: 'Sim' },
      { value: 'SEM OSCILACAO', label: 'Nao' },
    ],
  },
  {
    id: 'repetidor',
    label: 'Repetidor de sinal',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_DETALHE },
    layout: { md: 4 },
    options: [
      { value: REP_WIFI, label: 'Repetidor via Wi-Fi' },
      { value: REP_CABO, label: 'Repetidor via cabo' },
      { value: REP_MESH, label: 'Wi-Fi Extend via Mesh' },
      { value: REP_EXT_CABO, label: 'Wi-Fi Extend via cabo' },
      { value: REP_SEM, label: 'Sem repetidor' },
    ],
  },
  {
    id: 'disp1',
    label: 'Total de aparelhos conectados',
    control: 'text',
    placeholder: 'Apenas numeros',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_DETALHE },
    layout: { md: 4 },
  },
  {
    id: 'disp2',
    label: 'Via Wi-Fi',
    control: 'text',
    placeholder: 'Apenas numeros',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_DETALHE },
    layout: { md: 4 },
  },
  {
    id: 'disp3',
    label: 'Via cabo',
    control: 'text',
    placeholder: 'Apenas numeros',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_DETALHE },
    layout: { md: 4 },
  },
  {
    id: 'gestor',
    label: 'Isencao autorizada por',
    control: 'select',
    section: S_DET,
    showWhen: { field: 'tipoSolicitacao', equals: COM_GESTOR },
    layout: { md: 4 },
    options: [
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'HIAGO', label: 'HIAGO' },
    ],
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_AGE,
    showWhen: { field: 'tipoSolicitacao', equals: COM_FORMA_PAG },
    layout: { md: 4 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 4 },
  },
]

export function getManutVisitaTestesDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-visita-testes',
    title: 'Visita de Testes',
    demandCategory: 'manutencao',
    outputTemplate: VISITA_TESTES_OUTPUT,
    fields: VISITA_TESTES_FIELDS.map((f) => ({ ...f })),
  }
}
