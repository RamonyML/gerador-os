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

const PLANO_150 = [
  { value: '150 MEGA; MENSALIDADE: R$59,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '150 Mega — R$59,90 (CDNTV)' },
  { value: '150 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$80,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '150 Mega — R$80,00 + IP Dinâmico' },
  { value: '150 MEGA + IP FIXO; MENSALIDADE: R$259,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '150 Mega — R$259,90 + IP Fixo' },
]
const PLANO_300 = [
  { value: '300 MEGA; MENSALIDADE: R$69,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega — R$69,90 (CDNTV)' },
  { value: '300 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$90,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega — R$90,00 + IP Dinâmico' },
  { value: '300 MEGA + IP FIXO; MENSALIDADE: R$269,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega — R$269,90 + IP Fixo' },
  { value: '300 MEGA + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$104,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '300 Mega + 1 Extend — R$104,90' },
]
const PLANO_600 = [
  { value: '600 MEGA; MENSALIDADE: R$79,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega — R$79,90 (CDNTV)' },
  { value: '600 MEGA + IP PÚBLICO DINAMICO; MENSALIDADE: R$100,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega — R$100,00 + IP Dinâmico' },
  { value: '600 MEGA + IP FIXO; MENSALIDADE: R$279,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega — R$279,90 + IP Fixo' },
  { value: '600 MEGA + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$114,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega + 1 Extend — R$114,90' },
  { value: '600 MEGA + 02 WI-FI EXTEND (02 ROTEADORES ADICIONAIS), MENSALIDADE: R$144,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega + 2 Extend — R$144,90' },
  { value: '600 MEGA + 03 WI-FI EXTEND (03 ROTEADORES ADICIONAIS), MENSALIDADE: R$174,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV)', label: '600 Mega + 3 Extend — R$174,90' },
]
const PLANO_1G = [
  { value: '1 GIGA (1.000 MEGA); MENSALIDADE: R$99,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$99,90 + VOD' },
  { value: '1 GIGA (1.000 MEGA) + IP PÚBLICO DINAMICO; MENSALIDADE: R$120,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$120,00 + IP Dinâmico + VOD' },
  { value: '1 GIGA (1.000 MEGA) + IP FIXO; MENSALIDADE: R$299,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga — R$299,90 + IP Fixo + VOD' },
  { value: '1 GIGA (1.000 MEGA) + 01 WI-FI EXTEND (ROTEADOR ADICIONAL), MENSALIDADE: R$134,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga + 1 Extend — R$134,90 + VOD' },
  { value: '1 GIGA (1.000 MEGA) + 02 WI-FI EXTEND (02 ROTEADORES ADICIONAIS), MENSALIDADE: R$164,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga + 2 Extend — R$164,90 + VOD' },
  { value: '1 GIGA (1.000 MEGA) + 03 WI-FI EXTEND (03 ROTEADORES ADICIONAIS), MENSALIDADE: R$194,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO AO APP MZ TV (CDNTV) COM MZ CINE-PLAY (VOD)', label: '1 Giga + 3 Extend — R$194,90 + VOD' },
]
const PLANO_ITTV = [
  { value: '600 MEGA/94,90 + MZTV (CDNTV+) + DEEZER PREMIUM (1 LICENÇA)', label: '600 Mega — R$94,90 + Deezer Premium' },
  { value: '600 MEGA/109,90 + MZTV (CDNTV+) + ITTV-PLUS (1 LICENÇA)', label: '600 Mega — R$109,90 + ITTV-Plus' },
  { value: '1000 MEGA/114,90 + MZTV (CDNTV+) + VOD + DEEZER PREMIUM (1 LICENÇA)', label: '1 Giga — R$114,90 + VOD + Deezer Premium' },
  { value: '1000 MEGA/129,90 + MZTV (CDNTV+) + VOD + ITTV-PLUS (1 LICENÇA)', label: '1 Giga — R$129,90 + VOD + ITTV-Plus' },
]

const INDICACAO_TECNICA = `INSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE, HABILITAR/ATIVAR PLANO ESCOLHIDO. CONFIGURAR REDE WI-FI, PADRONIZAR COM "NOME DO CLIENTE_MZNET", SOLICITAR ESCOLHA DA SENHA. CONECTAR TODOS DISPOSITIVOS QUE APRESENTAREM, REALIZAR TESTES DA FUNCIONALIDADE DA INTERNET, AFERIR PLANO COM DISPOSITIVOS DO CLIENTE E OUTROS QUE ESTIVEREM NO LOCAL, FOTOGRAFAR, FILMAR, COMPARAR E EXPLICAR. TESTAR ABRANGÊNCIA DA WI-FI E EXPLICAR SOBRE COBERTURA. CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS, ENTREGAR VIA DO CONTRATO E CARNÊ DE PAGAMENTO.`

export const INST_GRATIS_EMPRESARIAL_OUTPUT = '{{instTextoProtocolo}}\n\n{{instTextoOS}}'

function upper(v: unknown): string {
  return String(v ?? '').trim().toUpperCase()
}

function first(v: string): string {
  return v.split(/\s+/).filter(Boolean)[0] ?? ''
}

function digits(v: string): string {
  return v.replace(/\D/g, '')
}

export function buildInstGratisEmpresarialTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [k, val] of Object.entries(rawValues)) v[k] = String(val ?? '')

  const tipo = v.tipoSolicitacao || T_TITULAR_TERCEIRO
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
  const plano = ({ '150': v.plano150, '300': v.plano300, '600': v.plano600, '1g': v.plano1g, 'ittv': v.planoIttv } as Record<string, string>)[filtroPlano] ?? ''
  const vencimento = v.vencimento || ''
  const dataVisita = v.dataVisita || ''
  const horaVisita = v.horaVisita || ''

  const quem =
    tipo === T_TERCEIRO_TERCEIRO || tipo === T_TERCEIRO_TITULAR
      ? `${sp} (REPRESENTANTE DA EMPRESA DE ${cp})`
      : `${cp} (PROPRIETÁRIO DA EMPRESA)`

  const ending =
    tipo === T_TITULAR || tipo === T_TERCEIRO_TITULAR
      ? `${cp} (PROPRIETÁRIO) ACOMPANHARÁ A INSTALAÇÃO.`
      : `${cp} ASSINOU CONTRATO DIGITALMENTE E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR INSTALAÇÃO.`

  const textoProtocolo =
    `${quem} SOLICITOU ${canalStr} A INSTALAÇÃO DE INTERNET PARA O ENDEREÇO CITADO NA O.S, ` +
    `PLANO DE ACESSO: ${plano}; VENCIMENTO: DIA ${vencimento} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES. ` +
    `INSTALAÇÃO AGENDADA PARA ${dataVisita} ${horaVisita}. ${ending}`

  return { instTextoProtocolo: textoProtocolo, instTextoOS: INDICACAO_TECNICA }
}

const REP_SHOW: OsTemplateField['showWhen'] = {
  field: 'tipoSolicitacao',
  equals: [T_TITULAR_TERCEIRO, T_TERCEIRO_TERCEIRO, T_TERCEIRO_TITULAR],
}

export const INST_GRATIS_EMPRESARIAL_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'radio',
    defaultValue: T_TITULAR_TERCEIRO,
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
    label: 'Nome do proprietário da empresa',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'solicitante',
    label: 'Nome do representante autorizado',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
    showWhen: REP_SHOW,
  },
  {
    id: 'parente',
    label: 'Cargo / função',
    control: 'text',
    placeholder: 'Ex.: SÓCIO, GERENTE, FUNCIONÁRIO',
    section: S_ID,
    layout: { md: 4 },
    showWhen: REP_SHOW,
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

export function getInstGratisEmpresarialDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'inst-gratis-empresarial',
    title: 'Instalação grátis — Empresarial (PJ)',
    demandCategory: 'instalacao-gratis',
    outputTemplate: INST_GRATIS_EMPRESARIAL_OUTPUT,
    fields: INST_GRATIS_EMPRESARIAL_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Orientação — Instalação grátis empresarial',
      items: [
        'Selecione o tipo de solicitação: quem entrou em contato e quem estará presente na instalação.',
        'O proprietário da empresa é o titular do contrato — informe sempre o nome dele.',
        'Quando houver representante, informe o nome completo e o cargo/função (ex.: SÓCIO, GERENTE, FUNCIONÁRIO).',
        'O campo de representante aparece apenas nos tipos em que há terceiro envolvido.',
      ],
    },
  }
}
