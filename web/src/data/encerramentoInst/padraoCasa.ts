import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_BASICO = 'INFORMAÇÕES BÁSICAS'
const S_CABO = 'PASSAGEM DO CABO'
const S_PASSANTE = 'PASSANTE'
const S_EQUIP = 'EQUIPAMENTO'
const S_LOCAL = 'LOCALIZAÇÃO DA INSTALAÇÃO'
const S_TESTES = 'TESTES'
const S_APPS = 'APLICATIVOS'
const S_ELETRICA = 'INSTALAÇÃO ELÉTRICA'
const S_FINAL = 'DISPOSITIVOS E PAGAMENTO'

const ONU_OPTIONS = [
  { value: 'C-DATA', label: 'C-DATA' },
  { value: 'TENDA', label: 'TENDA' },
  { value: 'SHORELINE', label: 'SHORELINE' },
  { value: 'FIBERHOME', label: 'FIBERHOME' },
  { value: 'ZTE', label: 'ZTE' },
]


const ONT_OPTIONS = [
  { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
  { value: 'ONT TP-LINK X530v1', label: 'ONT TP-LINK X530v1' },
  { value: 'ONT TP-LINK X530v2', label: 'ONT TP-LINK X530v2' },
]

const DISPOSITIVO_OPTIONS = [
  { value: 'CELULAR', label: 'Celular' },
  { value: 'NOTEBOOK', label: 'Notebook' },
  { value: 'TABLET', label: 'Tablet' },
  { value: 'COMPUTADOR', label: 'Computador' },
  { value: 'SMART TV', label: 'Smart TV' },
]

const DISPOSITIVO_MZTV_OPTIONS = [
  { value: 'CELULAR', label: 'Celular' },
  { value: 'SMART TV', label: 'Smart TV' },
  { value: 'TABLET', label: 'Tablet' },
]

const LIGACAO_OPTIONS = [
  { value: 'Tomada Individual', label: 'Tomada Individual' },
  { value: 'Régua de Energia', label: 'Régua de Energia' },
  { value: 'T de Energia', label: 'T de Energia' },
  { value: 'Extensão Elétrica', label: 'Extensão Elétrica' },
  { value: 'Outro', label: 'Outro' },
]

const FORMA_PAG_OPTIONS = [
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'Cartão', label: 'Cartão' },
  { value: 'Mensalidade', label: 'Mensalidade' },
]

const TIPO_FIXACAO_OPTIONS = [
  { value: 'BUCHA E PARAFUSO', label: 'Bucha e parafuso' },
  { value: 'PARAFUSO', label: 'Parafuso' },
]

export const ENCE_PADRAO_CASA_FIELDS: OsTemplateField[] = [
  // ── BÁSICO ────────────────────────────────────────────────────────────────
  {
    id: 'sem_id_cto',
    label: 'CTO sem identificação?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'NÃO',
    section: S_BASICO,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'cto',
    label: 'CTO',
    control: 'text',
    placeholder: '0000-X',
    section: S_BASICO,
    layout: { xs: 12, sm: 3 },
    showWhen: { field: 'sem_id_cto', equals: 'NÃO' },
  },
  {
    id: 'sinal',
    label: 'Sinal',
    control: 'text',
    placeholder: '-XX.XXdBm',
    section: S_BASICO,
    layout: { xs: 12, sm: 3 },
  },
  {
    id: 'porta',
    label: 'Porta',
    control: 'text',
    section: S_BASICO,
    layout: { xs: 12, sm: 3 },
  },

  // ── CABO ──────────────────────────────────────────────────────────────────
  {
    id: 'passagem_cabo',
    label: 'Passagem do cabo drop',
    control: 'text',
    placeholder: 'Descreva a passagem do cabo',
    section: S_CABO,
    layout: { xs: 12 },
  },

  // ── PASSANTE ──────────────────────────────────────────────────────────────
  {
    id: 'possui_passante',
    label: 'Possui passante?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'NÃO',
    section: S_PASSANTE,
    layout: { xs: 12 },
  },
  {
    id: 'motivo_passante',
    label: 'Motivo do passante',
    control: 'text',
    placeholder: 'Descreva o motivo',
    section: S_PASSANTE,
    layout: { xs: 12 },
    showWhen: { field: 'possui_passante', equals: 'SIM' },
  },
  {
    id: 'local_passante',
    label: 'Local do passante',
    control: 'text',
    placeholder: 'Descreva o local',
    section: S_PASSANTE,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'possui_passante', equals: 'SIM' },
  },
  {
    id: 'autorizado_por',
    label: 'Autorizado por',
    control: 'text',
    placeholder: 'Nome de quem autorizou',
    section: S_PASSANTE,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'possui_passante', equals: 'SIM' },
  },

  // ── EQUIPAMENTO ───────────────────────────────────────────────────────────
  {
    id: 'tipo_equipamento',
    label: 'Tipo de equipamento instalado',
    control: 'radio',
    options: [
      { value: 'ONU + Roteador', label: 'ONU + Roteador' },
      { value: 'ONT', label: 'ONT' },
      { value: 'Somente ONU', label: 'Somente ONU' },
    ],
    section: S_EQUIP,
    layout: { xs: 12 },
  },
  // ONU + Roteador
  {
    id: 'onu',
    label: 'ONU',
    control: 'select',
    options: ONU_OPTIONS,
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  {
    id: 'mac_onu',
    label: 'MAC ONU',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    catalogCategoria: 'equipamentos',
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  {
    id: 'mac_roteador',
    label: 'MAC Roteador',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  // ONT
  {
    id: 'ont_select',
    label: 'ONT',
    control: 'select',
    options: ONT_OPTIONS,
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONT' },
  },
  {
    id: 'mac_ont_select',
    label: 'MAC ONT',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONT' },
  },
  // Somente ONU
  {
    id: 'somente_onu_select',
    label: 'ONU',
    control: 'select',
    options: ONU_OPTIONS,
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'Somente ONU' },
  },
  {
    id: 'mac_somente_onu',
    label: 'MAC ONU',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_EQUIP,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'Somente ONU' },
  },

  // ── LOCALIZAÇÃO ───────────────────────────────────────────────────────────
  {
    id: 'local_instalacao',
    label: 'Onde o equipamento ficou instalado',
    control: 'radio',
    options: [
      { value: 'SOLTO EM CIMA DO MÓVEL', label: 'Solto em cima do móvel' },
      { value: 'FIXADO NA PAREDE', label: 'Fixado na parede' },
      { value: 'FIXADO NO MÓVEL', label: 'Fixado no móvel' },
    ],
    section: S_LOCAL,
    layout: { xs: 12 },
  },
  {
    id: 'descricao_movel',
    label: 'Descreva o móvel',
    control: 'text',
    placeholder: 'Ex: mesa de centro, estante...',
    section: S_LOCAL,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'local_instalacao', equals: 'SOLTO EM CIMA DO MÓVEL' },
  },
  {
    id: 'motivo_nao_fixado',
    label: 'Motivo de não fixar',
    control: 'textarea',
    section: S_LOCAL,
    layout: { xs: 12 },
    showWhen: { field: 'local_instalacao', equals: 'SOLTO EM CIMA DO MÓVEL' },
  },
  {
    id: 'tipo_fixacao_movel',
    label: 'Tipo de fixação',
    control: 'select',
    options: TIPO_FIXACAO_OPTIONS,
    section: S_LOCAL,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'local_instalacao', equals: 'FIXADO NO MÓVEL' },
  },

  // ── TESTES ────────────────────────────────────────────────────────────────
  {
    id: 'teste_notebook',
    label: 'Teste notebook técnico (Mega)',
    control: 'text',
    placeholder: 'Ex: 300',
    section: S_TESTES,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'dispositivo_teste',
    label: 'Dispositivo do cliente',
    control: 'select',
    options: DISPOSITIVO_OPTIONS,
    section: S_TESTES,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'marca_modelo_teste',
    label: 'Marca/Modelo',
    control: 'text',
    section: S_TESTES,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'velocidade_teste',
    label: 'Velocidade do cliente (Mega)',
    control: 'text',
    section: S_TESTES,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'teste_cobertura',
    label: 'Nome do cliente (teste de cobertura Wi-Fi)',
    control: 'text',
    section: S_TESTES,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'eh_assinante',
    label: 'Esse cliente é o titular?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'SIM',
    section: S_TESTES,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'parentesco_cobertura',
    label: 'Grau de parentesco',
    control: 'text',
    section: S_TESTES,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'eh_assinante', equals: 'NÃO' },
  },

  // ── APPS ──────────────────────────────────────────────────────────────────
  {
    id: 'app_mznet_celular',
    label: 'App MZNET — celular instalado (marca/modelo)',
    control: 'text',
    placeholder: 'Deixe em branco se não instalou',
    section: S_APPS,
    layout: { xs: 12, sm: 8 },
  },
  {
    id: 'app_mztv',
    label: 'Instalou App MZTV ou CNDTV?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'NÃO',
    section: S_APPS,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'dispositivo_mztv',
    label: 'Dispositivo MZTV/CNDTV',
    control: 'select',
    options: DISPOSITIVO_MZTV_OPTIONS,
    section: S_APPS,
    layout: { xs: 12, sm: 4 },
    showWhen: { field: 'app_mztv', equals: 'SIM' },
  },

  // ── ELÉTRICA ──────────────────────────────────────────────────────────────
  {
    id: 'ligacao_eletrica',
    label: 'Ligação elétrica do equipamento',
    control: 'select',
    options: LIGACAO_OPTIONS,
    section: S_ELETRICA,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'observacao_ligacao_outros',
    label: 'Descrição da ligação elétrica',
    control: 'text',
    section: S_ELETRICA,
    layout: { xs: 12, sm: 8 },
    showWhen: { field: 'ligacao_eletrica', equals: 'Outro' },
  },
  {
    id: 'nome_cliente_energia',
    label: 'Nome do cliente (orientação sobre riscos elétricos)',
    control: 'text',
    section: S_ELETRICA,
    layout: { xs: 12, sm: 8 },
    showWhen: { field: 'ligacao_eletrica', equals: ['T de Energia', 'Extensão Elétrica'] },
  },

  // ── FINAL ─────────────────────────────────────────────────────────────────
  {
    id: 'dispositivos_conectados',
    label: 'Dispositivos conectados na rede',
    control: 'text',
    placeholder: 'Ex: 3 celulares, 1 smart tv',
    section: S_FINAL,
    layout: { xs: 12, sm: 8 },
  },
  {
    id: 'pagamento',
    label: 'Houve pagamento?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'NÃO',
    section: S_FINAL,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'valor_pagamento',
    label: 'Valor (R$)',
    control: 'text',
    placeholder: 'Ex: 50,00',
    section: S_FINAL,
    layout: { xs: 12, sm: 4 },
    showWhen: { field: 'pagamento', equals: 'SIM' },
  },
  {
    id: 'forma_pagamento',
    label: 'Forma de pagamento',
    control: 'select',
    options: FORMA_PAG_OPTIONS,
    section: S_FINAL,
    layout: { xs: 12, sm: 4 },
    showWhen: { field: 'pagamento', equals: 'SIM' },
  },
  {
    id: 'observacoes',
    label: 'Observações',
    control: 'textarea',
    placeholder: 'Opcional',
    section: S_FINAL,
    layout: { xs: 12 },
  },
]

export function buildEncPadraoCasaTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [k, val] of Object.entries(rawValues)) v[k] = String(val ?? '')

  function u(key: string): string {
    return (v[key] ?? '').trim().toUpperCase()
  }

  let t = 'PADRAO CASA:\n\n'

  // CTO / SINAL / PORTA
  t += (v.sem_id_cto === 'SIM' ? 'CTO: XXXX' : `CTO: ${u('cto')}`) + '\n'
  t += `SINAL: ${u('sinal')}\n`
  t += `PORTA: ${u('porta')}\n\n`

  // Passagem do cabo
  t += `PASSAGEM DO CABO DROP: ${u('passagem_cabo')} A PEDIDO DO CLIENTE.\n`

  // Passante
  if (v.possui_passante === 'SIM') {
    t += `POSSUI PASSANTE: SIM\n`
    t += `MOTIVO DO PASSANTE: ${u('motivo_passante')}\n`
    t += `LOCAL DO PASSANTE: ${u('local_passante')}\n`
    t += `AUTORIZADO POR: ${u('autorizado_por')}\n`
  }

  // Localização do equipamento
  const local = v.local_instalacao ?? ''
  let loc = ''
  if (local === 'SOLTO EM CIMA DO MÓVEL') {
    loc = `SOLTO EM CIMA DO MÓVEL: ${u('descricao_movel')}. MOTIVO DE NÃO FIXAR: ${u('motivo_nao_fixado')}. O CLIENTE ESTÁ CIENTE DOS RISCOS CASO O EQUIPAMENTO SOFRA DANO POR QUEDA.`
  } else if (local === 'FIXADO NA PAREDE') {
    loc = 'FIXADO NA PAREDE COM BUCHA E PARAFUSO A PEDIDO DO CLIENTE.'
  } else if (local === 'FIXADO NO MÓVEL') {
    loc = `FIXADO NO MÓVEL COM ${u('tipo_fixacao_movel')} A PEDIDO DO CLIENTE.`
  }

  // Equipamento
  const tipo = v.tipo_equipamento ?? ''
  if (tipo === 'ONU + Roteador') {
    t += `ONU ${u('onu')} MAC ${u('mac_onu')} ${loc}\n`
    t += `ROTEADOR ${u('roteador')} MAC ${u('mac_roteador')} ${loc}\n`
  } else if (tipo === 'ONT') {
    t += `ONT ${u('ont_select')} MAC ${u('mac_ont_select')} ${loc}\n`
  } else if (tipo === 'Somente ONU') {
    t += `ONU ${u('somente_onu_select')} MAC ${u('mac_somente_onu')} ${loc}\n`
  }

  // Testes de velocidade
  t += `TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU ${(v.teste_notebook ?? '').trim()} MEGA DE DOWNLOAD.\n`
  t += `TESTE FEITO NO ${u('dispositivo_teste')} ${u('marca_modelo_teste')} DO CLIENTE AFERIU ${(v.velocidade_teste ?? '').trim()} MEGA DE DOWNLOAD.\n`

  // Alerta T de Energia / Extensão
  const lig = v.ligacao_eletrica ?? ''
  if (lig === 'T de Energia' || lig === 'Extensão Elétrica') {
    const nce = u('nome_cliente_energia')
    if (nce) {
      t += `CLIENTE: ${nce} ACOMPANHOU A ORDEM DE SERVIÇO E ESTÁ CIENTE DE QUE O ADAPTADOR PODE DESLIGAR OU ATÉ MESMO QUEIMAR OS EQUIPAMENTOS EMPRESTADOS EM COMODATO.\n`
    }
  }

  // Teste de cobertura
  const nomeCob = u('teste_cobertura')
  t += `TESTE DE COBERTURA WI-FI FOI REALIZADO NA PRESENÇA DE ${nomeCob}`
  if (v.eh_assinante === 'NÃO') {
    t += ` (${u('parentesco_cobertura')})`
  }
  t += '.\n'

  // App MZNET
  const appMznet = u('app_mznet_celular')
  if (appMznet) {
    t += `APP MZNET: CELULAR ${appMznet} DE ${nomeCob}, ESTE APP CONCEDE ACESSO AOS BOLETOS E CONTRATO.\n`
  }

  // App MZTV / CNDTV
  if (v.app_mztv === 'SIM') {
    t += `APP MZTV OU CNDTV: SIM - DISPOSITIVO: ${u('dispositivo_mztv')}\n`
  } else {
    t += 'APP MZTV OU CNDTV: NÃO\n'
  }

  // Ligação elétrica
  if (lig === 'Outro') {
    t += `LIGAÇÕES ELÉTRICAS: ${u('observacao_ligacao_outros')}\n`
  } else {
    t += `LIGAÇÕES ELÉTRICAS: ${lig.toUpperCase()}\n`
    t += `${nomeCob} FOI ORIENTADO SOBRE OS RISCOS DE USAR T DE ENERGIA.\n`
  }

  // Dispositivos
  t += `DISPOSITIVOS CONECTADOS NA REDE: ${u('dispositivos_conectados')}\n`

  // Pagamento
  if (v.pagamento === 'SIM') {
    t += 'PAGAMENTO (X)SIM ( )NAO\n'
    t += `\nVALOR R$: ${(v.valor_pagamento ?? '').trim()}\n`
    t += `FORMA PAGAMENTO ${u('forma_pagamento')}\n`
  } else {
    t += 'PAGAMENTO ( )SIM (X)NAO\n'
  }

  // Observações
  const obs = u('observacoes')
  if (obs) {
    t += `\nOBS.: ${obs}\n`
  }

  return { encTexto: t }
}

export function getEncPadraoCasaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'ence-padrao-casa',
    title: 'Encerramento — Padrão Casa',
    demandCategory: 'encerramentos-instalacao',
    outputTemplate: '{{encTexto}}',
    fields: ENCE_PADRAO_CASA_FIELDS.map((f) => ({ ...f })),
  }
}
