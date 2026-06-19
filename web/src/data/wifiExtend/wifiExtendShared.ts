import type { FieldOption, OsTemplateField } from '../../types/osTemplate'

/**
 * Wi-Fi Extend / Mesh — base compartilhada.
 * Paridade com (família ZTE / TP-Link):
 *   legado-exemplo/suporte/wi-fi extend/index-altplan-wifi-extend*.html
 *   legado-exemplo/suporte/wi-fi extend/wi-fi-extend-pj/*.html
 *   legado-exemplo/suporte/wi-fi extend/wifi-ext-ofertado/*.html
 *   legado-exemplo/suporte/wi-fi extend/tplink/*.html
 *
 * As 11 variações de "alteração de plano + Wi-Fi Extend" são consolidadas em
 * dois fluxos (ZTE e TP-Link), cada um com selects:
 *   - segmento  : PF | PJ
 *   - origem    : SOLICITADO | OFERTADO   (somente ZTE; TP-Link não tem ofertado)
 *   - troca     : NAO | SIM               (troca do roteador primário)
 *
 * Observações do legado (preservadas caractere-a-caractere):
 *  - Separadores: 35 asteriscos; nas variantes PJ + troca usa 47 "=".
 *  - 3 "dialetos" de indentação nas linhas em branco do Protocolo:
 *      A (sem-troca): 8 e 4 espaços; B (troca): sem espaços; C (ofertado): 12/4/8.
 *  - Bloco "OBS.:" no fim do Protocolo: ZTE só em PJ solicitado; TP-Link sempre.
 *  - `cliente`/`solicitante`/`bairro`/`sinalONU`/`obs` saem em CAIXA ALTA.
 */

export const SEP35 = '*'.repeat(35)
export const SEP47 = '='.repeat(47)

export const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
export const S_PLANO = 'DETALHES DO PLANO'
export const S_AGE = 'AGENDAMENTO'

export function upper(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

export function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function first(value: string): string {
  return value.split(/\s+/).filter(Boolean)[0] ?? ''
}

export function sp(n: number): string {
  return ' '.repeat(n)
}

export const SEGMENTO_PF = 'PF'
export const SEGMENTO_PJ = 'PJ'
export const ORIGEM_SOLICITADO = 'SOLICITADO'
export const ORIGEM_OFERTADO = 'OFERTADO'
export const TROCA_NAO = 'NAO'
export const TROCA_SIM = 'SIM'

export const SEGMENTO_OPTS: FieldOption[] = [
  { value: SEGMENTO_PF, label: 'Pessoa Física', icon: 'user-round' },
  { value: SEGMENTO_PJ, label: 'Pessoa Jurídica', icon: 'users-round' },
]

export const ORIGEM_OPTS: FieldOption[] = [
  { value: ORIGEM_SOLICITADO, label: 'Cliente solicitou' },
  { value: ORIGEM_OFERTADO, label: 'Ofertei ao cliente' },
]

export const TROCA_OPTS: FieldOption[] = [
  { value: TROCA_NAO, label: 'Sem troca do roteador primário' },
  { value: TROCA_SIM, label: 'Com troca do roteador primário' },
]

export const CANAL_OPTS: FieldOption[] = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

export const VENCIMENTO_OPTS: FieldOption[] = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
  { value: '25', label: '25' },
]

export const HORA_VISITA_OPTS: FieldOption[] = [
  { value: '08:30', label: '08:30' },
  { value: '09:30', label: '09:30' },
  { value: '10:30', label: '10:30' },
  { value: '11:30', label: '11:30' },
  { value: '13:30', label: '13:30' },
  { value: '14:30', label: '14:30' },
  { value: '15:30', label: '15:30' },
  { value: '16:30', label: '16:30' },
  { value: '17:30', label: '17:30' },
]

export const PLANO_ATUAL_OPTS: FieldOption[] = [
  { value: '100 MEGA/59,90', label: '100MB/59,90' },
  { value: '100 MEGA/79,90', label: '100MB/79,90' },
  { value: '150 MEGA/59,90', label: '150MB/59,90' },
  { value: '250 MEGA/69,90', label: '250MB/69,90' },
  { value: '300 MEGA/69,90', label: '300MB/69,90' },
  { value: '400 MEGA/79,90', label: '400MB/79,90' },
  { value: '500 MEGA/79,90', label: '500MB/79,90' },
  { value: '500 MEGA/99,90', label: '500MB/99,90' },
  { value: '600 MEGA/79,90', label: '600MB/79,90' },
  { value: '1000 MEGA/99,90', label: '1000MB/99,90' },
  { value: '1000 MEGA/149,80', label: '1000MB/149,80' },
  { value: '1000 MEGA/114,90 + IP PUBLICO DINAMICO', label: '1000MB/114,90 + IP DIN (antigo)' },
  { value: '1000 MEGA/120,00 + IP PUBLICO DINAMICO', label: '1000MB/120,00 + IP DIN' },
  { value: '500 MEGA + WI-FI EXTEND/119,90', label: '500MB/119,90 - WI-FI EXTEND' },
  { value: '1000 MEGA + WI-FI EXTEND/139,90', label: '1000MB/139,90 - WI-FI EXTEND' },
]

export const PLANO_ESCOLHIDO_OPTS: FieldOption[] = [
  {
    value:
      '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
  {
    value:
      '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
  {
    value:
      '600 MEGA; + WI-FI EXTEND (2 ROTEADORES ADICIONAIS) MENSALIDADE: R$144,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/144,90 + BENEFÍCIOS + WI-FI EXTEND (2 UNIDADES)',
  },
  {
    value:
      '1 GIGA (1.000 MEGA); + WI-FI EXTEND (2 ROTEADORES ADICIONAIS)  MENSALIDADE: R$164,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/164,90 + BENEFÍCIOS + WI-FI EXTEND (2 UNIDADES)',
  },
  {
    value:
      '600 MEGA; + WI-FI EXTEND (3 ROTEADORES ADICIONAIS) MENSALIDADE: R$174,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/174,90 + BENEFÍCIOS + WI-FI EXTEND (3 UNIDADES)',
  },
  {
    value:
      '1 GIGA (1.000 MEGA); + WI-FI EXTEND (3 ROTEADORES ADICIONAIS)  MENSALIDADE: R$194,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/194,90 + BENEFÍCIOS + WI-FI EXTEND (3 UNIDADES)',
  },
  {
    value:
      '600 MEGA; + IP PUBLICO DINAMICO + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$135,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '600 MEGA/135,00 + BENEFÍCIOS + WI-FI EXTEND + IP DIN',
  },
  {
    value:
      '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$155,00; + EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + IP PUBLICO DINAMICO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZ PLAY + ACESSO GRATUITO AO APP (CDNTV+) + VOD',
    label: '1000 MEGA/155,00 + BENEFÍCIOS + WI-FI EXTEND + IP DIN',
  },
]

export const ROTEADOR_ATUAL_OPTS: FieldOption[] = [
  { value: 'MULTILASER', label: 'MULTILASER' },
  { value: 'TP-LINK 840', label: 'TP-LINK 840' },
  { value: 'TP LINK C-20', label: 'TP LINK C-20' },
  { value: 'D-LINK DIR 842', label: 'D-LINK DIR 842' },
  { value: 'TP LINK C-5', label: 'TP LINK C-5' },
  { value: 'TP LINK G-5', label: 'TP LINK G-5' },
  { value: 'GREATEK', label: 'GREATEK' },
  { value: 'INTELBRAS', label: 'INTELBRAS' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ZTE H196-MESH', label: 'ZTE H196-MESH' },
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
  { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
]

export const ROTEADOR_ZTE_OPTS: FieldOption[] = [
  { value: 'D-LINK DIR 842', label: 'D-LINK DIR 842' },
  { value: 'TP LINK C-5', label: 'TP LINK C-5' },
  { value: 'TP LINK G-5', label: 'TP LINK G-5' },
  { value: 'GREATEK', label: 'GREATEK' },
  { value: 'INTELBRAS', label: 'INTELBRAS' },
  { value: 'HUAWEI AX2', label: 'HUAWEI AX2' },
  { value: 'ZTE H196-MESH', label: 'ZTE H196-MESH' },
  { value: 'ZTE H199-A', label: 'ZTE H199-A' },
  { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
  { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
  { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
]

export const ROTEADOR_TPLINK_OPTS: FieldOption[] = [
  { value: 'TPLINK 511', label: 'TPLINK 511' },
  { value: 'ONT TPLINK X220', label: 'ONT TPLINK X220' },
  { value: 'ONT TPLINK X230', label: 'ONT TPLINK X230' },
  { value: 'ONT TPLINK X530', label: 'ONT TPLINK X530' },
]

export const OBS_LOCAL_OUTRO = 'OUTRO'
export const OBS_LOCAL_OPTS: FieldOption[] = [
  { value: 'CASA FRENTE > CASA FUNDOS (CABEADO)', label: 'Casa frente > casa fundos (cabeado)' },
  { value: 'CASA FUNDOS > CASA FRENTE (CABEADO)', label: 'Casa fundos > casa frente (cabeado)' },
  { value: 'MESMA CASA (POSSÍVEL MESH)', label: 'Mesma casa (possível mesh)' },
  { value: OBS_LOCAL_OUTRO, label: 'Outro' },
]

/** Trecho final compartilhado por todas as INDICAÇÕES TÉCNICAS de extend. */
const TEC_TAIL =
  ' EM LOCAL DE CONCORDANCIA DO CLIENTE E NA MELHOR ÁREA DE COBERTURA WI-FI. PADRONIZAR NOME DAS REDES ("NOME DO CLIENTE_MZNET"), CONFERIR NAVEGAÇÃO IPv6, PADRONIZAR PORTA E SENHA DE ACESSO REMOTO, LIBERAR ACESSO EXTERNO PELA WAN; TESTAR ABRANGÊNCIA DA REDE WI-FI E EXPLICAR SOBRE COBERTURA, CONECTAR TODOS DISPOSITIVOS QUE APRESENTAR E REALIZAR TESTES, VERIFICAR E EXPLICAR SOBRE EQUIPAMENTOS QUE FUNCIONARAM MELHOR LIGADOS DIRETAMENTE AO ROTEADOR POR CABOS. BAIXAR E INSTALAR OS APP S QUE FAZEM PARTE DO PLANO ESCOLHIDO, TANTO NOS TELEFONES E TV S QUE POSSUÍREM COMPATIBILIDADE PARA FUNCIONAMENTO E NÃO HAVENDO DAR EXPLICAÇÕES. COLHER ASSINATURAS (O.S E CONTRATO), ENTREGAR DOCUMENTAÇÃO (VIAS DO CLIENTE), RECOLHER CARNÊ ANTIGO.'

const TEC_SEM_TROCA =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  TEC_TAIL

const TEC_TROCA_ZTE =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ROTEADOR ZTE H199-A. INSTALAR 2° ROTEADOR H-199A OU H-196A' +
  TEC_TAIL

const TEC_TROCA_TPLINK_PF =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ONT TPLINK. INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  TEC_TAIL

// Legado PJ tem um espaço extra antes do ponto em "TPLINK .".
const TEC_TROCA_TPLINK_PJ =
  'TÉCNICO: PLANO JÁ ALTERADO PARA NOVO PLANO ESCOLHIDO. CONFERIR INSTALAÇÃO E EQUIPAMENTOS EM COMODATO, NÃO HAVENDO DANOS SUBSTITUIR ROTEADOR ATUAL (PRIMÁRIO) POR ONT TPLINK . INSTALAR 2° ROTEADOR (MODELO COMPATIVEL AO PLANO)' +
  TEC_TAIL

export type ExtendFamily = 'ZTE' | 'TPLINK'

type Dialect = 'A' | 'B' | 'C'

function gapMain(dialect: Dialect): string {
  if (dialect === 'A') return '\n' + sp(4) + '\n'
  if (dialect === 'C') return '\n' + sp(8) + '\n'
  return '\n\n'
}

function gapSepBlock(dialect: Dialect): string {
  if (dialect === 'A') return '\n' + sp(8) + '\n'
  if (dialect === 'C') return '\n' + sp(12) + '\n'
  return '\n\n'
}

function gapAfterSep2(dialect: Dialect): string {
  // SEP2 -> QUESTIONADO: dialeto C usa 4 espaços; A e B usam só \n\n.
  if (dialect === 'C') return '\n' + sp(4) + '\n'
  return '\n\n'
}

export function buildExtendTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
  family: ExtendFamily,
): Record<string, string> {
  const isPJ = String(rawValues.segmento ?? SEGMENTO_PF) === SEGMENTO_PJ
  const isOfertado = String(rawValues.origem ?? ORIGEM_SOLICITADO) === ORIGEM_OFERTADO
  const troca = String(rawValues.troca ?? TROCA_NAO) === TROCA_SIM

  const cliente = upper(rawValues.cliente)
  const cp = first(cliente)
  const solicitante = upper(rawValues.solicitante)
  const solicCp = first(solicitante)
  const cargo = upper(rawValues.cargo)
  const canal = String(rawValues.canal ?? '')
  const contato = digits(rawValues.contato)
  const sinalONU = upper(rawValues.sinalONU)
  const bairro = upper(rawValues.bairro)
  const planoAtual = String(rawValues.planoAtual ?? '')
  const planoEscolhido = String(rawValues.planoEscolhido ?? '')
  const roteador = String(rawValues.roteador ?? '')
  const roteadorAtual = String(rawValues.roteadorAtual ?? '')
  const dataContrato = String(rawValues.dataContrato ?? '')
  const dataVisita = String(rawValues.dataVisita ?? '')
  const horaVisita = String(rawValues.horaVisita ?? '')
  const protocolo = String(rawValues.protocolo ?? '')
  const vencimentoData = String(rawValues.vencimentoData ?? '')

  const obsLocal = String(rawValues.obsLocal ?? '')
  const obsFinal = upper(obsLocal === OBS_LOCAL_OUTRO ? rawValues.obsOutro : obsLocal)

  const introSubject = isPJ ? `${solicCp} (${cargo})` : cp
  const personSubject = isPJ ? solicCp : cp

  const sep = isPJ && troca ? SEP47 : SEP35
  const dialect: Dialect = isOfertado ? 'C' : troca ? 'B' : 'A'
  // OBS no fim do protocolo: TP-Link sempre; ZTE só em PJ solicitado.
  const hasObs = family === 'TPLINK' ? true : isPJ && !isOfertado

  const intro = isOfertado
    ? `POR ${canal} (${contato}) OFERTEI À ${introSubject} ALTERAÇÃO DE PLANO COM WI-FI EXTEND.`
    : `${introSubject} ENTROU EM CONTATO VIA ${canal} (${contato}) SOLICITANDO INFORMAÇÕES SOBRE WI-FI EXTEND.`

  const clienteSem = `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}`
  const questionado = `QUESTIONADO, ${personSubject} INFORMOU QUE SUA ${
    isPJ ? 'EMPRESA' : 'RESIDÊNCIA'
  } É GRANDE E A REDE WI-FI NÃO ABRANGE TODA A ÁREA DE SUA RESIDENCIA.`
  const informeiAo =
    'INFORMEI AO CLIENTE QUE PARA CASOS COMO ESTE (RESIDENCIA GRANDE, SOBRADO, AREA DE LAZER ETC) TRABALHAMOS COM OS PLANOS QUE POSSUEM O WI-FI EXTEND.'
  const emResumo =
    'EM RESUMO EXPLIQUEI QUE WI-FI EXTEND CONSISTE NUM SEGUNDO ROTEADOR ADICIONAL QUE TRABALHA NA REDE MESH. ESTE EM SI UTILIZA O MESMO NOME DE REDE E SENHA DO ROTEADOR PRINCIPAL SENDO COMO UM ESCRAVO.\nESTE 2° ROTEADOR FICA EMPRESTADO EM REGIME DE COMODATO.'
  const planoAtualLn = `PLANO ATUAL: ${planoAtual} CONTRATADO EM ${dataContrato} COM FIDELIDADE DE 12 MESES. ROTEADOR: ${troca ? roteadorAtual : roteador}`
  const planoEscLn = `PLANO ${isOfertado ? 'OFERTADO' : 'ESCOLHIDO'}: ${planoEscolhido};\nFIDELIDADE DE 12 MESES`
  const informeiNec =
    'INFORMEI A NECESSIDADE DO AGENDAMENTO DE VISITA TÉCNICA PARA INSTALAÇÃO E CONFIGURAÇÃO DO ROTEADOR ADICIONAL, REALIZAR OS TESTES DE ABRANGÊNCIA, QUALIDADE, VELOCIDADE E SANAR TODAS AS DÚVIDAS QUE CLIENTE/USUÁRIOS POSSAM TER. \nVISITA ISENTA DE CUSTOS.'
  const ciente = `${personSubject} ESTÁ CIENTE DA RENOVAÇÃO DA FIDELIDADE POR 12 MESES E CONCORDOU COM OS TERMOS, E VISITA TÉCNICA ISENTA DE CUSTOS FOI AGENDADA PARA O DIA ${dataVisita} ÀS ${horaVisita} HRS, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO.`

  const gMain = gapMain(dialect)
  const gSep = gapSepBlock(dialect)
  const gSep2 = gapAfterSep2(dialect)

  let protocolo3 =
    intro +
    '\n\n' + sep +
    gSep + clienteSem +
    gSep + sep +
    gSep2 + questionado +
    gMain + informeiAo +
    gMain + emResumo +
    gMain + planoAtualLn +
    gMain + planoEscLn +
    gMain + sep +
    gMain + informeiNec +
    gMain + sep +
    gMain + ciente

  if (hasObs) {
    protocolo3 += '\n\n' + sep + '\n\n' + `OBS.: ${obsFinal}` + '\n\n'
  }

  const osIntro = isOfertado
    ? `POR ${canal} (${contato}) OFERTEI À ${introSubject} ALTERAÇÃO DE PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}; VENCIMENTO: DIA ${vencimentoData} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES (VIDE CONTRATO). VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`
    : `${introSubject} SOLICITOU POR ${canal} (${contato}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: ${planoAtual}. PLANO ESCOLHIDO: ${planoEscolhido}; VENCIMENTO: DIA ${vencimentoData} DO MÊS; VIGÊNCIA DO CONTRATO: 12 MESES (VIDE CONTRATO). VISITA AGENDADA PARA ${dataVisita} ÀS ${horaVisita} HRS.`

  let tecnico: string
  if (!troca) {
    tecnico = TEC_SEM_TROCA
  } else if (family === 'TPLINK') {
    tecnico = isPJ ? TEC_TROCA_TPLINK_PJ : TEC_TROCA_TPLINK_PF
  } else {
    tecnico = TEC_TROCA_ZTE
  }

  const os =
    osIntro + '\n\n' + sep + '\n\n' + 'INDICAÇÃO TÉCNICA:' + '\n\n' + tecnico

  const agenda = `ALT PLANO + WIFI EXTEND ${cliente} PROT:${protocolo} ISENTO (${operadorPrimeiroNome}) - ${bairro} // ${obsFinal}`

  return {
    wifiExtendTextoProtocolo: protocolo3,
    wifiExtendTextoOS: os,
    wifiExtendTextoAgenda: agenda,
  }
}

export const WIFI_EXTEND_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{wifiExtendTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{wifiExtendTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{wifiExtendTextoAgenda}}',
].join('\n')

/** Campos comuns aos fluxos ZTE e TP-Link (o roteador é injetado por família). */
export function buildExtendFields(roteadorOpts: FieldOption[], withOrigem: boolean): OsTemplateField[] {
  const fields: OsTemplateField[] = [
    {
      id: 'segmento',
      label: 'Tipo de cliente',
      control: 'select',
      highlight: true,
      defaultValue: SEGMENTO_PF,
      section: S_ID,
      layout: { md: 12 },
      options: SEGMENTO_OPTS,
    },
  ]

  if (withOrigem) {
    fields.push({
      id: 'origem',
      label: 'Origem da demanda',
      control: 'select',
      defaultValue: ORIGEM_SOLICITADO,
      section: S_ID,
      layout: { md: 6 },
      options: ORIGEM_OPTS,
    })
  }

  fields.push(
    {
      id: 'troca',
      label: 'Troca do roteador primário',
      control: 'select',
      defaultValue: TROCA_NAO,
      section: S_ID,
      layout: { md: withOrigem ? 6 : 12 },
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
      id: 'sinalONU',
      label: 'Sinal ONU',
      control: 'text',
      placeholder: '-19.20 DBM ou SEM SINAL',
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
      id: 'obsLocal',
      label: 'Onde será instalado o roteador adicional',
      control: 'radio',
      section: S_ID,
      layout: { md: 12 },
      options: OBS_LOCAL_OPTS,
    },
    {
      id: 'obsOutro',
      label: 'Descreva o local',
      control: 'text',
      placeholder: 'Descreva...',
      section: S_ID,
      layout: { md: 12 },
      showWhen: { field: 'obsLocal', equals: OBS_LOCAL_OUTRO },
    },
    {
      id: 'planoAtual',
      label: 'Plano Atual',
      control: 'select',
      section: S_PLANO,
      layout: { md: 6 },
      options: PLANO_ATUAL_OPTS,
    },
    {
      id: 'planoEscolhido',
      label: 'Plano Escolhido',
      control: 'select',
      section: S_PLANO,
      layout: { md: 6 },
      options: PLANO_ESCOLHIDO_OPTS,
    },
    {
      id: 'roteador',
      label: 'Roteador (comodato)',
      control: 'select',
      section: S_PLANO,
      layout: { md: 4 },
      options: roteadorOpts,
      showWhen: { field: 'troca', equals: TROCA_NAO },
    },
    {
      id: 'roteadorAtual',
      label: 'Roteador atualmente instalado (a ser retirado)',
      control: 'select',
      section: S_PLANO,
      layout: { md: 4 },
      options: ROTEADOR_ATUAL_OPTS,
      showWhen: { field: 'troca', equals: TROCA_SIM },
    },
    {
      id: 'dataContrato',
      label: 'Plano contratado em',
      control: 'text',
      placeholder: 'mês/ano',
      section: S_PLANO,
      layout: { md: 4 },
    },
    {
      id: 'vencimentoData',
      label: 'Data de vencimento',
      control: 'select',
      section: S_PLANO,
      layout: { md: 4 },
      options: VENCIMENTO_OPTS,
    },
    {
      id: 'protocolo',
      label: 'Nº Protocolo',
      control: 'text',
      placeholder: '123.456',
      section: S_AGE,
      layout: { md: 3 },
    },
  )

  return fields
}
