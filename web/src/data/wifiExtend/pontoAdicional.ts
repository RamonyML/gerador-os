import type { FieldOption, OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  CANAL_OPTS,
  S_AGE,
  S_ID,
  SEGMENTO_OPTS,
  SEGMENTO_PF,
  SEGMENTO_PJ,
  SEP35,
  TROCA_NAO,
  TROCA_OPTS,
  TROCA_SIM,
  digits,
  first,
  upper,
} from './wifiExtendShared'

/**
 * Ponto adicional — compra de 01 roteador para expandir a rede (R$360,00).
 * Paridade com:
 *   legado-exemplo/suporte/wi-fi extend/wi-fi-ponto/*.html
 *
 * Produto distinto do Wi-Fi Extend: SEM renovação de fidelidade, apenas a
 * compra do equipamento. Não gera Texto Protocolo — só O.S e Agenda.
 * Selects: segmento (PF/PJ) e troca (do roteador primário).
 */

const FORMA_PAG_OPTS: FieldOption[] = [
  { value: 'CARTÃO DE CRÉDITO SEM JUROS', label: 'Crédito' },
  { value: 'CARTÃO DE DÉBITO', label: 'Débito' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
]

const PARCELA_OPTS: FieldOption[] = [
  { value: '1x', label: '1x' },
  { value: '2x', label: '2x' },
  { value: '3x', label: '3x' },
]

const TEC_PONTO_SEM_TROCA =
  'TÉCNICO: INSTALAR ROTEADOR (MODELO COMPATIVEL AO PLANO) EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. CONFIGURAR REDE, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. CORRIGIR QUALQUER INCONSISTÊNCIAS NA INSTALAÇÃO QUE NÃO ESTIVER NO PADRÃO. RECEBER O VALOR DO EQUIPAMENTO E SERVIÇO NA FORMA COMBINADA. TEMPO ESTIMADO 60 MIN.'

// Quirk do legado: prefixo "TÉCNICO: TÉCNICO:" duplicado. O legado interpola
// ${roteador}, campo inexistente no formulário do ponto → sai vazio (espaço duplo
// em "SUBSTITUIR ROTEADOR  POR"). Reproduzimos fielmente.
function tecPontoTroca(roteador: string): string {
  return `TÉCNICO: TÉCNICO: CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ${roteador} POR ROTEADOR ZTE H-199A E CONFIGURAR COMO PONTO PRINCIPAL. INSTALAR ROTEADOR EXTEND ZTE H-199A OU H-196A EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. RECEBER O VALOR DO EQUIPAMENTO E SERVIÇO NA FORMA COMBINADA. TEMPO ESTIMADO 60 MIN.`
}

export function buildPontoAdicionalTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const isPJ = String(rawValues.segmento ?? SEGMENTO_PF) === SEGMENTO_PJ
  const troca = String(rawValues.troca ?? TROCA_NAO) === TROCA_SIM

  const cliente = upper(rawValues.cliente)
  const cp = first(cliente)
  const solicitante = upper(rawValues.solicitante)
  const solicCp = first(solicitante)
  const cargo = upper(rawValues.cargo)
  const canal = String(rawValues.canal ?? '')
  const contato = digits(rawValues.contato)
  const bairro = upper(rawValues.bairro)
  const dataVisita = String(rawValues.dataVisita ?? '')
  const horaVisita = String(rawValues.horaVisita ?? '')
  const protocolo = String(rawValues.protocolo ?? '')
  const parcela = String(rawValues.parcela ?? '')
  const formaPag = String(rawValues.formaPag ?? '')
  const roteador = String(rawValues.roteador ?? '')

  const subject = isPJ ? `${solicCp} (${cargo})` : cp
  const local = isPJ ? 'EMPRESA' : 'RESIDÊNCIA'
  // Legado: sem-troca usa literal "(ROTEADOR PRIMÁRIO)"; troca interpola
  // ${roteador} (inexistente no formulário do ponto) → "()".
  const pontoPrincipal = troca ? `(${roteador})` : '(ROTEADOR PRIMÁRIO)'

  const osIntro = `POR ${canal} (${contato}) ${subject} SOLICITOU A COMPRA DE 01 ROTEADOR ADICIONAL PARA EXPANDIR A ABRANGÊNCIA DA REDE WI-FI DENTRO DA MESMA ${local} EM QUE FOI INSTALADO O PONTO PRINCIPAL ${pontoPrincipal}. VALOR ACORDADO DO ROTEADOR R$360,00 QUE SERÁ PAGO EM ${parcela} NO ${formaPag}. E INSTALAÇÃO/CONFIGURAÇÃO GRÁTIS. VISITA AGENDADA PARA INSTALAÇÃO DO EQUIPAMENTO EM ${dataVisita} ÀS ${horaVisita} HORAS.`

  const tecnico = troca ? tecPontoTroca(roteador) : TEC_PONTO_SEM_TROCA
  const os =
    osIntro + '\n\n' + SEP35 + '\n\n' + 'INDICAÇÃO TÉCNICA:' + '\n\n' + tecnico

  const formaPagFirst = first(formaPag)
  const agenda = `PONTO ADICIONAL ${cliente} PROT:${protocolo} ${formaPagFirst} (${operadorPrimeiroNome}) - ${bairro}`

  return {
    pontoTextoOS: os,
    pontoTextoAgenda: agenda,
  }
}

export const PONTO_ADICIONAL_OUTPUT = [
  '=== Texto O.S ===',
  '{{pontoTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{pontoTextoAgenda}}',
].join('\n')

const PONTO_FIELDS: OsTemplateField[] = [
  {
    id: 'segmento',
    label: 'Tipo de cliente',
    control: 'select',
    highlight: true,
    defaultValue: SEGMENTO_PF,
    section: S_ID,
    layout: { md: 8 },
    options: SEGMENTO_OPTS,
  },
  {
    id: 'troca',
    label: 'Troca do roteador primário',
    control: 'select',
    defaultValue: TROCA_NAO,
    section: S_ID,
    layout: { md: 4 },
    options: TROCA_OPTS,
  },
  {
    id: 'solicitante',
    label: 'Nome do solicitante',
    control: 'text',
    placeholder: 'Nome completo de quem solicitou',
    section: S_ID,
    layout: { md: 8 },
    showWhen: { field: 'segmento', equals: SEGMENTO_PJ },
  },
  {
    id: 'cargo',
    label: 'Cargo',
    control: 'text',
    placeholder: 'Sócio, Gerente, Técnico, ...',
    section: S_ID,
    layout: { md: 4 },
    showWhen: { field: 'segmento', equals: SEGMENTO_PJ },
  },
  {
    id: 'cliente',
    label: 'Nome completo / Razão social',
    control: 'text',
    placeholder: 'Nome completo (PF) ou razão social (PJ)',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 3 },
    options: CANAL_OPTS,
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 3 },
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
    id: 'formaPag',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: FORMA_PAG_OPTS,
  },
  {
    id: 'parcela',
    label: 'Parcelas',
    control: 'select',
    section: S_AGE,
    layout: { md: 3 },
    options: PARCELA_OPTS,
  },
  {
    id: 'protocolo',
    label: 'Nº Protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 3 },
  },
]

export function getPontoAdicionalDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'wifi-extend-ponto',
    title: 'Ponto adicional — roteador',
    demandCategory: 'wifi-extend',
    outputTemplate: PONTO_ADICIONAL_OUTPUT,
    fields: PONTO_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Atenção',
      items: [
        'O gerador deste tipo de O.S não fornece o texto de protocolo. Por ser um tipo de atendimento muito relativo, o operador deve descrever no protocolo os detalhes do que foi tratado.',
        'Sem renovação da fidelidade. Apenas a compra do equipamento.',
      ],
    },
  }
}
