import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_INST = 'DETALHES DA INSTALAÇÃO'
const S_KIT = 'TESTES NO KIT DO TÉCNICO'
const S_CLI = 'TESTES NO DISPOSITIVO DO CLIENTE'
const S_ELET = 'INSTALAÇÃO ELÉTRICA'
const S_APPS = 'BENEFÍCIOS / APLICATIVOS'
const S_CUST = 'CUSTOS E PAGAMENTO'

export const TIPO_TROCA_COM = 'com-troca'
export const TIPO_TROCA_SEM = 'sem-troca'

const ONU_OPTS = [
  { value: 'C-DATA', label: 'C-DATA' },
  { value: 'ZTE', label: 'ZTE' },
  { value: 'TENDA', label: 'TENDA' },
  { value: 'SHORELINE', label: 'SHORELINE' },
  { value: 'FIBERHOME', label: 'FIBERHOME' },
]

const FIXACAO_OPTS = [
  { value: 'SIM', label: 'Sim (bucha e parafuso)' },
  { value: 'NÃO', label: 'Não (solto)' },
]

const DISPOSITIVO_OPTS = [
  { value: 'CELULAR', label: 'Celular' },
  { value: 'COMPUTADOR', label: 'Computador' },
  { value: 'NOTEBOOK', label: 'Notebook' },
  { value: 'SMART TV', label: 'Smart TV' },
  { value: 'TABLET', label: 'Tablet' },
]

const MEIO_OPTS = [
  { value: 'WI-FI 2.4G', label: 'Wi-Fi 2.4G' },
  { value: 'WI-FI 5G', label: 'Wi-Fi 5G' },
  { value: 'CABO', label: 'Cabo' },
]

const LIGACAO_OPTS = [
  { value: 'TOMADA INDIVIDUAL', label: 'Tomada Individual' },
  { value: 'T/BENJAMIN', label: 'T/Benjamin' },
  { value: 'RÉGUA', label: 'Régua' },
  { value: 'EXTENSÃO', label: 'Extensão' },
  { value: 'OUTROS', label: 'Outros' },
]

const PAGAMENTO_OPTS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTÃO', label: 'Cartão' },
]

export const ENCE_ALTPLAN_REMOTO_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoTroca',
    label: 'Houve troca de roteador?',
    control: 'radio',
    highlight: true,
    defaultValue: TIPO_TROCA_SEM,
    options: [
      { value: TIPO_TROCA_SEM, label: 'Sem troca (roteador já instalado)' },
      { value: TIPO_TROCA_COM, label: 'Com troca (substituiu roteador)' },
    ],
    layout: { xs: 12 },
  },

  // ── SEM TROCA ─────────────────────────────────────────────────────────────
  {
    id: 'rotSemTroca',
    label: 'Roteador (já instalado)',
    control: 'select',
    section: S_INST,
    catalogCategoria: 'equipamentos',
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipoTroca', equals: TIPO_TROCA_SEM },
  },
  {
    id: 'macRotSemTroca',
    label: 'MAC do roteador',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_INST,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipoTroca', equals: TIPO_TROCA_SEM },
  },

  // ── COM TROCA ─────────────────────────────────────────────────────────────
  {
    id: 'rotRetirou',
    label: 'Roteador retirado',
    control: 'select',
    section: S_INST,
    catalogCategoria: 'equipamentos',
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipoTroca', equals: TIPO_TROCA_COM },
  },
  {
    id: 'macRotRetirou',
    label: 'MAC do roteador retirado',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_INST,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipoTroca', equals: TIPO_TROCA_COM },
  },
  {
    id: 'rotInstalou',
    label: 'Roteador instalado',
    control: 'select',
    section: S_INST,
    catalogCategoria: 'equipamentos',
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipoTroca', equals: TIPO_TROCA_COM },
  },
  {
    id: 'macRotInstalou',
    label: 'MAC do roteador instalado',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_INST,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipoTroca', equals: TIPO_TROCA_COM },
  },

  // ── ONU (COMPARTILHADO) ───────────────────────────────────────────────────
  {
    id: 'onu',
    label: 'ONU',
    control: 'select',
    section: S_INST,
    options: ONU_OPTS,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'macONU',
    label: 'MAC da ONU',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_INST,
    layout: { xs: 12, sm: 6 },
  },

  // ── FIXAÇÃO ───────────────────────────────────────────────────────────────
  {
    id: 'fixacaoRoteador',
    label: 'Roteador fixado com bucha e parafuso?',
    control: 'select',
    section: S_INST,
    defaultValue: 'SIM',
    options: FIXACAO_OPTS,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'localRoteador',
    label: 'Localização do roteador',
    control: 'text',
    placeholder: 'Descreva onde está posicionado',
    section: S_INST,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'fixacaoRoteador', equals: 'NÃO' },
  },
  {
    id: 'fixacaoONU',
    label: 'ONU fixada com bucha e parafuso?',
    control: 'select',
    section: S_INST,
    defaultValue: 'SIM',
    options: FIXACAO_OPTS,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'localONU',
    label: 'Localização da ONU',
    control: 'text',
    placeholder: 'Descreva onde está posicionada',
    section: S_INST,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'fixacaoONU', equals: 'NÃO' },
  },

  // ── TESTES KIT ────────────────────────────────────────────────────────────
  {
    id: 'testeCabo',
    label: 'Velocidade via cabo (Mbps)',
    control: 'text',
    placeholder: 'Ex: 600',
    section: S_KIT,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'testeWifi',
    label: 'Velocidade via Wi-Fi 5G (Mbps)',
    control: 'text',
    placeholder: 'Ex: 450',
    section: S_KIT,
    layout: { xs: 12, sm: 6 },
  },

  // ── TESTES CLIENTE ────────────────────────────────────────────────────────
  {
    id: 'dispositivo1',
    label: 'Dispositivo 1',
    control: 'select',
    section: S_CLI,
    options: DISPOSITIVO_OPTS,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'marcaModelo1',
    label: 'Marca/Modelo',
    control: 'text',
    section: S_CLI,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'velocidade1',
    label: 'Velocidade aferida (Mbps)',
    control: 'text',
    section: S_CLI,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'meioAfericao1',
    label: 'Meio de aferição',
    control: 'select',
    section: S_CLI,
    options: MEIO_OPTS,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'dispositivo2',
    label: 'Dispositivo 2',
    control: 'select',
    section: S_CLI,
    options: DISPOSITIVO_OPTS,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'marcaModelo2',
    label: 'Marca/Modelo',
    control: 'text',
    section: S_CLI,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'velocidade2',
    label: 'Velocidade aferida (Mbps)',
    control: 'text',
    section: S_CLI,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'meioAfericao2',
    label: 'Meio de aferição',
    control: 'select',
    section: S_CLI,
    options: MEIO_OPTS,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'aparelhoCompativel',
    label: 'Aparelho do cliente é compatível com a velocidade?',
    control: 'radio',
    defaultValue: 'É',
    section: S_CLI,
    options: [
      { value: 'É', label: 'Sim (é compatível)' },
      { value: 'NÃO É', label: 'Não é compatível' },
    ],
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'testeCobertura',
    label: 'Realizou testes de cobertura Wi-Fi?',
    control: 'radio',
    defaultValue: 'SIM',
    section: S_CLI,
    options: [
      { value: 'SIM', label: 'Sim' },
      { value: 'NÃO', label: 'Não' },
    ],
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'motivoNaoTeste',
    label: 'Motivo de não testar cobertura',
    control: 'text',
    section: S_CLI,
    layout: { xs: 12 },
    showWhen: { field: 'testeCobertura', equals: 'NÃO' },
  },

  // ── ELÉTRICA ──────────────────────────────────────────────────────────────
  {
    id: 'ligacaoEletrica',
    label: 'Ligação elétrica (conectado em)',
    control: 'select',
    section: S_ELET,
    options: LIGACAO_OPTS,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'observacaoLigacao',
    label: 'Descrição da ligação elétrica',
    control: 'text',
    section: S_ELET,
    layout: { xs: 12 },
    showWhen: { field: 'ligacaoEletrica', equals: 'OUTROS' },
  },

  // ── APLICATIVOS ───────────────────────────────────────────────────────────
  {
    id: 'appMznet',
    label: 'MZNET-PLAY instalado (marca/modelo do dispositivo)',
    control: 'text',
    placeholder: 'Deixe em branco se não instalou',
    section: S_APPS,
    layout: { xs: 12 },
  },
  {
    id: 'appMznetPlus',
    label: 'MZNET-PLAY PLUS (ITTV) instalado (marca/modelo)',
    control: 'text',
    placeholder: 'Deixe em branco se não instalou',
    section: S_APPS,
    layout: { xs: 12 },
  },
  {
    id: 'appDeezer',
    label: 'DEEZER instalado (marca/modelo do dispositivo)',
    control: 'text',
    placeholder: 'Deixe em branco se não instalou',
    section: S_APPS,
    layout: { xs: 12 },
  },

  // ── CUSTOS ────────────────────────────────────────────────────────────────
  {
    id: 'custos',
    label: 'Ordem de serviço com custos?',
    control: 'radio',
    defaultValue: 'SEM',
    section: S_CUST,
    options: [
      { value: 'SEM', label: 'Não (sem custos)' },
      { value: 'COM', label: 'Sim (com custos)' },
    ],
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'valorCustos',
    label: 'Valor (R$)',
    control: 'text',
    placeholder: 'Ex: 50',
    section: S_CUST,
    layout: { xs: 12, sm: 4 },
    showWhen: { field: 'custos', equals: 'COM' },
  },
  {
    id: 'formaPagamento',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_CUST,
    options: PAGAMENTO_OPTS,
    layout: { xs: 12, sm: 4 },
    showWhen: { field: 'custos', equals: 'COM' },
  },
  {
    id: 'observacoes',
    label: 'Observações',
    control: 'text',
    placeholder: 'Opcional',
    section: S_CUST,
    layout: { xs: 12 },
  },
]

export function buildEncAltplanRemotoTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [k, val] of Object.entries(rawValues)) v[k] = String(val ?? '')

  function u(key: string): string {
    return (v[key] ?? '').trim().toUpperCase()
  }

  const comTroca = v.tipoTroca === TIPO_TROCA_COM

  let t = ''

  if (comTroca) {
    t += `DESINSTALEI ROTEADOR ${u('rotRetirou')} MAC: ${u('macRotRetirou')} E INSTALEI ROTEADOR ${u('rotInstalou')} MAC: ${u('macRotInstalou')}.\n`
  } else {
    t += `ROTEADOR JÁ INSTALADO ${u('rotSemTroca')} MAC: ${u('macRotSemTroca')}.\n`
  }

  t += `ONU ${u('onu')} JÁ INSTALADA, MAC ${u('macONU')}\n`
  t += `ROTEADOR FIXADO COM BUCHA E PARAFUSO: ${u('fixacaoRoteador')}\n`
  if (v.fixacaoRoteador === 'NÃO') {
    t += `LOCALIZAÇÃO DO EQUIPAMENTO: ${u('localRoteador')}\n`
  }
  t += `ONU FIXADA COM BUCHA E PARAFUSO: ${u('fixacaoONU')}\n`
  if (v.fixacaoONU === 'NÃO') {
    t += `LOCALIZAÇÃO DO EQUIPAMENTO: ${u('localONU')}\n`
  }

  const testeCabo = (v.testeCabo ?? '').replace(/\D/g, '')
  const testeWifi = (v.testeWifi ?? '').replace(/\D/g, '')
  t += `\nTESTE NO NOTEBOOK DO KIT VIA CABO ${testeCabo} MBPS\n`
  t += `TESTE NO NOTEBOOK DO KIT VIA WI-FI 5G ${testeWifi} MBPS\n`

  const vel1 = (v.velocidade1 ?? '').replace(/\D/g, '')
  t += `TESTE EM ${u('dispositivo1')} DO CLIENTE: ${u('marcaModelo1')} VIA ${u('meioAfericao1')} AFERIU A VELOCIDADE DE ${vel1} MBPS\n`

  const disp2 = (v.dispositivo2 ?? '').trim()
  if (disp2) {
    const vel2 = (v.velocidade2 ?? '').replace(/\D/g, '')
    t += `TESTE EM ${u('dispositivo2')} DO CLIENTE: ${u('marcaModelo2')} VIA ${u('meioAfericao2')} AFERIU A VELOCIDADE DE ${vel2} MBPS\n`
  }

  t += `APARELHO COMPATÍVEL: ${u('aparelhoCompativel')} COMPATÍVEL COM A VELOCIDADE CONTRATADA.\n`
  t += `REALIZOU TESTES DE COBERTURA WI-FI? ${u('testeCobertura')}\n`
  if (v.testeCobertura === 'NÃO') {
    t += `MOTIVO: ${u('motivoNaoTeste')}\n`
  }

  t += `\nLIGAÇÃO ELÉTRICA: ${u('ligacaoEletrica')}\n`
  if (comTroca) t += '\n'
  if (v.ligacaoEletrica === 'OUTROS') {
    t += `OBSERVAÇÃO: ${u('observacaoLigacao')}\n`
  }

  const appMznet = u('appMznet')
  if (appMznet) t += `APLICATIVO MZNET-PLAY INSTALADO EM: ${appMznet}\n`
  const appMznetPlus = u('appMznetPlus')
  if (appMznetPlus) t += `APLICATIVO MZNET-PLAY PLUS (ITTV) INSTALADO EM: ${appMznetPlus}\n`
  const appDeezer = u('appDeezer')
  if (appDeezer) t += `APLICATIVO DEEZER INSTALADO EM: ${appDeezer}\n`

  t += `\nO.S ${u('custos')} CUSTOS\n`
  if (v.custos === 'COM') {
    t += `VALOR: R$${(v.valorCustos ?? '').replace(/\D/g, '')}\n`
    t += `FORMA DE PAGAMENTO: ${u('formaPagamento')}\n`
  }

  t += `\nOBSERVAÇÕES: ${u('observacoes')}\n`
  t += '\nCLIENTE SEM DÚVIDAS.'

  return { encAltplanRemotoTexto: t }
}

export function getEncAltplanRemotoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'ence-altplan-remoto',
    title: 'Encerramento — Alt. Plano Remoto',
    demandCategory: 'encerramentos-instalacao',
    outputTemplate: '{{encAltplanRemotoTexto}}',
    fields: ENCE_ALTPLAN_REMOTO_FIELDS.map((f) => ({ ...f })),
  }
}
