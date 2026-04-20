import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DET = 'DETALHES E AGENDAMENTO'

const OUTPUT = `=== Texto Protocolo ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) INFORMANDO PROBLEMA DE CONEXÃO.

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ONT SEM SINAL (DYINGGASP).

QUESTIONADO, DISSE QUE O EQUIPAMENTO DE INTERNET NÃO ESTÁ LIGANDO ({{onu}}).

REMOTAMENTE VERIFIQUEI QUE USUÁRIO ESTÁ DESCONECTADO E ONT {{alarme}} (SEM SINAL: DYINGGASP). ORIENTEI {{clientePrimeiro}} A DESCONECTAR O CABO DE ENERGIA DA ONT E RECONECTÁ-LOS APÓS 30 SEGUNDOS, FEITO, PORÉM, CONEXÃO NÃO RESTABELECEU.

PERGUNTEI A {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. 

INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS.

{{clientePrimeiro}} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM {{formaPag}}, DISSE QUE ESTARÁ PRESENTE PARA ACOMPANHAR O TÉCNICO. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA {{dataVisita}} {{horaVisita}}.

CLIENTE SEM DUVIDAS.

=== Texto O.S ===
{{clientePrimeiro}} ENTROU EM CONTATO POR {{canal}} ({{contatoNumerico}}) E DISSE QUE ESTÁ SEM CONEXÃO COM A INTERNET. QUESTIONADO, {{clientePrimeiro}} DISSE "QUE ONT {{alarme}}". REMOTAMENTE VERIFIQUEI QUE ONT ESTÁ DESCONECTADO/APAGADA. ORIENTEI {{clientePrimeiro}} A RETIRAR A FONTE DE ENERGIA DA TOMADA ELÉTRICA E RECONECTAR APÓS 30 SEGUNDOS. FEZ, PORÉM CONEXÃO NÃO RESTABELECEU. PERGUNTEI {{clientePrimeiro}} SE EFETUOU ALGUMA MODIFICAÇÃO/INTERVENÇÃO NA INSTALAÇÃO E CLIENTE DISSE QUE NÃO. INFORMEI QUE É NECESSÁRIO VISITA TÉCNICA PARA VERIFICAR A FONTE DO PROBLEMA E QUE HAVENDO PROBLEMA DA RESPONSABILIDADE DO PROVEDOR VISITA NÃO TERÁ CUSTOS, MAS, SENDO PROBLEMA OCASIONADO (ESPONTANEO OU NÃO), SERÁ COBRADA VISITA TÉCNICA DE R$50,00 E ATÉ MESMO EQUIPAMENTOS SE DANIFICADOS. {{clientePrimeiro}} CONCORDOU COM A VISITA E CASO HAJA COBRANÇA SOLICITOU PAGAR NO ATO COM {{formaPag}}. VISITA AGENDADA (A PEDIDO DO CLIENTE) PARA O DIA {{dataVisita}} {{horaVisita}}.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: CONFERIR A TOMADA, T , ETC. ONDE ESTÁ LIGADA ONT. CONFERIR FONTE DO EQUIPAMENTO E CONFERIR ONT (APARÊNCIA FÍSICA). SE NÃO FOR PROBLEMAS NA TOMADA, NA FONTE E ONT ESTIVER SEM AVARIAS, SUBSTITUIR {{onu}} POR OUTRA SIMILAR. EFETUAR TESTES PADRÕES, FILMAR E FOTOGRAFAR. VERIFICAR ATUALIZAÇÃO DO FIRMWARE DA ONT. CASO PROBLEMA SEJA NA TOMADA, T , FONTES OU ONT AVARIADA: FILMAR E ENCAMINHAR PARA SUPORTE QUE LIGARÁ DE IMEDIATO PARA CLIENTE. SANAR TODAS AS DÚVIDAS DE {{clientePrimeiro}}. TEMPO ESTIMADO 40 MINUTOS.

=== Texto da Agenda ===
MAN TROCA ONT {{clienteUpper}} PROT:{{protocolo}} {{formaPag}} ({{operadorOuSemSinal}}) - {{bairroUpper}}`

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
    id: 'alarme',
    label: 'Alarme',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      {
        value: 'ESTÁ APENAS COM A LUZ POWER ACESA',
        label: 'Luz Power',
      },
      {
        value: 'ESTÁ APENAS COM AS LUZES POWER/LAN ACESAS',
        label: 'Luz PWR/LAN',
      },
      {
        value: 'ESTÁ COM TODAS AS LUZES APAGADAS',
        label: 'Luzes apagadas',
      },
    ],
  },
  {
    id: 'onu',
    label: 'ONT atual',
    control: 'select',
    section: S_DET,
    layout: { md: 4 },
    options: [
      { value: 'ONT ZTE F 670-L', label: 'ONT ZTE F 670-L' },
      { value: 'ONT TP-LINK XC220', label: 'ONT TP-LINK XC220' },
      { value: 'ONT TP-LINK XC230', label: 'ONT TP-LINK XC230' },
      { value: 'ONT TP-LINK XX530', label: 'ONT TP-LINK XX530' },
      { value: 'ONT TP-LINK XX530v2', label: 'ONT TP-LINK XX530v2' },
    ],
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    section: S_DET,
    layout: { md: 4 },
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
    section: S_DET,
    layout: { md: 3 },
  },
  {
    id: 'formaPag',
    label: 'Forma de pagamento',
    control: 'select',
    section: S_DET,
    layout: { md: 3 },
    options: [
      { value: 'PIX', label: 'PIX' },
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'CARTAO', label: 'CARTAO' },
    ],
  },
  {
    id: 'operador',
    label: 'Operador',
    control: 'select',
    section: S_DET,
    layout: { md: 12 },
    options: [
      { value: 'ANDREZA', label: 'ANDREZA' },
      { value: 'BRUNA', label: 'BRUNA' },
      { value: 'DEIVIT', label: 'DEIVIT' },
      { value: 'EDUARDO', label: 'EDUARDO' },
      { value: 'GABRIEL M.', label: 'GABRIEL MARTINS' },
      { value: 'GABRIEL V.', label: 'GABRIEL VICTOR' },
      { value: 'HIAGO', label: 'HIAGO' },
      { value: 'IZABELA', label: 'IZABELA' },
      { value: 'KAROLAYNE', label: 'KAROLAYNE' },
      { value: 'LETÍCIA', label: 'LETICIA' },
      { value: 'LUIS', label: 'LUIS' },
      { value: 'PEDRO', label: 'PEDRO' },
      { value: 'RAMONY', label: 'RAMONY' },
      { value: 'RENATA', label: 'RENATA' },
      { value: 'VICTOR H.', label: 'VICTOR HUGO' },
      { value: 'VITOR M.', label: 'VITOR MANOEL' },
      { value: 'VAGNER', label: 'VAGNER' },
    ],
  },
]

export function getManutOntQueimadaDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-ont-queimada',
    title: 'Manutenção — ONT queimada',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
