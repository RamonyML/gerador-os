import type { OsTemplateField } from '../../types/osTemplate'

/**
 * MUD END — fluxo único com variações de solicitação.
 * O caso "titular solicita e acompanha" mantém paridade com
 * legado-exemplo/suporte/mud-end/index-mud-end.html.
 */

const SEP = '='.repeat(35)
const SEP_OS = '='.repeat(37)
const SEP_AST = '*'.repeat(15)
const SEP_AST_OS = '*'.repeat(35)

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_TERCEIRO = 'DADOS DE TERCEIRO / AUTORIZAÇÃO'
const S_END = 'NOVO ENDEREÇO DO CLIENTE'
const S_AGE = 'AGENDAMENTO'

/** Valores idênticos aos atributos `value` dos radios do legado. */
const EXTEND_POSSUI = '<b>(POSSUI WI-FI EXTEND)</b> '

const EQUIP_LEVOU_SIM =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. QUESTIONEI O CLIENTE E O MESMO DISSE QUE JÁ LEVOU OS EQUIPAMENTOS AO NOVO ENDEREÇO.'
const EQUIP_LEVOU_NAO =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO NÃO POSSUI IP. INFORMEI AO CLIENTE QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA). CLIENTE CONFIRMOU QUE LEVARÁ POSTERIORMENTE.'
const EQUIP_ESQUECEU_SIM =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO AINDA ESTAVA ATIVA (COM IP). QUESTIONANDO, CLIENTE DISSE QUE ESQUECEU OS EQUIPAMENTOS NO ANTIGO ENDEREÇO. INFORMEI AO CLIENTE QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA). CLIENTE CONFIRMOU QUE LEVARÁ ATÉ O DIA DA MUDANÇA.'
const EQUIP_ESQUECEU_NAO =
  'VERIFIQUEI EM SISTEMA QUE A CONEXÃO AINDA ESTAVA ATIVA (COM IP). QUESTIONEI O CLIENTE E O MESMO DISSE QUE VAI BUSCAR OS EQUIPAMENTOS ATÉ O DIA DA MUDANÇA.'

const T_TITULAR = 'titular-solicita-titular-acompanha'
const T_TERCEIRO_TITULAR = 'terceiro-solicita-titular-acompanha'
const T_TERCEIRO_TERCEIRO = 'terceiro-solicita-terceiro-acompanha'
const T_TITULAR_TERCEIRO = 'titular-solicita-terceiro-acompanha'

export const MUD_END_PADRAO_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{mudEndTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{mudEndTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{mudEndTextoAgenda}}',
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

function lineOsTecnica(v: Record<string, string>): string {
  return `TÉCNICO: ${v.extend ?? ''}REINSTALAR OS EQUIPAMENTOS EM LOCAL DE CONCORDANCIA DO CLIENTE OU NO MELHOR LOCAL DA CASA PARA COBERTURA WI-FI. REALIZAR TESTES E AFERIR VELOCIDADE DO PLANO, TESTAR E APRESENTAR ABRANGÊNCIA DO WI-FI COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT DE TESTES DA EMPRESA E COM OS DISPOSITIVOS DO CLIENTE E APRESENTAR VARIAÇÕES SE HOUVER. CONFERIR NAVEGAÇÃO IPv6, PORTA E SENHA DE ACESSO AO EQUIPAMENTO E ACESSO EXTERNO PELA WAN. TESTAR TODOS DISPOSITIVOS PRESENTES WI-FI E CABEADA SE HOUVER EQUIPAMENTO JUNTO DO ROTEADOR QUE NECESSITE SER CABEADO. EXPLICAR QUE CASO ALGUM EQUIPAMENTO PRECISE CONECTAR-SE POR CABO DE REDE E NÃO ESTIVER AO LADO DO ROTEADOR CLIENTE DEVERÁ CONTRATAR SERVIÇO DE PROFISSIONAL DO RAMO PARA TAL, MESMO SE APLICA SE NECESSÁRIO DESMONTAR MÓVEIS (RACK, ARMÁRIO, OUTROS) PARA PASSAR CABOS. RECEBER R$100,00 NO ATO DA VISITA EM ${v.formaPag ?? ''}.`
}

function osBody(inicio: string, v: Record<string, string>, sep = SEP_OS): string {
  return `${inicio}

${sep}

INDICAÇÃO TÉCNICA:

${lineOsTecnica(v)}
<b>${v.onuOnt ?? ''}</b>`
}

export function buildMudEndPadraoTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const tipo = v.tipoSolicitacao || T_TITULAR
  const cliente = upper(v.cliente)
  const clientePrimeiro = first(cliente)
  const solicitante = upper(v.solicitante)
  const solicitantePrimeiro = first(solicitante)
  const autorizado = upper(v.autorizado)
  const autorizadoPrimeiro = first(autorizado)
  const parente = upper(v.parente)
  const contato = digits(v.contato)
  const contatoSol = digits(v.contatoSol)
  const contatoAut = digits(v.contatoAut)
  const sinalONU = upper(v.sinalONU)
  const adress = upper(v.adress)
  const complemento = upper(v.complemento)
  const bairro = upper(v.bairro)
  const tipoComp = upper(v.tipoComp)
  const comprovante = upper(v.comprovante)
  const nomeComprov = upper(v.nomeComprov)
  const grauComp = upper(v.grauComp)
  const num = digits(v.num)
  const quandoMud = upper(v.quandoMud)
  const extendAgenda = String(v.extend ?? '').replace(/<b>|<\/b>/g, '**')
  const equipSituacao = v.equipSituacao ?? ''
  const agenda = `MUD END ${cliente} PROT:${v.protocolo ?? ''} ${v.formaPag ?? ''} (${operadorPrimeiroNome}) - ${bairro} ${v.prumada ?? ''} ${extendAgenda}`

  if (tipo === T_TERCEIRO_TITULAR) {
    const protocolo = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.

${SEP_AST}

QUESTIONADO, ${solicitantePrimeiro} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${v.num ?? ''}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}

COMPROVANTE DE ENDEREÇO (${comprovante}${tipoComp}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}

INFORMEI A ${solicitantePrimeiro} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.
RESSALTEI QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA).


${solicitantePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

POR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE AUTORIZOU E CONFIRMOU QUE ESTARÁ PRESENTE NO ATO DA VISITA.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`
    const os = osBody(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canal ?? ''} (${contato}) COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU A SOLICITAÇÃO DE ${solicitantePrimeiro}. DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
      SEP_AST_OS,
    )
    return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
  }

  if (tipo === T_TERCEIRO_TERCEIRO) {
    const partes = String(v.dataLigacao ?? '').trim().split(/\s+/)
    const dataLigacao = partes[0] ?? ''
    const horaLigacao = partes[1] ?? ''
    const protocolo = `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.
    
${SEP_AST}
    
QUESTIONADO, ${solicitantePrimeiro} DISSE QUE VAI SE MUDAR E DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.
    
ENDEREÇO NOVO: ${adress}, ${v.num ?? ''}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}

COMPROVANTE DE ENDEREÇO (${comprovante}${tipoComp}) EM ANEXO.
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}

INFORMEI A ${solicitantePrimeiro} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

${equipSituacao}

${solicitantePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

POR PROCEDIMENTO PADRÃO, ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${dataLigacao} ÀS ${horaLigacao}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`
    const os = osBody(
      `${solicitantePrimeiro} (${parente} DE ${clientePrimeiro}) ENTROU EM CONTATO POR ${v.canal ?? ''} (${contatoSol}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO POR ${v.canalTit ?? ''} (${contato}) DIA ${dataLigacao} ${horaLigacao}HRS COM ${clientePrimeiro} (ASSINANTE) QUE CONFIRMOU E AUTORIZOU ${solicitante} (${parente}) ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
      SEP_AST_OS,
    )
    return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
  }

  if (tipo === T_TITULAR_TERCEIRO) {
    const protocolo = `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP_AST}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.

${SEP_AST}

QUESTIONADO, ${clientePrimeiro} DISSE QUE ${v.mudou ?? ''} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}
${quandoMud}

COMPROVANTE DE ENDEREÇO (${comprovante}${tipoComp}) EM ANEXO
NOME NO COMPROVANTE:  ${nomeComprov} (${grauComp})

${SEP_AST}

INFORMEI A ${clientePrimeiro} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

${equipSituacao}

${clientePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

${clientePrimeiro} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO.
${clientePrimeiro} INFORMOU O NÚMERO DE CONTATO (${contatoAut}) PARA CASO SEJA NECESSÁRIO FALAR COM ${autorizadoPrimeiro}.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`
    const os = osBody(
      `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. ${clientePrimeiro} DISSE QUE NÃO ESTARÁ PRESENTE, MAS AUTORIZOU ${autorizado} (${parente}) A ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
      v,
      SEP_AST_OS,
    )
    return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
  }

  const protocolo = `${clientePrimeiro} ENTROU EM CONTATO POR ${v.canal ?? ''} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU ${sinalONU}.

${SEP}

QUESTIONADO, ${clientePrimeiro} DISSE QUE ${v.mudou ?? ''} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${num}
COMPLEMENTO: ${complemento}
CEP: ${v.cep ?? ''}
BAIRRO: ${bairro}
${quandoMud}

${SEP}

INFORMEI A ${clientePrimeiro} QUE POSSUÍMOS VIABILIDADE DE FIBRA ÓTICA NO ENDEREÇO INFORMADO.
CIENTE E ORIENTADO(A) QUE A MUDANÇA POSSUI O CUSTO DE SERVIÇO NO VALOR DE R$100,00 A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

${equipSituacao}

${clientePrimeiro} CONFIRMOU A SOLICITAÇÃO E OPTOU REALIZAR O PAGAMENTO DA TAXA DE R$100,00 NO ${v.formaPag ?? ''}.

MUDANÇA AGENDADA PARA DIA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.

${SEP}

>>> Este deve ser o ultimo comentário <<<

COMPROVANTE DE ENDEREÇO (${comprovante}${tipoComp}) EM ANEXO
NOME NO COMPROVANTE: ${nomeComprov} (${grauComp})`

  const os = osBody(
    `${clientePrimeiro} ENTROU EM CONTATO VIA ${v.canal ?? ''} (${contato}) E SOLICITOU REINSTALAÇÃO DOS EQUIPAMENTOS DE INTERNET NO ENDEREÇO QUE ESTÁ NA O.S, DISSE "QUE MUDOU PARA ESTE ENDEREÇO E LEVOU OS EQUIPAMENTOS". INFORMEI O VALOR DO SERVIÇO R$100,00 (INCLUI PEÇAS E SERVIÇOS), CLIENTE SOLICITOU PAGAR NO ATO COM ${v.formaPag ?? ''}. ${clientePrimeiro} DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR, ASSINAR O.S E EFETUAR O PAGAMENTO. VISITA AGENDADA PARA ${v.dataVisita ?? ''} ${v.horaVisita ?? ''} HRS.`,
    v,
  )
  return { mudEndTextoProtocolo: protocolo, mudEndTextoOS: os, mudEndTextoAgenda: agenda }
}

/** Campos e ordem espelham o index-mud-end.html (grid 12 colunas). */
export const MUD_END_PADRAO_FIELDS: OsTemplateField[] = [
  {
    id: 'tipoSolicitacao',
    label: 'Tipo de solicitação',
    control: 'select',
    highlight: true,
    defaultValue: T_TITULAR,
    options: [
      {
        value: T_TITULAR,
        label: 'Titular solicita e acompanha',
        icon: 'user-round',
      },
      {
        value: T_TERCEIRO_TITULAR,
        label: 'Terceiro solicita e titular acompanha',
        icon: 'users-round',
      },
      {
        value: T_TERCEIRO_TERCEIRO,
        label: 'Terceiro solicita e terceiro acompanha',
        icon: 'users-round',
      },
      {
        value: T_TITULAR_TERCEIRO,
        label: 'Titular solicita e autoriza terceiro',
        icon: 'user-round',
      },
    ],
    layout: { md: 12 },
  },
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
    layout: { md: 3 },
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
    layout: { md: 3 },
  },
  {
    id: 'onuOnt',
    label: 'ONU/ONT',
    control: 'select',
    section: S_ID,
    options: [
      { value: 'ONU = DATA // CONECTOR = VERDE.', label: 'ONU DATA' },
      { value: 'ONU = ZTE // CONECTOR = VERDE.', label: 'ONU ZTE' },
      { value: 'ONU = TENDA // CONECTOR = VERDE.', label: 'ONU TENDA' },
      { value: 'ONU = SHORELINE // CONECTOR = AZUL.', label: 'ONU SHORELINE' },
      { value: 'ONU = FIBERHOME // CONECTOR = AZUL.', label: 'ONU FIBERHOME' },
      {
        value: 'ONT = ONT TP LINK 220 // CONECTOR = VERDE.',
        label: 'ONT TP LINK 220',
      },
      {
        value: 'ONT = ONT TP LINK 230 // CONECTOR = VERDE.',
        label: 'ONT TP LINK 230',
      },
      {
        value: 'ONT = ONT TP LINK 530 // CONECTOR = VERDE.',
        label: 'ONT TP LINK 530',
      },
      { value: 'ONT = ONT ZTE // CONECTOR = AZUL.', label: 'ONT ZTE (azul)' },
      { value: 'ONT = ONT ZTE // CONECTOR = VERDE.', label: 'ONT ZTE (verde)' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'extend',
    label: 'Possui Wi-Fi extend?',
    control: 'radio',
    section: S_ID,
    options: [
      { value: EXTEND_POSSUI, label: 'Possui' },
      { value: '', label: 'Não possui' },
    ],
    layout: { md: 6 },
  },
  {
    id: 'solicitante',
    label: 'Nome do terceiro solicitante',
    control: 'text',
    placeholder: 'Nome completo de quem entrou em contato',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO],
    },
    layout: { md: 5 },
  },
  {
    id: 'contatoSol',
    label: 'Contato do terceiro',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO],
    },
    layout: { md: 3 },
  },
  {
    id: 'autorizado',
    label: 'Terceiro autorizado',
    control: 'text',
    placeholder: 'Nome completo de quem receberá o técnico',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: T_TITULAR_TERCEIRO },
    layout: { md: 5 },
  },
  {
    id: 'contatoAut',
    label: 'Contato do autorizado',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: T_TITULAR_TERCEIRO },
    layout: { md: 3 },
  },
  {
    id: 'parente',
    label: 'Vínculo / parentesco',
    control: 'text',
    placeholder: 'MÃE, IRMÃO, LOCATÁRIO, ETC...',
    section: S_TERCEIRO,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TERCEIRO_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO],
    },
    layout: { md: 4 },
  },
  {
    id: 'canalTit',
    label: 'Canal da confirmação com titular',
    control: 'select',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: T_TERCEIRO_TERCEIRO },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
    layout: { md: 4 },
  },
  {
    id: 'dataLigacao',
    label: 'Data/hora da confirmação',
    control: 'datetime',
    section: S_TERCEIRO,
    showWhen: { field: 'tipoSolicitacao', equals: T_TERCEIRO_TERCEIRO },
    layout: { md: 4 },
  },
  {
    id: 'cep',
    label: 'CEP',
    control: 'text',
    placeholder: 'Insira o CEP da rua',
    section: S_END,
    layout: { md: 2 },
  },
  {
    id: 'adress',
    label: 'Logradouro',
    control: 'text',
    placeholder: 'Preenchido pelo CEP',
    section: S_END,
    layout: { md: 4 },
  },
  {
    id: 'num',
    label: 'Nº',
    control: 'text',
    placeholder: 'Número',
    section: S_END,
    layout: { md: 2 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Preenchido pelo CEP',
    section: S_END,
    layout: { md: 4 },
  },
  {
    id: 'complemento',
    label: 'Complemento (cond. bl, ap)',
    control: 'text',
    placeholder: 'Casa frente, fundos, sobrado, cond. etc',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'prumada',
    label: 'Sobrado / Prumada',
    control: 'select',
    section: S_END,
    options: [
      { value: '**PRÉDIO COM PRUMADA**', label: 'Com prumada' },
      {
        value: '**PRÉDIO SEM PRUMADA - ENVIAR TÉCNICO DUPLADO**',
        label: 'Sem prumada (escolha 2 horários)',
      },
      { value: '**SOBRADO**', label: 'Sobrado' },
      { value: ' ', label: 'Casa ou Comércio' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'quandoMud',
    label: 'Quando / observação da mudança',
    control: 'text',
    placeholder: 'Cliente informou que vai mudar na próxima semana.',
    section: S_END,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TITULAR, T_TITULAR_TERCEIRO],
    },
    layout: { md: 6 },
  },
  {
    id: 'mudou',
    label: 'Situação da mudança',
    control: 'radio',
    defaultValue: 'AINDA NÃO SE MUDOU, PORÉM',
    section: S_END,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TITULAR, T_TITULAR_TERCEIRO],
    },
    options: [
      { value: 'MUDOU DE RESIDÊNCIA E', label: 'Cliente já se mudou' },
      {
        value: 'AINDA NÃO SE MUDOU, PORÉM',
        label: 'Cliente ainda vai se mudar',
      },
    ],
    layout: { md: 12 },
  },
  {
    id: 'equipSituacao',
    label: 'Equipamentos (apenas se cliente já se mudou)',
    control: 'select',
    section: S_END,
    showWhen: {
      field: 'tipoSolicitacao',
      equals: [T_TITULAR, T_TERCEIRO_TERCEIRO, T_TITULAR_TERCEIRO],
    },
    options: [
      { value: '', label: 'Não se aplica (cliente ainda vai se mudar)' },
      {
        value: EQUIP_LEVOU_SIM,
        label: 'Sem IP — já levou os equipamentos ao novo endereço',
      },
      {
        value: EQUIP_LEVOU_NAO,
        label: 'Sem IP — cliente levará os equipamentos posteriormente',
      },
      {
        value: EQUIP_ESQUECEU_SIM,
        label: 'Com IP — esqueceu no antigo endereço (orientado a levar)',
      },
      {
        value: EQUIP_ESQUECEU_NAO,
        label: 'Com IP — buscará os equipamentos até o dia da mudança',
      },
    ],
    layout: { md: 12 },
  },
  {
    id: 'comprovante',
    label: 'Comprovante',
    control: 'select',
    section: S_END,
    options: [
      { value: 'CEMIG', label: 'CEMIG' },
      { value: 'DMAE', label: 'DMAE' },
      { value: 'CONTRATO DE LOCAÇÃO', label: 'Contrato de Locação' },
      { value: 'CONTRATO DE HABITAÇÃO', label: 'Contrato de Habitação' },
      { value: '', label: 'Outros (preencher tipo ao lado)' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'tipoComp',
    label: 'Informe o tipo (se “Outros”)',
    control: 'text',
    placeholder: 'Informe o tipo do comprovante',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'nomeComprov',
    label: 'Nome no comprovante',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'grauComp',
    label: 'Grau / vínculo',
    control: 'text',
    placeholder: 'ASSINANTE, MÃE, IRMÃO, LOCATÁRIO, ETC...',
    section: S_END,
    layout: { md: 3 },
  },
  {
    id: 'dataVisita',
    label: 'Visita Técnica',
    control: 'date',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 3 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    options: [
      { value: 'ÀS 08:00', label: '08:00' },
      { value: 'ÀS 08:30', label: '08:30' },
      { value: 'ÀS 10:00', label: '10:00' },
      { value: 'ÀS 10:30', label: '10:30' },
      { value: 'ÀS 13:00', label: '13:00' },
      { value: 'ÀS 13:30', label: '13:30' },
      { value: 'ÀS 15:00', label: '15:00' },
      { value: 'ÀS 15:30', label: '15:30' },
      { value: 'ÀS 17:00', label: '17:00 (somente com autorização)' },
      { value: 'APÓS ÀS 11:00', label: 'Após às 11:00 (aos sábados)' },
    ],
    layout: { md: 3 },
  },
  {
    id: 'formaPag',
    label: 'Pagamento',
    control: 'select',
    section: S_AGE,
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
    layout: { md: 2 },
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

export function getMudEndPadraoDefaults() {
  return {
    slug: 'mud-end-padrao',
    title: 'Mudança de endereço — padrão',
    outputTemplate: MUD_END_PADRAO_OUTPUT,
    demandCategory: 'mudanca-endereco',
    fields: MUD_END_PADRAO_FIELDS.map((f) => ({ ...f })),
  }
}
