import { ENCE_PADRAO_CASA_FIELDS } from './padraoCasa'
import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

// Padrão Empresa usa os mesmos campos do Padrão Casa — mesma estrutura de formulário.
export const ENCE_PADRAO_EMPRESA_FIELDS: OsTemplateField[] = ENCE_PADRAO_CASA_FIELDS

export function buildEncPadraoEmpresaTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [k, val] of Object.entries(rawValues)) v[k] = String(val ?? '')

  function u(key: string): string {
    return (v[key] ?? '').trim().toUpperCase()
  }

  let t = 'PADRAO EMPRESA:\n\n'

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
    // Empresa: texto de localização inclui \n no final (diferença em relação ao Casa)
    loc = `SOLTO EM CIMA DO MÓVEL: ${u('descricao_movel')}. MOTIVO DE NÃO FIXAR: ${u('motivo_nao_fixado')}. O CLIENTE ESTÁ CIENTE DOS RISCOS CASO O EQUIPAMENTO SOFRA DANO POR QUEDA.\n`
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

  // Teste de cobertura — Empresa tem \n\n (linha em branco extra) após esse bloco
  const nomeCob = u('teste_cobertura')
  t += `TESTE DE COBERTURA WI-FI FOI REALIZADO NA PRESENÇA DE ${nomeCob}`
  if (v.eh_assinante === 'NÃO') {
    t += ` (${u('parentesco_cobertura')})`
  }
  t += '.\n\n'

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

export function getEncPadraoEmpresaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'ence-padrao-empresa',
    title: 'Encerramento — Padrão Empresa',
    demandCategory: 'encerramentos-instalacao',
    outputTemplate: '{{encTexto}}',
    fields: ENCE_PADRAO_EMPRESA_FIELDS.map((f) => ({ ...f })),
  }
}
