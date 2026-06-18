/**
 * Agenda de visitas técnicas (instalação + mudança de endereço) e manutenção.
 * Cada dia/área é uma grade: linhas = técnicos, colunas = horários, e cada
 * célula é um agendamento (texto livre) com uma cor (status) e destaque opcional.
 *
 * O significado das cores (mantido em comentário; ainda não exibido na UI):
 *  AGENDA (instalação):
 *   - branco: agendado pelo comercial
 *   - amareloPastel: em análise (cadastro)
 *   - amareloPastel + negrito: em análise, tratar algo com o cliente
 *   - azul: aprovado (cadastro)
 *   - vermelho (Negados): não aprovado pelo cadastro
 *  AGENDA (mudança de endereço):
 *   - amarelo: agendado pelo suporte
 *   - amarelo + negrito: validado/autorizado (gerência/validador/supervisão)
 *  MANUTENÇÃO:
 *   - branco: agendado pelo operador
 *   - verde: validado
 *   - azulPastel: conferência final (gerência)
 *   - laranja: cliente ausente / reagendar
 *   - azulClaro: particularidades (motivo relativo)
 *   - cinza: visita realizada com sucesso
 *   - verdeClaro: feedback com o cliente realizado
 */
export type AgendaArea = 'agenda' | 'manutencao'

export const AGENDA_AREAS: AgendaArea[] = ['agenda', 'manutencao']

export const AGENDA_AREA_LABELS: Record<AgendaArea, string> = {
  agenda: 'Agenda',
  manutencao: 'Manutenção',
}

export type CellColor =
  | 'branco'
  | 'amarelo'
  | 'amareloVivo'
  | 'amareloPastel'
  | 'azul'
  | 'verde'
  | 'azulPastel'
  | 'laranja'
  | 'azulClaro'
  | 'cinza'
  | 'verdeClaro'

export type ColorDef = {
  /** Rótulo interno (ainda não exibido na UI). */
  label: string
  /** Cor de fundo da célula. */
  fill: string
  /** Cor de fundo no tema escuro (um pouco mais saturada/escura). */
  fillDark: string
  /** Cor da borda/realce. */
  border: string
}

export const COLOR_DEFS: Record<CellColor, ColorDef> = {
  branco: { label: 'Agendado', fill: '#ffffff', fillDark: '#1f2733', border: '#d0d7de' },
  amarelo: { label: 'Agendado (suporte)', fill: '#ffe066', fillDark: '#8a7320', border: '#f1c40f' },
  amareloVivo: { label: 'Amarelo vivo', fill: '#ffd43b', fillDark: '#8a6f18', border: '#fab005' },
  amareloPastel: { label: 'Em análise', fill: '#fff3bf', fillDark: '#6b5d1f', border: '#f5d76e' },
  azul: { label: 'Aprovado', fill: '#a5d8ff', fillDark: '#1b4a73', border: '#4dabf7' },
  verde: { label: 'Validado', fill: '#b2f2bb', fillDark: '#1e5a2e', border: '#51cf66' },
  azulPastel: { label: 'Conferência', fill: '#d0ebff', fillDark: '#244a66', border: '#74c0fc' },
  laranja: { label: 'Ausente / reagendar', fill: '#ffd8a8', fillDark: '#7a4b16', border: '#ff922b' },
  azulClaro: { label: 'Particularidade', fill: '#e7f5ff', fillDark: '#2b3f52', border: '#a5d8ff' },
  cinza: { label: 'Realizada', fill: '#dee2e6', fillDark: '#3a4250', border: '#adb5bd' },
  verdeClaro: { label: 'Feedback realizado', fill: '#d3f9d8', fillDark: '#2a5536', border: '#8ce99a' },
}

/** Vermelho usado na sub-área de Negados (agenda). */
export const NEGADO_COLOR = { fill: '#ffc9c9', fillDark: '#7a2222', border: '#fa5252' }

/** Cores disponíveis no pincel por área. */
export const AREA_PALETTE: Record<AgendaArea, CellColor[]> = {
  agenda: ['branco', 'amareloPastel', 'amarelo', 'azul'],
  manutencao: ['branco', 'amareloVivo', 'verde', 'azulPastel', 'laranja', 'azulClaro', 'cinza', 'verdeClaro'],
}

export type AgendaCellStatus = 'redes' | 'validado' | 'com_pendencia' | 'reagendar'

export const AGENDA_CELL_STATUS_LABELS: Record<AgendaCellStatus, string> = {
  redes: 'Redes',
  validado: 'Validado',
  com_pendencia: 'Com pendência',
  reagendar: 'Reagendar',
}

export type AgendaCellHistoryEntry = {
  /** ISO 8601 da edição. */
  at: string
  byUid: string
  byName: string
  /** Texto que existia ANTES desta edição. */
  prevText: string
}

export type AgendaCell = {
  text: string
  color: CellColor
  /** Destaque (negrito + ícone) para estados que exigem atenção. */
  bold: boolean
  /** Status operacional da célula (validação). */
  status?: AgendaCellStatus
  /** Observação livre associada ao status. */
  statusObs?: string
  /** Histórico de edições do texto (mais recente primeiro). */
  history?: AgendaCellHistoryEntry[]
}

export type AgendaTecnico = {
  id: string
  nome: string
  veiculo: 'carro' | 'moto'
}

export const DEFAULT_TECNICOS: AgendaTecnico[] = [
  { id: 'tec-franklim',  nome: 'FRANKLIM',  veiculo: 'carro' },
  { id: 'tec-ericles',   nome: 'ERICLES',   veiculo: 'carro' },
  { id: 'tec-kelson',    nome: 'KELSON',    veiculo: 'carro' },
  { id: 'tec-thalisson', nome: 'THALISSON', veiculo: 'carro' },
  { id: 'tec-wanderson', nome: 'WANDERSON', veiculo: 'carro' },
  { id: 'tec-junior',    nome: 'JUNIOR',    veiculo: 'moto'  },
  { id: 'tec-everton',   nome: 'EVERTON',   veiculo: 'moto'  },
  { id: 'tec-tolentino', nome: 'TOLENTINO', veiculo: 'moto'  },
]

export type AgendaSlot = {
  id: string
  label: string
}

export type NegadoItem = {
  id: string
  text: string
  /** Técnico/horário de origem (referência opcional). */
  origem?: string
}

export type AgendaDia = {
  area: AgendaArea
  /** Data no formato yyyy-MM-dd. */
  date: string
  slots: AgendaSlot[]
  tecnicos: AgendaTecnico[]
  /** Mapa de células: chave `${tecnicoId}__${slotId}`. */
  cells: Record<string, AgendaCell>
  /** Sub-área de negados (somente agenda). */
  negados: NegadoItem[]
}

export const DEFAULT_SLOTS: Record<AgendaArea, string[]> = {
  agenda: ['8:00', '10:00', '13:00', '15:00', '17:00'],
  manutencao: ['8:30', '9:30', '10:30', '11:30', '14:30', '15:30', '16:30', '17:30', '18:30'],
}

export function defaultSlots(area: AgendaArea): AgendaSlot[] {
  return DEFAULT_SLOTS[area].map((label, i) => ({ id: `s${i + 1}`, label }))
}

export function cellKey(tecnicoId: string, slotId: string): string {
  return `${tecnicoId}__${slotId}`
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/** Documento padrão (vazio) para um dia/área ainda não persistido. */
export function emptyDia(area: AgendaArea, date: string): AgendaDia {
  return {
    area,
    date,
    slots: defaultSlots(area),
    tecnicos: DEFAULT_TECNICOS,
    cells: {},
    negados: [],
  }
}

export function isAgendaArea(v: unknown): v is AgendaArea {
  return v === 'agenda' || v === 'manutencao'
}
