/**
 * Turnos corporativos fixos — só preenchemos nomes na escala.
 * IDs estáveis para chaves no Firestore (`escalaMes/{sector}_{yyyy-MM}` → days).
 */

import type { Sector } from '../types/profile'

export type DiaCalendarioTipo = 'segunda_a_sexta' | 'sabado' | 'domingo'

/** Horários dos dois turnos principais de seg–sex (variam por setor). */
export interface HorariosTurno {
  manha: string
  tarde: string
}

const HORARIOS_PADRAO: HorariosTurno = {
  manha: '08:00 às 16:20',
  tarde: '13:40 às 22:00',
}

const HORARIOS_COMERCIAL: HorariosTurno = {
  manha: '08:00 às 18:00',
  tarde: '11:00 às 20:00',
}

/** Comercial tem jornada própria; demais setores usam o padrão. */
export function horariosTurnoSetor(sector?: Sector | null): HorariosTurno {
  return sector === 'comercial' ? HORARIOS_COMERCIAL : HORARIOS_PADRAO
}

export type TurnoVariant = 'presencial' | 'homeoffice' | 'extra'

export interface TurnoFixoMeta {
  id: string
  /** Uma linha curta (cartão / diálogo). */
  headline: string
  /** Horários e observação de modalidade. */
  detail: string
  variant: TurnoVariant
}

/** IDs dos turnos principais (variando por tipo de dia). */
export const SHIFT_IDS = {
  segSex0816: 'segSex_pres_0816',
  segSex1340: 'segSex_pres_1340_2200',
  sabPres0816: 'sab_pres_0816',
  sabHo1340: 'sab_ho_1340_2200',
  domHo0816: 'dom_ho_0816',
  domHo1340: 'dom_ho_1340_2200',
  extra1220: 'extra_1220_2020',
  fer4h: 'fer_jornada_4h',
  ferias: 'ferias',
} as const

function turnosSegSex(sector?: Sector | null): TurnoFixoMeta[] {
  const h = horariosTurnoSetor(sector)
  return [
    {
      id: SHIFT_IDS.segSex0816,
      headline: 'Presencial · manhã',
      detail: `${h.manha} · segunda a sexta`,
      variant: 'presencial',
    },
    {
      id: SHIFT_IDS.segSex1340,
      headline: 'Presencial · tarde/noite',
      detail: `${h.tarde} · segunda a sexta`,
      variant: 'presencial',
    },
  ]
}

const SAB_PRES: TurnoFixoMeta = {
  id: SHIFT_IDS.sabPres0816,
  headline: 'Presencial · manhã',
  detail: '08:00 às 16:20 · sábado',
  variant: 'presencial',
}

const SAB_HO: TurnoFixoMeta = {
  id: SHIFT_IDS.sabHo1340,
  headline: 'Home office · tarde/noite',
  detail: '13:40 às 22:00 · sábado',
  variant: 'homeoffice',
}

const DOM_HO1: TurnoFixoMeta = {
  id: SHIFT_IDS.domHo0816,
  headline: 'Home office · manhã',
  detail: '08:00 às 16:20 · domingo',
  variant: 'homeoffice',
}

const DOM_HO2: TurnoFixoMeta = {
  id: SHIFT_IDS.domHo1340,
  headline: 'Home office · tarde/noite',
  detail: '13:40 às 22:00 · domingo',
  variant: 'homeoffice',
}

/** Turnos opcionais: qualquer dia (rede exibida recolhida por padrão). */
export const TURNOS_EXTRAS: TurnoFixoMeta[] = [
  {
    id: SHIFT_IDS.extra1220,
    headline: 'Intermediário',
    detail: '12:00 às 20:20 · uso raro',
    variant: 'extra',
  },
  {
    id: SHIFT_IDS.fer4h,
    headline: 'Feriado',
    detail: 'Quando aplicável',
    variant: 'extra',
  },
]

export function tipoDiaNoMesmoFuso(date: Date): DiaCalendarioTipo {
  const dow = date.getDay()
  if (dow === 0) return 'domingo'
  if (dow === 6) return 'sabado'
  return 'segunda_a_sexta'
}

export function labelTipoDia(t: DiaCalendarioTipo): string {
  switch (t) {
    case 'segunda_a_sexta':
      return 'Segunda a sexta'
    case 'sabado':
      return 'Sábado'
    case 'domingo':
      return 'Domingo'
  }
}

/** Turnos principais do dia (seg–sex / sáb / dom). Seg–sex variam por setor. */
export function turnosPrincipaisParaData(
  date: Date,
  sector?: Sector | null,
): TurnoFixoMeta[] {
  switch (tipoDiaNoMesmoFuso(date)) {
    case 'segunda_a_sexta':
      return turnosSegSex(sector)
    case 'sabado':
      return [SAB_PRES, SAB_HO]
    case 'domingo':
      return [DOM_HO1, DOM_HO2]
  }
}

/** Metadado do turno de férias (não faz parte dos turnos principais/extras). */
export const FERIAS_META: TurnoFixoMeta = {
  id: SHIFT_IDS.ferias,
  headline: 'Férias',
  detail: 'Período de férias',
  variant: 'extra',
}

/**
 * Resolve o metadado descritivo de um turno a partir do seu id, considerando o
 * dia (principais variam por seg–sex/sáb/dom) e o setor. Usado p.ex. no tooltip
 * da visão "Por atendente" para mostrar a informação definida pela gestão.
 */
export function metaTurnoPorId(
  shiftId: string,
  date: Date,
  sector?: Sector | null,
): TurnoFixoMeta | null {
  const candidatos = [
    ...turnosPrincipaisParaData(date, sector),
    ...TURNOS_EXTRAS,
    FERIAS_META,
  ]
  return candidatos.find((m) => m.id === shiftId) ?? null
}

/** Título completo para o diálogo de edição. */
export function tituloTurnoNoDialogo(
  dayNum: number,
  monthLabel: string,
  meta: TurnoFixoMeta,
): string {
  return `${dayNum}/${monthLabel} · ${meta.headline} · ${meta.detail}`
}
