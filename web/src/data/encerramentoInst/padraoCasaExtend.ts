import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_BASICO = 'INFORMAÇÕES BÁSICAS'
const S_CABO = 'PASSAGEM DO CABO'
const S_PASSANTE = 'PASSANTE'
const S_PRIMARIO = 'PONTO PRIMÁRIO'
const S_LOCAL = 'LOCALIZAÇÃO (PONTO PRIMÁRIO)'
const S_TESTES_P = 'TESTES (PONTO PRIMÁRIO)'
const S_PONTOS = 'PONTOS ADICIONAIS'
const S_COBERTURA = 'COBERTURA E APPS'
const S_ELETRICA = 'LIGAÇÕES ELÉTRICAS'
const S_FINAL = 'DISPOSITIVOS E PAGAMENTO'

const ONU_OPTIONS = [
  { value: 'C-DATA', label: 'C-DATA' },
  { value: 'TENDA', label: 'TENDA' },
  { value: 'SHORELINE', label: 'SHORELINE' },
  { value: 'FIBERHOME', label: 'FIBERHOME' },
  { value: 'ZTE', label: 'ZTE' },
]

const ROTEADOR_EXTEND_OPTIONS = [
  { value: 'TP LINK EX511', label: 'TP LINK EX511' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ZTE H196-MESH', label: 'ZTE H196' },
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
  { value: 'PARTICULAR DO CLIENTE', label: 'Particular do cliente' },
]

const ONT_OPTIONS = [
  { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
  { value: 'ONT TP-LINK X530v1', label: 'ONT TP-LINK X530v1' },
  { value: 'ONT TP-LINK X530v2', label: 'ONT TP-LINK X530v2' },
]

const EQUIP_ADD_OPTIONS = [
  { value: 'ROTEADOR TP-LINK EX511', label: 'TP LINK EX511' },
  { value: 'ROTEADOR ZTE H196-MESH', label: 'ZTE H196' },
  { value: 'ROTEADOR ZTE H199-A', label: 'ZTE H199-A' },
  { value: 'EQUIPAMENTO PARTICULAR DO CLIENTE', label: 'Equipamento particular' },
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

const QTD_PONTOS_OPTIONS = [
  { value: '1', label: '1 ponto adicional (total 2)' },
  { value: '2', label: '2 pontos adicionais (total 3)' },
  { value: '3', label: '3 pontos adicionais (total 4)' },
]

// Campos para um ponto adicional (substituir {N} por 1, 2, 3)
function pontoCampos(n: 1 | 2 | 3, nomePonto: string): OsTemplateField[] {
  const show2 = ['2', '3'] as string[]
  const show3 = ['3'] as string[]
  const showWhen =
    n === 1
      ? undefined
      : n === 2
        ? { field: 'qtd_pontos_adicionais', equals: show2 }
        : { field: 'qtd_pontos_adicionais', equals: show3 }

  return [
    {
      id: `desc_ponto_${n}`,
      label: `Descrição do ponto ${nomePonto}`,
      control: 'text',
      placeholder: `Ex: QUARTO DOS FUNDOS`,
      section: S_PONTOS,
      layout: { xs: 12, sm: 8 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `equip_${n}`,
      label: `Equipamento (${nomePonto})`,
      control: 'select',
      options: EQUIP_ADD_OPTIONS,
      section: S_PONTOS,
      layout: { xs: 12, sm: 6 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `mac_equip_${n}`,
      label: `MAC equipamento (${nomePonto})`,
      control: 'text',
      placeholder: 'XX:XX:XX:XX:XX:XX',
      section: S_PONTOS,
      layout: { xs: 12, sm: 6 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `localizacao_equip_${n}`,
      label: `Localização/fixação (${nomePonto})`,
      control: 'text',
      placeholder: 'Ex: QUARTO, FIXADO NA PAREDE',
      section: S_PONTOS,
      layout: { xs: 12, sm: 8 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `teste_notebook_${n}`,
      label: `Teste notebook técnico — ${nomePonto} (Mega)`,
      control: 'text',
      section: S_PONTOS,
      layout: { xs: 12, sm: 4 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `dispositivo_${n}`,
      label: `Dispositivo cliente (${nomePonto})`,
      control: 'select',
      options: DISPOSITIVO_OPTIONS,
      section: S_PONTOS,
      layout: { xs: 12, sm: 4 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `marca_modelo_${n}`,
      label: `Marca/Modelo (${nomePonto})`,
      control: 'text',
      section: S_PONTOS,
      layout: { xs: 12, sm: 4 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `velocidade_${n}`,
      label: `Velocidade cliente — ${nomePonto} (Mega)`,
      control: 'text',
      section: S_PONTOS,
      layout: { xs: 12, sm: 4 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `ligacao_eletrica_${n}`,
      label: `Ligação elétrica (${nomePonto})`,
      control: 'select',
      options: LIGACAO_OPTIONS,
      section: S_PONTOS,
      layout: { xs: 12, sm: 5 },
      ...(showWhen ? { showWhen } : {}),
    },
    {
      id: `obs_ligacao_${n}`,
      label: `Descrição (${nomePonto})`,
      control: 'text',
      section: S_PONTOS,
      layout: { xs: 12, sm: 7 },
      showWhen: { field: `ligacao_eletrica_${n}`, equals: 'Outro' },
    },
  ]
}

export const ENCE_PADRAO_CASA_EXTEND_FIELDS: OsTemplateField[] = [
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

  // ── PONTOS ────────────────────────────────────────────────────────────────
  {
    id: 'qtd_pontos_adicionais',
    label: 'Quantidade de pontos adicionais (além do primário)',
    control: 'select',
    options: QTD_PONTOS_OPTIONS,
    defaultValue: '1',
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
  },

  // ── PONTO PRIMÁRIO ────────────────────────────────────────────────────────
  {
    id: 'descricao_ponto_primario',
    label: 'Descrição do ponto primário',
    control: 'text',
    placeholder: 'Ex: SALA, FIXADO NA PAREDE',
    section: S_PRIMARIO,
    layout: { xs: 12 },
  },
  {
    id: 'tipo_equipamento',
    label: 'Tipo de equipamento (ponto primário)',
    control: 'radio',
    options: [{ value: 'ONU + Roteador', label: 'ONU + Roteador' }, { value: 'ONT', label: 'ONT' }],
    section: S_PRIMARIO,
    layout: { xs: 12 },
  },
  // ONU + Roteador
  {
    id: 'onu',
    label: 'ONU',
    control: 'select',
    options: ONU_OPTIONS,
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  {
    id: 'mac_onu',
    label: 'MAC ONU',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    options: ROTEADOR_EXTEND_OPTIONS,
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  {
    id: 'mac_roteador',
    label: 'MAC Roteador',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONU + Roteador' },
  },
  // ONT
  {
    id: 'ont_select',
    label: 'ONT',
    control: 'select',
    options: ONT_OPTIONS,
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONT' },
  },
  {
    id: 'mac_ont_select',
    label: 'MAC ONT',
    control: 'text',
    placeholder: 'XX:XX:XX:XX:XX:XX',
    section: S_PRIMARIO,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'tipo_equipamento', equals: 'ONT' },
  },

  // ── LOCALIZAÇÃO PONTO PRIMÁRIO ────────────────────────────────────────────
  {
    id: 'local_instalacao',
    label: 'Onde o equipamento ficou instalado (ponto primário)',
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

  // ── TESTES PONTO PRIMÁRIO ─────────────────────────────────────────────────
  {
    id: 'local_teste_notebook',
    label: 'Local do teste notebook (ex: SALA)',
    control: 'text',
    section: S_TESTES_P,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'teste_notebook',
    label: 'Velocidade notebook (Mega)',
    control: 'text',
    placeholder: 'Ex: 300',
    section: S_TESTES_P,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'local_teste_cliente',
    label: 'Local do teste cliente (ex: QUARTO)',
    control: 'text',
    section: S_TESTES_P,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'dispositivo_teste',
    label: 'Dispositivo do cliente',
    control: 'select',
    options: DISPOSITIVO_OPTIONS,
    section: S_TESTES_P,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'marca_modelo_teste',
    label: 'Marca/Modelo',
    control: 'text',
    section: S_TESTES_P,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'velocidade_teste',
    label: 'Velocidade cliente (Mega)',
    control: 'text',
    section: S_TESTES_P,
    layout: { xs: 12, sm: 4 },
  },

  // ── PONTOS ADICIONAIS ─────────────────────────────────────────────────────
  ...pontoCampos(1, 'SECUNDÁRIO'),
  ...pontoCampos(2, 'TERCEIRO'),
  ...pontoCampos(3, 'QUARTO'),

  // ── COBERTURA E APPS ──────────────────────────────────────────────────────
  {
    id: 'teste_cobertura',
    label: 'Nome do cliente (teste de cobertura Wi-Fi)',
    control: 'text',
    section: S_COBERTURA,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'eh_assinante',
    label: 'Esse cliente é o titular?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'SIM',
    section: S_COBERTURA,
    layout: { xs: 12, sm: 6 },
  },
  {
    id: 'parentesco_cobertura',
    label: 'Grau de parentesco',
    control: 'text',
    section: S_COBERTURA,
    layout: { xs: 12, sm: 6 },
    showWhen: { field: 'eh_assinante', equals: 'NÃO' },
  },
  {
    id: 'app_mznet_celular',
    label: 'App MZNET — celular instalado (marca/modelo)',
    control: 'text',
    placeholder: 'Deixe em branco se não instalou',
    section: S_COBERTURA,
    layout: { xs: 12, sm: 8 },
  },
  {
    id: 'app_mztv',
    label: 'Instalou App MZTV ou CNDTV?',
    control: 'radio',
    options: [{ value: 'SIM', label: 'SIM' }, { value: 'NÃO', label: 'NÃO' }],
    defaultValue: 'NÃO',
    section: S_COBERTURA,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'dispositivo_mztv',
    label: 'Dispositivo MZTV/CNDTV',
    control: 'select',
    options: DISPOSITIVO_MZTV_OPTIONS,
    section: S_COBERTURA,
    layout: { xs: 12, sm: 4 },
    showWhen: { field: 'app_mztv', equals: 'SIM' },
  },

  // ── LIGAÇÕES ELÉTRICAS ────────────────────────────────────────────────────
  {
    id: 'local_ligacao_primario',
    label: 'Local da ligação elétrica (ponto primário)',
    control: 'text',
    placeholder: 'Ex: SALA, QUARTO',
    section: S_ELETRICA,
    layout: { xs: 12, sm: 4 },
  },
  {
    id: 'ligacao_eletrica',
    label: 'Ligação elétrica (ponto primário)',
    control: 'select',
    options: LIGACAO_OPTIONS,
    section: S_ELETRICA,
    layout: { xs: 12, sm: 5 },
  },
  {
    id: 'observacao_ligacao_outros',
    label: 'Descrição da ligação (ponto primário)',
    control: 'text',
    section: S_ELETRICA,
    layout: { xs: 12, sm: 7 },
    showWhen: { field: 'ligacao_eletrica', equals: 'Outro' },
  },
  {
    id: 'nome_cliente_energia',
    label: 'Nome do cliente (orientação elétrica)',
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

const NOMES_PONTOS = ['SECUNDÁRIO', 'TERCEIRO', 'QUARTO']

function formatMac(raw: string): string {
  return raw.trim().toUpperCase().replace(/:/g, '-')
}

// Normaliza nome de equipamento adicional (TP-LINK → TP LINK)
function normEquip(raw: string): string {
  return raw.toUpperCase().replace(/TP[- ]?LINK[ -]?/gi, 'TP LINK ')
}

// Resolve modelo ONT (X530vX → 530)
function resolveOntModelo(raw: string): string {
  const up = raw.toUpperCase()
  return up.includes('530') ? '530' : up
}

export function buildEncPadraoCasaExtendTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [k, val] of Object.entries(rawValues)) v[k] = String(val ?? '')

  function u(key: string): string {
    return (v[key] ?? '').trim().toUpperCase()
  }
  function raw(key: string): string {
    return (v[key] ?? '').trim()
  }

  let t = 'PADRAO CASA - EXTEND\n\n'

  // CTO / SINAL / PORTA
  t += (v.sem_id_cto === 'SIM' ? 'CTO: XXXX' : `CTO: ${u('cto')}`) + '\n'
  t += `SINAL: ${u('sinal')}\n`
  t += `PORTA: ${u('porta')}\n\n`

  // Passagem do cabo (Extend: sem "A PEDIDO DO CLIENTE", tem período e \n\n)
  t += `PASSAGEM DO CABO DROP: ${u('passagem_cabo')}.\n\n`

  // Passante
  if (v.possui_passante === 'SIM') {
    t += `POSSUI PASSANTE: SIM\n`
    t += `MOTIVO DO PASSANTE: ${u('motivo_passante')}\n`
    t += `LOCAL DO PASSANTE: ${u('local_passante')}\n`
    t += `AUTORIZADO POR: ${u('autorizado_por')}\n`
  }

  // Ponto primário — descrição
  t += `>>> EQUIPAMENTO ${u('descricao_ponto_primario')}.\n\n`

  // Localização (Extend usa texto diferente do Casa/Empresa)
  const local = v.local_instalacao ?? ''
  let loc = ''
  if (local === 'SOLTO EM CIMA DO MÓVEL') {
    loc = `SOLTO EM CIMA DO MÓVEL: ${u('descricao_movel')}. MOTIVO DE NÃO FIXAR: ${u('motivo_nao_fixado')}. O CLIENTE ESTÁ CIENTE DOS RISCOS CASO O EQUIPAMENTO SOFRA DANO POR QUEDA.`
  } else if (local === 'FIXADO NA PAREDE') {
    loc = 'EQUIPAMENTO FIXADO NA PAREDE COM AUTORIZAÇÃO DO CLIENTE.'
  } else if (local === 'FIXADO NO MÓVEL') {
    loc = `EQUIPAMENTO FIXADO NO MÓVEL COM ${u('tipo_fixacao_movel')} A PEDIDO DO CLIENTE.`
  }

  // Equipamento primário (MAC com : → -)
  const tipo = v.tipo_equipamento ?? ''
  if (tipo === 'ONU + Roteador') {
    t += `ONU ${u('onu')} MAC:${formatMac(v.mac_onu ?? '')} ${loc}\n`
    t += `ROTEADOR ${u('roteador')} MAC:${formatMac(v.mac_roteador ?? '')} ${loc}\n\n`
  } else if (tipo === 'ONT') {
    t += `ONT ${resolveOntModelo(v.ont_select ?? '')} MAC:${formatMac(v.mac_ont_select ?? '')} ${loc}\n\n`
  }

  // Testes ponto primário (com local)
  t += `TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU ${raw('teste_notebook')} MEGA DE DOWNLOAD ${u('local_teste_notebook')}\n\n`
  t += `TESTE FEITO NO ${u('dispositivo_teste')} ${u('marca_modelo_teste')} DO CLIENTE AFERIU ${raw('velocidade_teste')} MEGA DE DOWNLOAD ${u('local_teste_cliente')}.\n\n`

  // Pontos adicionais
  const qtd = parseInt(v.qtd_pontos_adicionais ?? '1', 10) || 1
  for (let i = 1; i <= qtd; i++) {
    const nome = NOMES_PONTOS[i - 1] ?? `${i + 1}º`
    const equipRaw = v[`equip_${i}`] ?? ''
    const equipNome = normEquip(String(equipRaw))
    const macEquip = formatMac(v[`mac_equip_${i}`] ?? '')
    const locEquip = u(`localizacao_equip_${i}`)

    t += `----------\n\n`
    t += `>>> EQUIPAMENTO PONTO ${nome} ${u(`desc_ponto_${i}`)}.\n\n`
    t += `${equipNome} MAC:${macEquip} ${locEquip}.\n\n`
    t += `TESTE REALIZADO NO NOTEBOOK DO TÉCNICO, VIA CABO, AFERIU ${raw(`teste_notebook_${i}`)} MEGA DE DOWNLOAD.\n\n`
    t += `TESTE FEITO NO ${u(`dispositivo_${i}`)} ${u(`marca_modelo_${i}`)} DO CLIENTE AFERIU ${raw(`velocidade_${i}`)} MEGA DE DOWNLOAD\n\n`
  }

  // Teste de cobertura (Extend: "DO CLIENTE" ao invés de "DE")
  const nomeCob = u('teste_cobertura')
  const nceRaw = u('nome_cliente_energia')
  t += `TESTE DE COBERTURA WI-FI FOI REALIZADO NA PRESENÇA DO CLIENTE ${nomeCob}`
  if (v.eh_assinante === 'NÃO') {
    t += ` (${u('parentesco_cobertura')})`
  }
  if (nceRaw) {
    t += ` E ${nceRaw}`
  }
  t += '.\n'

  // App MZNET (Extend: TITULAR ou DO CLIENTE (parentesco))
  const appMznet = u('app_mznet_celular')
  if (appMznet) {
    t += `APP MZNET: CELULAR ${appMznet}`
    if (v.eh_assinante === 'NÃO') {
      t += ` DO CLIENTE ${nomeCob} (${u('parentesco_cobertura')})`
    } else {
      t += ` TITULAR ${nomeCob}`
    }
    t += `, ESTE APP CONCEDE ACESSO AOS BOLETOS E CONTRATO.\n`
  }

  // App MZTV (Extend: só o dispositivo, não "SIM - DISPOSITIVO:")
  if (v.app_mztv === 'SIM') {
    t += `APP MZTV OU CNDTV: ${u('dispositivo_mztv')}\n`
  } else {
    t += 'APP MZTV OU CNDTV: NÃO\n'
  }

  // Ligações elétricas — ponto primário (sem período no final)
  const ligP = v.ligacao_eletrica ?? ''
  const localLigP = u('local_ligacao_primario')
  t += `LIGAÇÕES ELÉTRICAS PONTO PRIMARIO ${localLigP} A FONTE FICOU LIGADA EM `
  t += ligP === 'Outro' ? u('observacao_ligacao_outros') : ligP.toUpperCase()
  t += '\n'

  // Ligações elétricas — pontos adicionais (com período no final)
  for (let i = 1; i <= qtd; i++) {
    const nome = NOMES_PONTOS[i - 1] ?? `${i + 1}º`
    const ligAdd = v[`ligacao_eletrica_${i}`] ?? ''
    const obsAdd = u(`obs_ligacao_${i}`)
    t += `LIGAÇÕES ELÉTRICAS PONTO ${nome} A FONTE FICOU LIGADA EM `
    t += ligAdd === 'Outro' ? obsAdd : String(ligAdd).toUpperCase()
    t += '.\n'
  }

  // Alerta T de Energia (se qualquer ponto usa T de Energia ou Extensão)
  const allLigs = [ligP, ...Array.from({ length: qtd }, (_, i) => v[`ligacao_eletrica_${i + 1}`] ?? '')]
  const temTEnergia = allLigs.some(
    (l) => String(l) === 'T de Energia' || String(l) === 'Extensão Elétrica',
  )
  if (temTEnergia) {
    const nomes: string[] = []
    if (nomeCob) nomes.push(nomeCob)
    if (nceRaw) nomes.push(nceRaw)
    if (nomes.length > 0) {
      t += `\n${nomes.join(' E ')} ACOMPANHOU A ORDEM DE SERVIÇO E ESTÁ CIENTE DE QUE O ADAPTADOR PODE DESLIGAR OU ATÉ MESMO QUEIMAR OS EQUIPAMENTOS EMPRESTADOS EM COMODATO. `
    }
  }

  // Dispositivos
  t += `DISPOSITIVOS CONECTADOS NA REDE: ${u('dispositivos_conectados')}\n`

  // Pagamento (Extend: formato diferente — valor e PAGAMENTO na mesma linha)
  if (v.pagamento === 'SIM') {
    t += `VALOR R$: ${raw('valor_pagamento')} PAGAMENTO (X)SIM ( )NAO\n`
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

export function getEncPadraoCasaExtendDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'ence-padrao-casa-extend',
    title: 'Encerramento — Padrão Casa (Wi-Fi Extend)',
    demandCategory: 'encerramentos-instalacao',
    outputTemplate: '{{encTexto}}',
    fields: ENCE_PADRAO_CASA_EXTEND_FIELDS.map((f) => ({ ...f })),
  }
}
