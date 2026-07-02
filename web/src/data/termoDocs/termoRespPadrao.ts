import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

/**
 * Termo de responsabilidade — acesso ao roteador em comodato.
 * Paridade com:
 *   legado-exemplo/suporte/termo-resp/termo-resp-padrao.html
 *
 * Observações do legado:
 *  - Gera dois textos: termo para encaminhar ao cliente e Texto Protocolo.
 *  - `cliente`, `sinalONU` e `mac` saem em CAIXA ALTA.
 *  - `user` e `senha` preservam exatamente o que foi digitado.
 *  - O bloco de orientação do operador vem do collapse "Texto para enviar ao cliente".
 */

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_EQUIP = 'EQUIPAMENTO E ACESSO'

const TESTOU_SIM = 'sim'
const TESTOU_NAO = 'nao'

export const TERMO_RESP_PADRAO_OUTPUT = [
  '=== Encaminhar termo ao cliente ===',
  '{{termoRespTextoCliente}}',
  '',
  '=== Texto Protocolo ===',
  '{{termoRespTextoProtocolo}}',
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

export function buildTermoRespPadraoSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[]; avisoCard?: string; avisoObservacao?: string; clienteTexto?: string } {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const cliente = upper(v.cliente)
  const cp = first(cliente)
  const canal = v.canal
  const contato = digits(v.contato)
  const sinalONU = upper(v.sinalONU) || 'SEM SINAL'
  const roteador = v.roteador
  const mac = upper(v.mac)
  const protocolo = v.protocolo
  const user = v.user
  const senha = v.senha
  const testouSenha = v.testouSenha

  const avisoCard = testouSenha === TESTOU_SIM && (user || senha)
    ? `REPASSEI O ACESSO A ${cp}:\n\nUSUÁRIO: ${user}\nSENHA: ${senha}\n\n${cp} CONFIRMOU ACESSO E NÃO TEM DÚVIDAS.`
    : undefined

  const avisoObservacao = `CLIENTE TEM ACESSO AO ROTEADOR.\nPROTOCOLO Nº ${protocolo}`

  const clienteTexto = `${cp} ENTROU EM CONTATO VIA WHATSAPP (${contato}) E SOLICITOU DESBLOQUEIO E LIBERAÇÃO PARA ACESSO AO ROTEADOR DA EMPRESA, QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: ${roteador} / MAC Nº: ${mac}). MOTIVO: DISSE QUE QUER TER O ACESSO AS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA. EXPLIQUEI E DEIXEI ${cp} CIENTE DE QUE ALTERANDO A CONFIGURAÇÃO PADRÃO DO EQUIPAMENTO QUE É REALIZADO PELO PROVEDOR, PERDEMOS O ACESSO REMOTO IMPEDINDO SUPORTE TÉCNICO REMOTO QUANDO SOLICITADO, OU SEJA, TODA INTERVENÇÃO AO EQUIPAMENTO POR PARTE DO PROVEDOR, PASSARÁ A SER POR VISITA TÉCNICA PRESENCIAL COM COBRANÇA DO SERVIÇO PRESTADO OU, CLIENTE OU QUEM ELE DESIGNAR TRAZER O EQUIPAMENTO À EMPRESA ISENTANDO ASSIM DE CUSTOS DE VISITAS. EXPLIQUEI E DEIXEI ${cp} CIENTE DE QUE QUALQUER ALTERAÇÃO DE CONFIGURAÇÃO, ATUALIZAÇÃO DE FIRMWARE, ETC. QUE VIER A DANIFICAR O EQUIPAMENTO, ESTE SERÁ INUTILIZADO PELO PROVEDOR E CLIENTE TERÁ QUE ARCAR COM SEU VALOR ATUAL, PASSANDO ASSIM A SER DONO DO ROTEADOR E CASO ACONTEÇA, A EMPRESA PODERÁ INSTALAR OUTRO ROTEADOR EM REGIME DE COMODATO. ${cp} DISSE ESTAR CIENTE DE SUAS RESPONSABILIDADES COM REFERIDO EQUIPAMENTO, E SOLICITOU LIBERAÇÃO E DESBLOQUEIO.\n\n*ESTANDO DE ACORDO, RESPONDA: SIM ou CORCORDO.*`

  return {
    info: `${cp} ${canal} ${contato} E SOLICITOU ACESSO AO ROTEADOR EM COMODATO.\n\nCLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU ${sinalONU}.`,
    clienteTexto,
    comentarios: [
      `QUESTIONADO, ${cp} DISSE QUE DESEJA O ACESSO AO ROTEADOR QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: ${roteador} / MAC Nº: ${mac} ).`,
      'DISSE QUE QUER TER O ACESSO ÀS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA.',
      `EXPLIQUEI E DEIXEI ${cp} CIENTE DE QUE, A PARTIR DO MOMENTO EM QUE A SENHA FOR INFORMADA, O CLIENTE ASSUME TOTAL RESPONSABILIDADE PELO EQUIPAMENTO.`,
      'DESTAQUEI QUE O ACESSO FORNECIDO É DE ADMINISTRADOR E RECOMENDEI QUE NÃO SEJAM REALIZADAS ATUALIZAÇÕES DE FIRMWARE NEM O BLOQUEIO DO NOSSO ACESSO REMOTO, A FIM DE GARANTIR QUE A MZNET POSSA FORNECER O SUPORTE NECESSÁRIO NO FUTURO.',
      'INFORMEI TAMBÉM QUE, CASO O EQUIPAMENTO SOFRA QUALQUER DESCONFIGURAÇÃO (ESPONTÂNEA OU POR OUTRA RAZÃO), E SEJA NECESSÁRIO O ENVIO DE UM TÉCNICO AO LOCAL, SERÁ COBRADA UMA TAXA DE DESLOCAMENTO TÉCNICO NO VALOR DE R$50,00.',
      `FOI ENCAMINHADO TERMO DE RESPONSABILIDADE, E ${cp} CONCORDOU, E SENDO ASSIM ESTÁ CIENTE DE SUAS RESPONSABILIDADES PARA COM O REFERIDO EQUIPAMENTO EM COMODATO.\n\nSEGUE PRINT EM ANEXO.`,
    ],
    avisoCard,
    avisoObservacao,
  }
}

export function buildTermoRespPadraoTextos(
  rawValues: Record<string, unknown>,
): Record<string, string> {
  const v: Record<string, string> = {}
  for (const [key, value] of Object.entries(rawValues)) {
    v[key] = String(value ?? '')
  }

  const cliente = upper(v.cliente)
  const cp = first(cliente)
  const canal = v.canal
  const contato = digits(v.contato)
  let sinalONU = upper(v.sinalONU)
  const roteador = v.roteador
  const protocolo = v.protocolo
  const mac = upper(v.mac)
  const user = v.user
  const senha = v.senha

  if (sinalONU === '') {
    sinalONU = 'SEM SINAL'
  }

  const textoProtocolo = `${cp} ${canal} ${contato} E SOLICITOU ACESSO AO ROTEADOR EM COMODATO.

===============================

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU ${sinalONU}.

===============================

QUESTIONADO, ${cp} DISSE QUE DESEJA O ACESSO AO ROTEADOR QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: ${roteador} / MAC Nº: ${mac} ).

DISSE QUE QUER TER O ACESSO ÀS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA.

===============================

EXPLIQUEI E DEIXEI ${cp} CIENTE DE QUE, A PARTIR DO MOMENTO EM QUE A SENHA FOR INFORMADA, O CLIENTE ASSUME TOTAL RESPONSABILIDADE PELO EQUIPAMENTO.

DESTAQUEI QUE O ACESSO FORNECIDO É DE ADMINISTRADOR E RECOMENDEI QUE NÃO SEJAM REALIZADAS ATUALIZAÇÕES DE FIRMWARE NEM O BLOQUEIO DO NOSSO ACESSO REMOTO, A FIM DE GARANTIR QUE A MZNET POSSA FORNECER O SUPORTE NECESSÁRIO NO FUTURO.

INFORMEI TAMBÉM QUE, CASO O EQUIPAMENTO SOFRA QUALQUER DESCONFIGURAÇÃO (ESPONTÂNEA OU POR OUTRA RAZÃO), E SEJA NECESSÁRIO O ENVIO DE UM TÉCNICO AO LOCAL, SERÁ COBRADA UMA TAXA DE DESLOCAMENTO TÉCNICO NO VALOR DE R$50,00.

===============================

FOI ENCAMINHADO TERMO DE RESPONSABILIDADE, E ${cp} CONCORDOU, E SENDO ASSIM ESTÁ CIENTE DE SUAS RESPONSABILIDADES PARA COM O REFERIDO EQUIPAMENTO EM COMODATO.

SEGUE PRINT EM ANEXO.

===============================

REPASSEI O ACESSO A ${cp}:

USUÁRIO: ${user}
SENHA: ${senha}

${cp} CONFIRMOU ACESSO E NÃO TEM DÚVIDAS.

===============================
===============================

>>> Insira esse texto no aviso do PESSOAS OU EMPRESAS <<<
>>> Inserir TAMBÉM na área de OBSERVAÇÕES (dentro da aba TÉCNICO > EDITAR) <<<

CLIENTE TEM ACESSO AO ROTEADOR. 
PROTOCOLO Nº ${protocolo}`

  const textoCliente = `${cp} ENTROU EM CONTATO VIA WHATSAPP (${contato}) E SOLICITOU DESBLOQUEIO E LIBERAÇÃO PARA ACESSO AO ROTEADOR DA EMPRESA, QUE É EMPRESTADO EM REGIME DE COMODATO (MODELO: ${roteador} / MAC Nº: ${mac}). MOTIVO: DISSE QUE QUER TER O ACESSO AS CONFIGURAÇÕES PARA FAZER ALTERAÇÕES EM NOME DE REDE, SENHA, ATUALIZAÇÃO DO FIRMWARE, ETC, POR CONTA PRÓPRIA SEM PRECISAR DO SUPORTE DA EMPRESA. EXPLIQUEI E DEIXEI ${cp} CIENTE DE QUE ALTERANDO A CONFIGURAÇÃO PADRÃO DO EQUIPAMENTO QUE É REALIZADO PELO PROVEDOR, PERDEMOS O ACESSO REMOTO IMPEDINDO SUPORTE TÉCNICO REMOTO QUANDO SOLICITADO, OU SEJA, TODA INTERVENÇÃO AO EQUIPAMENTO POR PARTE DO PROVEDOR, PASSARÁ A SER POR VISITA TÉCNICA PRESENCIAL COM COBRANÇA DO SERVIÇO PRESTADO OU, CLIENTE OU QUEM ELE DESIGNAR TRAZER O EQUIPAMENTO À EMPRESA ISENTANDO ASSIM DE CUSTOS DE VISITAS. EXPLIQUEI E DEIXEI ${cp} CIENTE DE QUE QUALQUER ALTERAÇÃO DE CONFIGURAÇÃO, ATUALIZAÇÃO DE FIRMWARE, ETC. QUE VIER A DANIFICAR O EQUIPAMENTO, ESTE SERÁ INUTILIZADO PELO PROVEDOR E CLIENTE TERÁ QUE ARCAR COM SEU VALOR ATUAL, PASSANDO ASSIM A SER DONO DO ROTEADOR E CASO ACONTEÇA, A EMPRESA PODERÁ INSTALAR OUTRO ROTEADOR EM REGIME DE COMODATO. ${cp} DISSE ESTAR CIENTE DE SUAS RESPONSABILIDADES COM REFERIDO EQUIPAMENTO, E SOLICITOU LIBERAÇÃO E DESBLOQUEIO.

*ESTANDO DE ACORDO, RESPONDA: SIM ou CORCORDO.*

`

  return {
    termoRespTextoCliente: textoCliente,
    termoRespTextoProtocolo: textoProtocolo,
  }
}

export const TERMO_RESP_PADRAO_FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome Completo',
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
    layout: { md: 3 },
    options: [
      { value: 'ENTROU EM CONTATO POR LIGAÇÃO', label: 'Telefone' },
      { value: 'ENTROU EM CONTATO POR WHATSAPP', label: 'WhatsApp' },
    ],
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
    id: 'cpf',
    label: 'CPF / CNPJ',
    control: 'text',
    placeholder: '000.000.000-00',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'mac',
    label: 'MAC',
    control: 'mac',
    placeholder: 'A1:B2:C3:D4:E5:F6',
    section: S_EQUIP,
    layout: { md: 4 },
  },
  {
    id: 'roteador',
    label: 'ONT/Roteador',
    control: 'select',
    section: S_EQUIP,
    layout: { md: 5 },
    catalogCategoria: 'equipamentos',
  },
  {
    id: 'protocolo',
    label: 'Protocolo',
    control: 'text',
    placeholder: '2501.1234',
    section: S_EQUIP,
    layout: { md: 3 },
  },
  {
    id: 'testouSenha',
    label: 'Testou a nova senha?',
    control: 'radio',
    defaultValue: TESTOU_NAO,
    section: S_EQUIP,
    layout: { md: 12 },
    options: [
      { value: TESTOU_SIM, label: 'Sim' },
      { value: TESTOU_NAO, label: 'Não' },
    ],
  },
  {
    id: 'user',
    label: 'Usuário',
    control: 'text',
    placeholder: 'Admin/super',
    section: S_EQUIP,
    layout: { md: 6 },
    showWhen: { field: 'testouSenha', equals: TESTOU_SIM },
  },
  {
    id: 'senha',
    label: 'Senha',
    control: 'text',
    placeholder: 'Abcd1234/super123',
    section: S_EQUIP,
    layout: { md: 6 },
    showWhen: { field: 'testouSenha', equals: TESTOU_SIM },
  },
]

export function getTermoRespPadraoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'termo-resp-padrao',
    title: 'Termo de Responsabilidade — Padrão',
    demandCategory: 'termo-docs',
    outputTemplate: TERMO_RESP_PADRAO_OUTPUT,
    fields: TERMO_RESP_PADRAO_FIELDS.map((f) => ({ ...f })),
    operatorGuidance: {
      title: 'Texto para enviar ao cliente',
      items: [
        `SOLICITAÇÃO DE ACESSO AO ROTEADOR EM COMODATO

A partir do momento em que a senha for informada, o cliente assume total responsabilidade pelo equipamento.

É importante destacar que o acesso fornecido é de Administrador. Recomendamos que não sejam realizadas atualizações de firmware nem o bloqueio do nosso acesso remoto, a fim de garantir que possamos fornecer o suporte necessário no futuro.

Caso o equipamento sofra qualquer desconfiguração (espontânea ou por outra razão), e seja necessário o envio de um técnico ao local, será cobrada uma taxa de deslocamento técnico no valor de R$50,00.

Peço que aguarde mais um momento, pois estou finalizando a documentação para formalização do acesso.`,
        `Encaminhar acesso ao roteador da seguinte forma:
Segue sua nova senha de acesso:
Usuário: Admin
Senha: Abcd1234`,
        `Caso não seja possível modificar a senha de acesso, encaminhar da seguinte forma:
(Exemplo TP-Link:)

Segue sua nova senha de acesso:
Senha: mznet183729`,
        'Lembre-se de perguntar ao cliente se o mesmo conseguiu acesso ao equipamento.',
      ],
    },
  }
}
