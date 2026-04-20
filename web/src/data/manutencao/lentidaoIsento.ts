import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES DA SOLICITAÇÃO'
const S_AGE = 'AGENDAMENTO'

const REPETIDOR_OPTS = [
  {
    value:
      ' CLIENTE TAMBÉM MENCIONOU QUE POSSUI REPETIDOR E O MESMO ESTÁ LIGADO POR WI-FI',
    label: 'Repetidor via Wi-Fi',
  },
  {
    value:
      ' CLIENTE TAMBÉM MENCIONOU QUE POSSUI REPETIDOR E O MESMO ESTÁ LIGADO POR CABO DE REDE',
    label: 'Repetidor via cabo',
  },
  {
    value:
      ' CLIENTE POSSUI WI-FI EXTEND E O MESMO ESTÁ CONECTADO POR WI-FI (MESH)',
    label: 'Wi-Fi Extend via Mesh',
  },
  {
    value:
      ' CLIENTE POSSUI WI-FI EXTEND E O MESMO ESTÁ CONECTADO POR CABO DE REDE',
    label: 'Wi-Fi Extend via cabo',
  },
  {
    value: ' CLIENTE NÃO POSSUI REPETIDOR DE SINAL',
    label: 'Sem repetidor',
  },
]

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO VIA {{canal}} ({{contatoNumerico}}) INFORMANDO LENTIDÃO NA CONEXÃO COM A INTERNET.

QUESTIONADO, {{clientePrimeiro}} DISSE QUE TODOS OS DISPOSITIVOS DA RESIDÊNCIA FICAM COM A INTERNET LENTA REPETIDAS VEZES AO LONGO DO DIA E NÃO CONSEGUE AFERIR A VELOCIDADE DO PLANO EM NENHUM DISPOSITIVO.

REMOTAMENTE VERIFIQUEI QUE O CLIENTE ESTÁ CONECTADO; SINAL ONU ({{sinalONUUpper}} {{oscila}}) SEM DESCONEXÕES REGISTRADAS NO MOMENTO; HÁ {{disp1}} DISPOSITIVOS CONECTADOS AO ROTEADOR, {{disp2}} VIA WI-FI E {{disp3}} POR CABO.{{repetidor}}

{{gestor}} AUTORIZOU VISITA ISENTA DE CUSTOS DESDE QUE OS EQUIPAMENTOS ESTEJAM EM PERFEITO ESTADO DE CONSERVAÇÃO.

VISITA AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}} HRS.

CLIENTE SEM DÚVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO VIA {{canal}} ({{contatoNumerico}}) E DISSE QUE ESTÁ COM LENTIDÃO NA CONEXÃO COM A INTERNET, QUESTIONADO INFORMOU QUE "TODOS OS DISPOSITIVOS DA RESIDÊNCIA FICAM COM A INTERNET LENTA REPETIDAS VEZES AO LONGO DO DIA E NÃO CONSEGUE AFERIR A VELOCIDADE DO PLANO EM NENHUM DE SEUS DISPOSITIVOS". REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ CONECTADO, SINAL ONU ({{sinalONUUpper}} {{oscila}}) NÃO CONSTAM DESCONEXÕES, NO MOMENTO HÁ {{disp1}} DISPOSITIVOS CONECTADOS AO ROTEADOR, {{disp2}} VIA WI-FI E {{disp3}} POR CABO.{{repetidor}} {{clientePrimeiro}} SOLICITOU VISITA TÉCNICA PARA VERIFICAR PROBLEMA QUE "DIZ TER". {{gestor}} AUTORIZOU VISITA ISENTA DE CUSTOS DESDE QUE OS EQUIPAMENTOS ESTEJAM EM PERFEITO ESTADO DE CONSERVAÇÃO. {{clientePrimeiro}} DISSE ESTAR CIENTE E CONCORDOU COM A VISITA QUE FOI AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}} HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: PEDIR PARA QUE {{clientePrimeiro}} APRESENTE OS “PROBLEMAS DE INTERNET” QUE DIZ TER. COMPARAR TESTES ENTRE DISPOSITIVOS DELES COM DISPOSITIVOS (CELULAR E NOTEBOOK) DO KIT TÉCNICO. VISITA ISENTA DE CUSTOS (CORTESIA). CASO APRESENTAR ALGUM PROBLEMA ATUALIZAR O ROTEADOR COM UMA NOVA FIRMWARE E TESTAR NOVAMENTE, E SE AINDA NÃO RESOLVER SUBSTITUIR O ROTEADOR POR UM NOVO. EXPLICAR E TIRAR TODAS AS DÚVIDAS DO CLIENTE. TEMPO ESTIMADO 60 MINUTOS.

=== Texto da Agenda ===
MAN TESTES {{clienteUpper}} PROT:{{protocolo}} ISENTO ({{operadorOuSemSinal}}) - {{bairroUpper}}`

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome completo',
    control: 'text',
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
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'oscila',
    label: 'Sinal oscilando?',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'COM OSCILAÇÃO', label: 'Sim' },
      { value: 'SEM OSCILAÇÃO', label: 'Não' },
    ],
  },
  {
    id: 'repetidor',
    label: 'Repetidor de sinal',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: REPETIDOR_OPTS,
  },
  {
    id: 'disp1',
    label: 'Total de aparelhos na rede',
    control: 'text',
    placeholder: 'Número',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'disp2',
    label: 'Via Wi-Fi',
    control: 'text',
    placeholder: 'Número',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'disp3',
    label: 'Via cabo',
    control: 'text',
    placeholder: 'Número',
    section: S_DET,
    layout: { md: 4 },
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'horaVisita',
    label: 'Hora',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
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
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'gestor',
    label: 'Isenção autorizada por',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'HIAGO', label: 'HIAGO' },
    ],
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_AGE,
    layout: { md: 8 },
    options: [
      { value: 'ANDREZA', label: 'ANDREZA' },
      { value: 'BRUNA', label: 'BRUNA' },
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'EDUARDO', label: 'EDUARDO' },
      { value: 'GABRIEL M.', label: 'GABRIEL MARTINS' },
      { value: 'JHONATAN', label: 'JHONATAN' },
      { value: 'JOSÉ Jr', label: 'JOSÉ Jr' },
      { value: 'HALYSON', label: 'HALYSON' },
      { value: 'HIAGO', label: 'HIAGO' },
      { value: 'HIORRANNA', label: 'HIORRANNA' },
      { value: 'IZABELA', label: 'IZABELA' },
      { value: 'KAROLAYNE', label: 'KAROLAYNE' },
      { value: 'LAUREN', label: 'LAUREN' },
      { value: 'LUIS', label: 'LUIS' },
      { value: 'PEDRO', label: 'PEDRO' },
      { value: 'RAMONY', label: 'RAMONY' },
      { value: 'RENATA', label: 'RENATA' },
      { value: 'RONALD', label: 'RONALD' },
      { value: 'VICTOR H.', label: 'VICTOR HUGO' },
      { value: 'VITOR M.', label: 'VITOR MANOEL' },
      { value: 'VAGNER', label: 'VAGNER' },
    ],
  },
]

export function getManutLentidaoIsentoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-lentidao-isento',
    title: 'Manutenção — Lentidão (visita isenta)',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
