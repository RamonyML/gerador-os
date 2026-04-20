import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'OCORRÊNCIA E VISITA À LOJA'

const PROCED_OPTS = [
  {
    value:
      'ORIENTEI CLIENTE A INVERTER A FONTE DA ONU COM A DO ROTEADOR, E ASSIM EQUIPAMENTO FUNCIONOU',
    label: 'Realizado inversão das fontes (ONU/Roteador)',
  },
  {
    value:
      'ORIENTEI CLIENTE A CONECTAR A FONTE DE ENERGIA EM OUTRA TOMADA, E EQUIPAMENTO NÃO LIGOU',
    label: 'Realizado teste em outra tomada (ONT)',
  },
]

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.

*******************
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E FIBRA COM SINAL: {{sinalONUUpper}}.
    
*******************
    
QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO.
    
REMOTAMENTE VERIFIQUEI QUE {{equip}} ESTÁ DESCONECTADO. 
{{proced}}
    
PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
    
*******************

INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA, E QUE DEVIDO {{clientePrimeiro}} TER CONECTADO O EQUIPAMENTO À ENERGIA CONFORME RECOMENDAÇÃO DA MZNET, ESTARÁ ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANÇA DO DESLOCAMENTO DO TÉCNICO COM O CUSTO DE R$50,00.

SUGERI TAMBÉM, A POSSIBILIDADE DE COMPARECER À LOJA E RETIRAR UMA NOVA FONTE DE ENERGIA SEM NENHUM CUSTO ADICIONAL.

*******************
    
{{clientePrimeiro}} OPTOU POR VIR À LOJA, DISSE QUE VIRÁ NO DIA {{dataVisita}} NO PERÍODO DA {{horaVisita}}.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}). EQUIPAMENTO {{equip}} SEM ENERGIA / DESCONECTADO APÓS TESTE REMOTO ({{proced}}). CLIENTE OPTOU POR RETIRAR FONTE DE {{equip}} NA LOJA SEM CUSTO DA PEÇA, CONFORME ORIENTAÇÃO. PREVISÃO: {{dataVisita}} NO PERÍODO DA {{horaVisita}}.

******************************************

INDICAÇÃO TÉCNICA (LOJA / LEIA):

PREPARAR FONTE COMPATÍVEL COM {{equip}}. REGISTRAR PROTOCOLO {{protocolo}} NO GRUPO DE PASSAGEM. ORIENTAR CLIENTE SOBRE INSTALAÇÃO CORRETA NA RESIDÊNCIA.

=== Texto da Agenda ===
*{{clienteUpper}}*
CLIENTE VIRÁ NA LOJA RECOLHER UMA FONTE DE {{equip}} SEM CUSTOS. EM  {{dataVisita}} NO PERÍODO DA {{horaVisita}}.
PROTOCOLO Nº:{{protocolo}}`

const FIELDS: OsTemplateField[] = [
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
    layout: { md: 2 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    section: S_ID,
    layout: { md: 2 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal atual',
    control: 'text',
    placeholder: 'Ex.: -31.87 dBm',
    section: S_ID,
    layout: { md: 2 },
  },
  {
    id: 'equip',
    label: 'Tipo da fonte',
    control: 'select',
    section: S_DET,
    layout: { md: 2 },
    options: [
      { value: 'ONU', label: 'Fonte ONU' },
      { value: 'ONT', label: 'Fonte ONT' },
      { value: 'ROTEADOR', label: 'Fonte Roteador' },
    ],
  },
  {
    id: 'proced',
    label: 'Procedimento',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: PROCED_OPTS,
  },
  {
    id: 'dataVisita',
    label: 'Visita na loja (data)',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_DET,
    layout: { md: 2 },
  },
  {
    id: 'horaVisita',
    label: 'Período',
    control: 'select',
    section: S_DET,
    layout: { md: 2 },
    options: [
      { value: 'MANHÃ', label: 'MANHÃ' },
      { value: 'TARDE', label: 'TARDE' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 2 },
  },
]

export function getManutFonteQueimadaLojaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-fonte-queimada-loja',
    title: 'Manutenção — Fonte queimada (retirada na loja)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
