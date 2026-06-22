import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import { HORARIOS_SABADO, HORARIOS_SEMANA } from './horarios'

const T_TITULAR = 'titular'
const T_TITULAR_TERCEIRO = 'titular_terceiro'
const T_TERCEIRO_TERCEIRO = 'terceiro_terceiro'
const T_TERCEIRO_TITULAR = 'terceiro_titular'

const S_SOLICITACAO = 'TIPO DE SOLICITAÇÃO'
const S_ID = 'IDENTIFICAÇÃO'
const S_PLANO = 'PLANO E AGENDAMENTO'

const CANAL_OPTIONS = [
  { value: 'PRESENCIALMENTE', label: 'Presencialmente' },
  { value: 'VIA LIGAÇÃO', label: 'Via ligação' },
  { value: 'VIA WHATSAPP', label: 'Via WhatsApp' },
  { value: 'VIA FACEBOOK', label: 'Via Facebook' },
]

const VENCIMENTO_OPTIONS = [
  { value: '5', label: 'Dia 5' },
  { value: '10', label: 'Dia 10' },
  { value: '15', label: 'Dia 15' },
  { value: '20', label: 'Dia 20' },
  { value: '25', label: 'Dia 25' },
]

const FORMA_PAG_OPTIONS = [
  { value: 'CARTÃO', label: 'Cartão' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
]

// Taxa planos agrupados por velocidade — valor inicia com taxa (R$250,00 ou R$350,00)
const PLANO_150 = [
  { value: 'R$250,00 150 MEGA; MENSALIDADE: R$59,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '150 Mega — R$59,90 (taxa R$250,00)' },
  { value: 'R$250,00 150 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$80,00; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '150 Mega — R$80,00 + IP Dinâmico (taxa R$250,00)' },
  { value: 'R$250,00 150 MEGA + IP FIXO; MENSALIDADE: R$259,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '150 Mega — R$259,90 + IP Fixo (taxa R$250,00)' },
]
const PLANO_300 = [
  { value: 'R$250,00 300 MEGA; MENSALIDADE: R$69,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega — R$69,90 (taxa R$250,00)' },
  { value: 'R$250,00 300 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$90,00; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega — R$90,00 + IP Dinâmico (taxa R$250,00)' },
  { value: 'R$250,00 300 MEGA + IP FIXO; MENSALIDADE: R$269,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega — R$269,90 + IP Fixo (taxa R$250,00)' },
  { value: 'R$250,00 300 MEGA + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$104,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega + 1 Extend — R$104,90 (taxa R$250,00)' },
]
const PLANO_600 = [
  { value: 'R$350,00 600 MEGA; MENSALIDADE: R$79,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega — R$79,90 (taxa R$350,00)' },
  { value: 'R$350,00 600 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$100,00; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega — R$100,00 + IP Dinâmico (taxa R$350,00)' },
  { value: 'R$350,00 600 MEGA + IP FIXO; MENSALIDADE: R$279,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega — R$279,90 + IP Fixo (taxa R$350,00)' },
  { value: 'R$350,00 600 MEGA + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$114,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega + 1 Extend — R$114,90 (taxa R$350,00)' },
  { value: 'R$350,00 600 MEGA + 02 WI-FI EXTEND (02 ROTEADORES ADICIONAIS), MENSALIDADE: R$144,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega + 2 Extend — R$144,90 (taxa R$350,00)' },
  { value: 'R$350,00 600 MEGA + 03 WI-FI EXTEND (03 ROTEADORES ADICIONAIS), MENSALIDADE: R$174,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega + 3 Extend — R$174,90 (taxa R$350,00)' },
]
const PLANO_1G = [
  { value: 'R$350,00 1 GIGA (1.000 MEGA); MENSALIDADE: R$99,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$99,90 + VOD (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA) + IP PÚBLICO DINAMICO; MENSALIDADE: R$120,00; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$120,00 + IP Dinâmico + VOD (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA) + IP FIXO; MENSALIDADE: R$299,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$299,90 + IP Fixo + VOD (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA) + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$134,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga + 1 Extend — R$134,90 + VOD (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA) + 02 WI-FI EXTEND (02 ROTEADORES ADICIONAIS), MENSALIDADE: R$164,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga + 2 Extend — R$164,90 + VOD (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA) + 03 WI-FI EXTEND (03 ROTEADORES ADICIONAIS), MENSALIDADE: R$194,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga + 3 Extend — R$194,90 + VOD (taxa R$350,00)' },
]
const PLANO_ITTV = [
  { value: 'R$350,00 600 MEGA; MENSALIDADE: R$94,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) + ITTV-PLUS', label: '600 Mega — R$94,90 + ITTV-Plus (taxa R$350,00)' },
  { value: 'R$350,00 600 MEGA; MENSALIDADE: R$109,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) + ITTV-PLUS', label: '600 Mega — R$109,90 + ITTV-Plus (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA); MENSALIDADE: R$114,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$114,90 + VOD ITTV (taxa R$350,00)' },
  { value: 'R$350,00 1 GIGA (1.000 MEGA); MENSALIDADE: R$129,90; BENEFÍCIOS: ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$129,90 + VOD ITTV (taxa R$350,00)' },
]

const INDICACAO_TECNICA = `INSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE, HABILITAR/ATIVAR PLANO ESCOLHIDO. CONFIGURAR REDE WI-FI, PADRONIZAR COM "NOME DO CLIENTE_MZNET", SOLICITAR ESCOLHA DA SENHA. CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. TESTAR ABRANGÊNCIA DA WI-FI E EXPLICAR SOBRE COBERTURA. CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS, ENTREGAR VIA DO CONTRATO E CARNÊ DE PAGAMENTO.`

export const INST_TAXA_RESIDENCIAL_OUTPUT = '{{instTextoProtocolo}}\n\n{{instTextoOS}}'

function upper(v: unknown): string {
  return String(v ?? '').trim().toUpperCase()
}

function first(v: string): string {
  return v.split(/\s+/).filter(Boolean)[0] ?? ''
}

function digits(v: string): string {
  return v.replace(/\D/g, '')
}

export function buildInstTaxaResidencialTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [k, val] of Object.entries(rawValues)) v[k] = String(val ?? '')

  const tipo = v.tipoSolicitacao || T_TITULAR
  const cp = first(upper(v.cliente))
  const sp = first(upper(v.solicitante || ''))
  const solicitante = upper(v.solicitante || '')
  const parente = upper(v.parente || '')
  const canal = v.canal || ''
  const canaisComContato = ['VIA LIGAÇÃO', 'VIA WHATSAPP']
  const canalStr = canaisComContato.includes(canal)
    ? `${canal} ${digits(v.contato || '')}`
    : canal
  const filtroPlano = v.filtroPlano || '150'
  const planoRaw = ({ '150': v.plano150, '300': v.plano300, '600': v.plano600, '1g': v.plano1g, 'ittv': v.planoIttv } as Record<string, string>)[filtroPlano] ?? ''
  // extrai taxa (primeira palavra, ex: "R$250,00") e detalhes do plano (o resto)
  const taxa = planoRaw.split(' ')[0] ?? ''
  const planoDetalhes = planoRaw.split(' ').slice(1).join(' ')
  const vencimento = v.vencimento || ''
  const dataVisita = v.dataVisita || ''
  const horaVisita = v.horaVisita || ''
  const formaPag = upper(v.formaPag || '')

  const quem =
    tipo === T_TERCEIRO_TERCEIRO || tipo === T_TERCEIRO_TITULAR
      ? `${sp} (${parente} DE ${cp})`
      : cp

  const ending =
    tipo === T_TITULAR || tipo === T_TERCEIRO_TITULAR
      ? `${cp} ACOMPANHARÁ INSTALAÇÃO.`
      : `${cp} ASSINOU CONTRATO DIGITALMENTE E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR INSTALAÇÃO.`

  const textoProtocolo =
    `${quem} SOLICITOU ${canalStr} A INSTALAÇÃO DE INTERNET PARA O ENDEREÇO CITADO NA O.S, ` +
    `PLANO DE ACESSO: ${planoDetalhes}; VENCIMENTO: DIA ${vencimento} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES. ` +
    `INSTALAÇÃO AGENDADA PARA ${dataVisita} ${horaVisita}. ${ending} ` +
    `TAXA DE INSTALAÇÃO/ATIVAÇÃO: ${taxa}, PAGAMENTO JÁ EFETUADO EM ${formaPag}.`

  return { instTextoProtocolo: textoProtocolo, instTextoOS: INDICACAO_TECNICA }
}

const TERCEIRO_SHOW: OsTemplateField['showWhen'] = {
  field: 'tipoSolicitacao',
  equals: [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR],
}

export const INST_TAXA_RESIDENCIAL_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'radio',
    defaultValue: T_TITULAR,
    highlight: true,
    section: S_SOLICITACAO,
    layout: { md: 12 },
    options: [
      { value: T_TITULAR, label: 'Titular solicita e acompanha' },
      { value: T_TITULAR_TERCEIRO, label: 'Titular solicita e autoriza terceiro' },
      { value: T_TERCEIRO_TERCEIRO, label: 'Terceiro solicita, titular autoriza terceiro' },
      { value: T_TERCEIRO_TITULAR, label: 'Terceiro solicita, titular acompanha' },
    ],
  },
  {
    id: 'cliente',
    label: 'Nome do titular (contrato)',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'solicitante',
    label: 'Nome do solicitante / terceiro',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
    showWhen: TERCEIRO_SHOW,
  },
  {
    id: 'parente',
    label: 'Parentesco / relação com o titular',
    control: 'text',
    placeholder: 'Ex.: ESPOSA, FILHO, VIZINHO',
    section: S_ID,
    layout: { md: 4 },
    showWhen: TERCEIRO_SHOW,
  },
  {
    id: 'canal',
    label: 'Canal de atendimento',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: CANAL_OPTIONS,
  },
  {
    id: 'contato',
    label: 'Número de contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 4 },
    showWhen: { field: 'canal', equals: ['VIA LIGAÇÃO', 'VIA WHATSAPP'] },
  },
  {
    id: 'filtroPlano',
    label: 'Velocidade',
    control: 'radio',
    defaultValue: '150',
    section: S_PLANO,
    layout: { md: 12 },
    options: [
      { value: '150', label: '150 Mb' },
      { value: '300', label: '300 Mb' },
      { value: '600', label: '600 Mb' },
      { value: '1g', label: '1 Gb' },
      { value: 'ittv', label: 'Outros (ITTV)' },
    ],
  },
  { id: 'plano150', label: 'Plano de acesso', control: 'select', section: S_PLANO, layout: { md: 12 }, options: PLANO_150, showWhen: { field: 'filtroPlano', equals: '150' } },
  { id: 'plano300', label: 'Plano de acesso', control: 'select', section: S_PLANO, layout: { md: 12 }, options: PLANO_300, showWhen: { field: 'filtroPlano', equals: '300' } },
  { id: 'plano600', label: 'Plano de acesso', control: 'select', section: S_PLANO, layout: { md: 12 }, options: PLANO_600, showWhen: { field: 'filtroPlano', equals: '600' } },
  { id: 'plano1g', label: 'Plano de acesso', control: 'select', section: S_PLANO, layout: { md: 12 }, options: PLANO_1G, showWhen: { field: 'filtroPlano', equals: '1g' } },
  { id: 'planoIttv', label: 'Plano de acesso', control: 'select', section: S_PLANO, layout: { md: 12 }, options: PLANO_ITTV, showWhen: { field: 'filtroPlano', equals: 'ittv' } },
  {
    id: 'vencimento',
    label: 'Dia de vencimento',
    control: 'select',
    section: S_PLANO,
    layout: { md: 3 },
    options: VENCIMENTO_OPTIONS,
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento da taxa',
    control: 'select',
    section: S_PLANO,
    layout: { md: 4 },
    options: FORMA_PAG_OPTIONS,
  },
  { id: 'dataVisita', label: 'Data da visita', control: 'date', placeholder: 'dd/mm/aaaa', section: S_PLANO, layout: { md: 3 } },
  {
    id: 'horaVisita',
    label: 'Horário',
    control: 'select',
    section: S_PLANO,
    layout: { md: 3 },
    optionsFromWeekday: {
      sourceField: 'dataVisita',
      byWeekday: { 6: HORARIOS_SABADO, 0: 'disabled' },
      defaultOptions: HORARIOS_SEMANA,
    },
  },
]

export function getInstTaxaResidencialDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'inst-taxa-residencial',
    title: 'Instalação com taxa — Residencial (PF)',
    demandCategory: 'instalacao-taxa',
    outputTemplate: INST_TAXA_RESIDENCIAL_OUTPUT,
    fields: INST_TAXA_RESIDENCIAL_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Instalação com taxa residencial',
      items: [
        'Selecione o tipo de solicitação correspondente à situação.',
        'A taxa de instalação (R$250,00 ou R$350,00) é determinada automaticamente pelo plano selecionado.',
        'Informe a forma de pagamento da taxa utilizada pelo cliente.',
        'Para variantes com terceiro, preencha o nome e o parentesco do terceiro.',
      ],
    },
  }
}
