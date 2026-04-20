import type { OsTemplateField } from '../types/osTemplate'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_PLANO = 'DETALHES DO PLANO'

/** Equivalente a `textoProtocolo` + `textoOS` + encerramento do index-altplan-remoto.html (legado). */
export const ALTPLAN_REMOTO_PADRAO_OUTPUT_TEMPLATE = `=== TEXTO PARA PROTOCOLO ===

{{clientePrimeiro}} ENTROU EM CONTATO VIA {{canal}} ({{contatoNumerico}}) SOLICITANDO ALTERAÇÃO DE PLANO.

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

{{clientePrimeiro}} CONCORDOU COM OS TERMOS DE ALTERAÇÃO DE PLANO, SOLICITOU PROSSEGUIR COM O PROCESSO DE FORMA REMOTA E VALIDOU SOBRE A RENOVAÇÃO DA FIDELIDADE POR 12 MESES. VALIDAÇÃO FEITA POR {{canal}} ({{contatoNumerico}}) DIA {{dataLigacaoData}} ÀS {{dataLigacaoHora}} HRS.

=== TEXTO PARA O.S ===

{{clientePrimeiro}} SOLICITOU POR {{canal}} ({{contatoNumerico}}) ALTERAÇÃO DO PLANO DE INTERNET: PLANO ATUAL: {{planoAtual}}. PLANO ESCOLHIDO: {{planoEscolhido}}. RENOVA-SE CONTRATO DE PERMANÊNCIA PARA 12 (DOZE) MESES A PARTIR DA ASSINATURA DA O.S E CONTRATO. NÃO É NECESSÁRIA VISITA TÉCNICA, O ROTEADOR INSTALADO ANTERIORMENTE É COMPATÍVEL COM O NOVO PLANO ESCOLHIDO E {{clientePrimeiro}} DISSE QUE A INSTALAÇÃO DESTE PERMANECE COMO FOI EXECUTADA, EQUIPAMENTO PERMANECERÁ EMPRESTADO EM REGIME DE COMODATO. PROTOCOLO Nº{{protocolo}} EM {{dataProtocoloData}} ÀS {{dataProtocoloHora}} HRS.

=== TEXTO DE ENCERRAMENTO (data/hora no momento da geração) ===

ALTERAÇÃO DE PLANO EXECUTADA REMOTAMENTE COM SUCESSO.
ASSINATURA DIGITAL + SELFIE EM ANEXO.
NÃO HOUVE INTERVENÇÃO TÉCNICA DEVIDO O ROTEADOR EM COMODATO SER COMPATÍVEL AO PLANO ACORDADO ({{roteador}}).

CLIENTE SEM DÚVIDAS.

DATA/HORA DO ENCERRAMENTO: {{encerramento.data}} ÀS {{encerramento.hora}}HRS`

/** Reutilizado pelo modelo «remoto terceiros». */
export const ALTPLAN_PLANO_ATUAL_OPTS = [
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
  {
    value: '500 MEGA + WI-FI EXTEND/119,90',
    label: '500MB/119,90 — WI-FI EXTEND (CGNAT)',
  },
  {
    value: '1000 MEGA + WI-FI EXTEND/139,90',
    label: '1000MB/139,90 — WI-FI EXTEND (CGNAT)',
  },
]

export const ALTPLAN_PLANO_ESCOLHIDO_OPTS = [
  {
    value:
      '150 MEGA/59,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '150 MEGA/59,90 + MZTV (CDNTV+)',
  },
  {
    value:
      '300 MEGA/69,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '300 MEGA/69,90 + MZTV (CDNTV+)',
  },
  {
    value:
      '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/79,90 + MZTV (CDNTV+)',
  },
  {
    value:
      '1 GIGA (1.000 MEGA) R$99,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/99,90 + MZTV (CDNTV+) + VOD',
  },
  {
    value:
      '150 MEGA/80,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '150 MEGA/80,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value:
      '300 MEGA/90,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '300 MEGA/90,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value:
      '600 MEGA/100,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/100,00 + MZTV (CDNTV+) + IP DIN',
  },
  {
    value:
      '1 GIGA (1.000 MEGA) R$120,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/120,00 + MZTV (CDNTV+) + VOD + IP DIN',
  },
  {
    value:
      '600 MEGA/109,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV',
    label: '600 MEGA/109,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)',
  },
  {
    value:
      '1 GIGA (1.000 MEGA) R$129,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV + VOD',
    label: '1000 MEGA/129,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)',
  },
  {
    value:
      '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    label: '600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
  {
    value:
      '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    label: '1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND',
  },
]

export const ALTPLAN_ROTEADOR_OPTS = [
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
  { value: 'ONT TP-LINK X530', label: 'ONT TP-LINK X530' },
  {
    value: 'ZTE H199-A + ZTE H199-A',
    label: 'ZTE H199-A + ZTE H199-A (Wi‑Fi Extend)',
  },
  {
    value: 'ZTE H199-A + ZTE H196',
    label: 'ZTE H199-A + ZTE H196 (Wi‑Fi Extend)',
  },
  {
    value: 'ONT ZTE F 670-L + ZTE H199-A',
    label: 'ONT ZTE F 670-L + ZTE H199-A (Wi‑Fi Extend)',
  },
  {
    value: 'ONT ZTE F 670-L + ZTE H196',
    label: 'ONT ZTE F 670-L + ZTE H196 (Wi‑Fi Extend)',
  },
  { value: 'PARTICULAR DO CLIENTE', label: 'ROTEADOR PARTICULAR' },
]

export const ALTPLAN_REMOTO_PADRAO_FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 12 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 6 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: '(00) 00000-0000',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'dataLigacao',
    label: 'Data/hora do contato',
    control: 'datetime',
    placeholder: 'Use o calendário',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'semSinal',
    label: 'Sinal na ONU',
    control: 'radio',
    section: S_ID,
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
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'motivo',
    label: 'Motivo (apenas o trecho entre aspas, em caixa alta no texto)',
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
    label: 'Data/hora do protocolo',
    control: 'datetime',
    placeholder: 'Use o calendário',
    section: S_PLANO,
    layout: { md: 6 },
  },
]

export function getAltplanRemotoPadraoExampleDefaults() {
  return {
    slug: 'altplan-padrao-remoto',
    title: 'Alt plan — remoto (padrão, PF/residencial)',
    outputTemplate: ALTPLAN_REMOTO_PADRAO_OUTPUT_TEMPLATE,
    demandCategory: 'alteracao-plano',
    fields: ALTPLAN_REMOTO_PADRAO_FIELDS.map((f) => ({
      ...f,
      options: f.options?.map((o) => ({ ...o })),
    })),
  }
}
