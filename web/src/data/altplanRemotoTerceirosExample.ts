import type { OsTemplateField } from '../types/osTemplate'
import {
  ALTPLAN_PLANO_ATUAL_OPTS,
  ALTPLAN_PLANO_ESCOLHIDO_OPTS,
  ALTPLAN_ROTEADOR_OPTS,
} from './altplanRemotoPadraoExample'

const S_SOL = 'IDENTIFICAÇÃO DO SOLICITANTE'
const S_ASS = 'IDENTIFICAÇÃO DO ASSINANTE'
const S_PLANO = 'DETALHES DO PLANO'

/** Espelho de `index-altplan-terc.html` (textoProtocolo + textoOS + encerramento). */
export const ALTPLAN_REMOTO_TERCEIROS_OUTPUT_TEMPLATE = `=== TEXTO PARA PROTOCOLO ===

{{solicitantePrimeiro}} ({{parenteUpper}} DE {{clientePrimeiro}}) ENTROU EM CONTATO POR {{canal}} ({{contatoSolNumerico}}) SOLICITANDO ALTERAÇÃO DE PLANO.

**************

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {{sinalONUFinal}}

**************
QUESTIONADO, CLIENTE DISSE QUE "{{motivoUpper}}".

PLANO ATUAL: {{planoAtual}} CONTRATADO EM {{dataContrato}} COM FIDELIDADE DE 12 MESES. ROTEADOR: {{roteador}}

PLANO SOLICITADO: {{planoEscolhido}}

ACESSO LIBERADO PARA SMARTPHONE OU TV SMART QUE POSSUA COMPATIBILIDADE. 


**************
INFORMEI QUE O ROTEADOR ATUAL EMPRESTADO ({{roteador}}) É COMPATÍVEL COM A NOVA VELOCIDADE SOLICITADA.
DISPONIBILIZEI AO CLIENTE 2 OPÇÕES PARA PROSSEGUIR COM O UPGRADE:

1° - AGENDAR UMA VISITA PRESENCIAL PARA REALIZAR TESTES, INSTRUÇÕES DO USO DE INTERNET, INFORMAÇÕES SOBRE COBERTURA WI-FI, REDE ELÉTRICA ETC; VISITA ESTA COM O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO A SER PAGO NO ATO EM DINHEIRO, CARTÃO OU PIX.

2° - REALIZAR A ALTERAÇÃO DE PLANO REMOTAMENTE (DENTRO DO PRAZO DE ATÉ 72 HORAS) E APÓS CONCLUÍDO A ALTERAÇÃO O CLIENTE REALIZAR A ASSINATURA DO CONTRATO DIGITAL POR MEIO DO APP "MZNET" OU ATÉ MESMO COMPARECER DIRETAMENTE NA EMPRESA E REALIZAR ESTA ASSINATURA PRESENCIAL.
PROCEDIMENTO ESTE QUE NÃO GERA CUSTOS AO ASSINANTE.
CIENTE QUE OS BENEFÍCIOS SÃO LIBERADOS APÓS ASSINATURA DO CONTRATO.

**************
POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM {{clientePrimeiro}} (ASSINANTE) POR {{canal}} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR {{canal}} ({{contatoNumerico}}) SOB PROTOCOLO Nº{{protocolo}} EM {{dataLigacaoData}} ÀS {{dataLigacaoHora}}HRS.

{{clientePrimeiro}} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES.

CLIENTE NÃO TEM DÚVIDAS

=== TEXTO PARA O.S ===

{{solicitantePrimeiro}} ({{parenteUpper}} DE {{clientePrimeiro}}) SOLICITOU POR {{canal}} ({{contatoSolNumerico}}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {{planoAtual}}. PLANO ESCOLHIDO: {{planoEscolhido}}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {{solicitantePrimeiro}} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. POR PROCEDIMENTO PADRÃO ENTREI EM CONTATO COM {{clientePrimeiro}} (ASSINANTE) POR {{canal}} QUE CONFIRMOU E AUTORIZOU O UPGRADE, ACORDO FIRMADO POR {{canal}} ({{contatoNumerico}}) SOB PROTOCOLO Nº{{protocolo}} EM {{dataLigacaoData}} ÀS {{dataLigacaoHora}} HRS.

=== TEXTO DE ENCERRAMENTO (data/hora no momento da geração) ===

ALTERAÇÃO DE PLANO EXECUTADA REMOTAMENTE COM SUCESSO.
ASSINATURA DIGITAL + SELFIE EM ANEXO.
NÃO HOUVE INTERVENÇÃO TÉCNICA DEVIDO O ROTEADOR EM COMODATO SER COMPATÍVEL AO PLANO ACORDADO ({{roteador}}).

CLIENTE SEM DÚVIDAS.

DATA/HORA DO ENCERRAMENTO: {{encerramento.data}} ÀS {{encerramento.hora}}HRS`

const CANAL_OPTS = [
  { value: 'LIGAÇÃO', label: 'Telefone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

export const ALTPLAN_REMOTO_TERCEIROS_FIELDS: OsTemplateField[] = [
  {
    id: 'solicitante',
    label: 'Nome completo do solicitante',
    control: 'text',
    placeholder: 'Quem entrou em contato',
    section: S_SOL,
    layout: { md: 8 },
  },
  {
    id: 'parente',
    label: 'Grau de parentesco',
    control: 'text',
    placeholder: 'Ex.: CÔNJUGE, FILHO(A)',
    section: S_SOL,
    layout: { md: 4 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_SOL,
    layout: { md: 4 },
    options: CANAL_OPTS,
  },
  {
    id: 'contatoSol',
    label: 'Contato do solicitante',
    control: 'phone',
    placeholder: '(00) 00000-0000',
    section: S_SOL,
    layout: { md: 4 },
  },
  {
    id: 'dataLigacao',
    label: 'Data/hora do contato',
    control: 'datetime',
    placeholder: 'Use o calendário',
    section: S_SOL,
    layout: { md: 4 },
  },
  {
    id: 'cliente',
    label: 'Nome completo do titular (assinante)',
    control: 'text',
    placeholder: 'Titular da conexão',
    section: S_ASS,
    layout: { md: 12 },
  },
  {
    id: 'contato',
    label: 'Contato do titular',
    control: 'phone',
    placeholder: '(00) 00000-0000',
    section: S_ASS,
    layout: { md: 6 },
  },
  {
    id: 'semSinal',
    label: 'Sinal na ONU',
    control: 'radio',
    section: S_ASS,
    layout: { md: 12 },
    options: [
      { value: 'nao', label: 'Informar medida abaixo' },
      { value: 'sim', label: 'Sem sinal' },
    ],
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-xx.xx dBm',
    section: S_ASS,
    layout: { md: 6 },
  },
  {
    id: 'motivo',
    label: 'Motivo (trecho entre aspas, em caixa alta no texto)',
    control: 'text',
    placeholder: "Ex.: 'deseja cortar gastos'",
    section: S_PLANO,
    layout: { md: 12 },
  },
  {
    id: 'planoAtual',
    label: 'Plano atual',
    control: 'select',
    section: S_PLANO,
    layout: { md: 6 },
    options: ALTPLAN_PLANO_ATUAL_OPTS,
  },
  {
    id: 'planoEscolhido',
    label: 'Plano escolhido',
    control: 'select',
    section: S_PLANO,
    layout: { md: 6 },
    options: ALTPLAN_PLANO_ESCOLHIDO_OPTS,
  },
  {
    id: 'roteador',
    label: 'Roteador',
    control: 'select',
    section: S_PLANO,
    layout: { md: 6 },
    options: ALTPLAN_ROTEADOR_OPTS,
  },
  {
    id: 'dataContrato',
    label: 'Plano contratado em',
    control: 'text',
    placeholder: 'mês/ano',
    section: S_PLANO,
    layout: { md: 6 },
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_PLANO,
    layout: { md: 6 },
  },
  {
    id: 'dataProtocolo',
    label: 'Data/hora do protocolo (registro)',
    control: 'datetime',
    placeholder: 'Use o calendário',
    section: S_PLANO,
    layout: { md: 6 },
  },
]

export function getAltplanRemotoTerceirosExampleDefaults() {
  return {
    slug: 'altplan-remoto-terceiros',
    title: 'Alt plan — remoto (terceiros / titular diferente)',
    outputTemplate: ALTPLAN_REMOTO_TERCEIROS_OUTPUT_TEMPLATE,
    demandCategory: 'alteracao-plano',
    fields: ALTPLAN_REMOTO_TERCEIROS_FIELDS.map((f) => ({
      ...f,
      options: f.options?.map((o) => ({ ...o })),
    })),
  }
}
