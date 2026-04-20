import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'
const S_DESC = 'DATA DE DESCONEXÃO'
const S_ANA = 'ANÁLISE DO SINAL ÓPTICO'
const S_AGE = 'AGENDAMENTO DA VISITA TÉCNICA'

const OUTPUT = `=== Texto Protocolo ===
DURANTE MONITORAMENTO DE CLIENTE IDENTIFIQUEI QUE O MESMO ESTÁ SEM SINAL.
=====================
CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E {{equipamentoOuOnu}} SEM SINAL.
=============
APÓS MONITORAMENTO REALIZADO EM SISTEMA, FOI IDENTIFICADO QUE O CLIENTE ({{clienteUpper}}) ENCONTRA-SE DESCONECTADO DESDE {{dataDesconexao}}.

EM ANÁLISE DO SINAL ÓPTICO, FOI VERIFICADA A PRESENÇA DE ALARME {{alarmeMonitoramentoCompleto}}.

CONSIDERANDO TRATAR-SE DE CLIENTE EMPRESARIAL E DIANTE DA AUSÊNCIA DE CONTATO POR PARTE DO CLIENTE, SERÁ REALIZADO DESLOCAMENTO TÉCNICO PARA VERIFICAÇÃO PRESENCIAL E DIAGNÓSTICO DA OCORRÊNCIA.

VISITA TÉCNICA AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}}HRS.

==============================

=== Texto O.S ===
MONITORAMENTO: CLIENTE {{clienteUpper}} SEM CONEXÃO. EQUIPAMENTO {{equipamentoOuOnu}} SEM SINAL. DESCONECTADO EM SISTEMA DESDE {{dataDesconexao}}. EM ANÁLISE DE SINAL ÓPTICO — ALARME {{alarmeMonitoramentoCompleto}}. TRATANDO-SE DE CLIENTE EMPRESARIAL, DESLOCAMENTO PARA VERIFICAÇÃO PRESENCIAL E DIAGNÓSTICO. VISITA AGENDADA PARA {{dataVisita}} ÀS {{horaVisita}}HRS.

******************************************

INDICAÇÃO TÉCNICA:

TÉCNICO: COMPARECER NO HORÁRIO AGENDADO. VERIFICAR ENERGIA, CABOS, CONECTOR E INTEGRIDADE DA {{equipamentoOuOnu}}; AFERIR E DOCUMENTAR SINAL ÓPTICO; IDENTIFICAR CAUSA (DROP, EQUIPAMENTO, REDE) E RESTABELECER O SERVIÇO. COMUNICAR SUPORTE SE NECESSÁRIO EQUIPAMENTO OU OBRA ADICIONAL. REGISTRAR O QUE FOI EXECUTIDO E COLHER ASSINATURA SE APLICÁVEL.

=== Texto da Agenda ===
MAN MONITORAMENTO SEM SINAL {{clienteUpper}} PROT:{{protocolo}} ({{operadorOuSemSinal}}) — VISITA {{dataVisita}} {{horaVisita}} — {{bairroUpper}}`

const FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome do cliente',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'equipamento',
    label: 'Equipamento (padrão ONU)',
    control: 'radio',
    section: S_ID,
    layout: { md: 4 },
    options: [
      { value: 'ONU', label: 'ONU' },
      { value: 'ONT', label: 'ONT' },
    ],
  },
  {
    id: 'dataDesconexao',
    label: 'Data de desconexão',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_DESC,
    layout: { md: 6 },
  },
  {
    id: 'tipoAlarme',
    label: 'Tipo de alarme',
    control: 'radio',
    section: S_ANA,
    layout: { md: 12 },
    options: [
      { value: 'LINK LOSS', label: 'LINK LOSS' },
      { value: 'DE SINAL ALTO', label: 'SINAL ALTO (informe medida)' },
    ],
  },
  {
    id: 'sinalMonitoramento',
    label: 'Medida (só para SINAL ALTO)',
    control: 'text',
    placeholder: '-XX.XXDBM',
    section: S_ANA,
    layout: { md: 6 },
  },
  {
    id: 'dataVisita',
    label: 'Data da visita',
    control: 'text',
    placeholder: 'dd/mm/aaaa',
    section: S_AGE,
    layout: { md: 6 },
  },
  {
    id: 'horaVisita',
    label: 'Horário',
    control: 'select',
    section: S_AGE,
    layout: { md: 6 },
    options: [
      { value: '08:30', label: '08:30' },
      { value: '09:30', label: '09:30' },
      { value: '10:30', label: '10:30' },
      { value: '11:30', label: '11:30' },
      { value: '14:30', label: '14:30' },
      { value: '15:30', label: '15:30' },
      { value: '16:30', label: '16:30' },
      { value: '17:30', label: '17:30' },
    ],
  },
  {
    id: 'protocolo',
    label: 'Nº protocolo (agenda)',
    control: 'text',
    placeholder: '123.456',
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro (agenda)',
    control: 'text',
    placeholder: 'Bairro',
    section: S_AGE,
    layout: { md: 4 },
  },
  {
    id: 'operador',
    label: 'Operador (agenda)',
    control: 'select',
    section: S_AGE,
    layout: { md: 4 },
    options: [
      { value: '', label: 'Selecione…' },
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

export function getManutMonitoramentoClienteSemSinalDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'manut-monitoramento-cliente-sem-sinal',
    title: 'Manutenção — Monitoramento cliente sem sinal',
    demandCategory: 'manutencao',
    outputTemplate: OUTPUT,
    fields: FIELDS.map((f) => ({ ...f })),
  }
}
