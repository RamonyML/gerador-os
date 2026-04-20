import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES DA OCORRÊNCIA E AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.

*******************
    
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONU {{sinalONUUpper}}.
    
*******************
    
QUESTIONADO, DISSE QUE UM DOS EQUIPAMENTOS DE INTERNET NÃO ESTÁ LIGANDO.

REMOTAMENTE VERIFIQUEI QUE {{equip}} ESTÁ DESCONECTADO. 
{{proced}}.
    
PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 
    
*******************
    
INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE DEVIDO {{clientePrimeiro}} CONECTAR O EQUIPAMENTO À ENERGIA CONFORME RECOMENDAÇÃO DA MZNET, ESTARÁ ISENTO DO CUSTO DA FONTE DE ENERGIA. FICANDO APENAS A COBRANÇA DO DESLOCAMENTO DO TÉCNICO COM O CUSTO DE R$50,00.
    
*******************
    
{{clientePrimeiro}} CONCORDOU COM OS TERMOS DA VISITA TÉCNICA E PAGARÁ EM {{formaPag}}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA PARA O DIA {{dataVisita}} A PARTIR DE {{horaVisita}} HRS.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, DISSE "QUE {{equip}} ESTÁ COM TODAS AS LUZES APAGADAS". REMOTAMENTE VERIFIQUEI QUE {{equip}} ESTÁ DESCONECTADO/APAGADA. {{proced}}. PERGUNTEI {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA REALIZAR A SUBSTITUIÇÃO DA FONTE QUEIMADA POR OUTRA DE MODELO SIMILAR. VISITA TÉCNICA POSSUI O CUSTO DE R$50,00 REFERENTE AO DESLOCAMENTO TÉCNICO. {{clientePrimeiro}} CONCORDOU E PAGARÁ NO ATO COM {{formaPag}}. VISITA AGENDADA PARA {{dataVisita}} A PARTIR DE {{horaVisita}} HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: CONFERIR EQUIPAMENTOS E PARTE ELÉTRICA. SUBSTITUIR FONTE QUEIMADA E RESTABELECER ACESSO À INTERNET. CASO HAJA EQUIPAMENTOS DANIFICADOS POR MAL USO ENTRAR EM CONTATO COM O SUPORTE DE IMEDIATO PARA TRATATIVA. TESTAR REDE WI-FI E DISPOSITIVOS LIGADOS POR CABOS, CONFERIR NAVEGAÇÃO IPv6 E AFERIR O PLANO CONTRATADO. SANAR TODAS AS DÚVIDAS DE {{clientePrimeiro}}, COLHER ASSINATURA DA ORDEM DE SERVIÇO E RECEBER SERVIÇO.

=== Texto da Agenda ===
MAN TROCA FONTE {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}`

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

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente números',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal atual',
    control: 'text',
    placeholder: 'Ex.: -31.87 dBm',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Bairro do cliente',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'equip',
    label: 'Tipo da fonte',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
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
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
    options: [
      { value: '08:30', label: '08:30' },
      { value: '09:30', label: '09:30' },
      { value: '10:30', label: '10:30' },
      { value: '11:30', label: '11:30' },
      { value: '13:30', label: '13:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo',
    control: 'text',
    placeholder: '123.456',
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
    options: [
      { value: 'ANA', label: 'ANA CAROLINA' },
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'EDUARDO', label: 'EDUARDO' },
      { value: 'GABRIEL M.', label: 'GABRIEL MARTINS' },
      { value: 'GABRIEL V.', label: 'GABRIEL VICTOR' },
      { value: 'HIAGO', label: 'HIAGO' },
      { value: 'KAROLAYNE', label: 'KAROLAYNE' },
      { value: 'LUIS', label: 'LUIS' },
      { value: 'PEDRO', label: 'PEDRO' },
      { value: 'PRISCILA', label: 'PRISCILA' },
      { value: 'RAMONY', label: 'RAMONY' },
      { value: 'RENATA', label: 'RENATA' },
      { value: 'VICTOR H.', label: 'VICTOR HUGO' },
      { value: 'VITOR M.', label: 'VITOR MANOEL' },
      { value: 'VAGNER', label: 'VAGNER' },
    ],
  },
]

export function getManutFonteQueimadaComVisitaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-fonte-queimada-com-visita',
    title: 'Manutenção — Fonte queimada (com visita)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
