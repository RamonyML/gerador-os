/**
 * Turnos corporativos fixos — só preenchemos nomes na escala.
 * IDs estáveis para chaves no Firestore (`escalaMes/{sector}_{yyyy-MM}` → days).
 */

export type DiaCalendarioTipo = 'segunda_a_sexta' | 'sabado' | 'domingo'

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
  fer5h: 'fer_jornada_5h',
} as const

const SEG_P1: TurnoFixoMeta = {
  id: SHIFT_IDS.segSex0816,
  headline: 'Presencial · manhã',
  detail: '08:00 às 16:20 · segunda a sexta',
  variant: 'presencial',
}

const SEG_P2: TurnoFixoMeta = {
  id: SHIFT_IDS.segSex1340,
  headline: 'Presencial · tarde/noite',
  detail: '13:40 às 22:00 · segunda a sexta',
  variant: 'presencial',
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
    headline: 'Esporádico',
    detail: '12:00 às 20:20 · uso raro',
    variant: 'extra',
  },
  {
    id: SHIFT_IDS.fer4h,
    headline: 'Feriado',
    detail: 'Jornada ~4 h · quando aplicável',
    variant: 'extra',
  },
  {
    id: SHIFT_IDS.fer5h,
    headline: 'Feriado',
    detail: 'Jornada ~5 h · quando aplicável',
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

/** Turnos principais do dia (seg–sex / sáb / dom). */
export function turnosPrincipaisParaData(date: Date): TurnoFixoMeta[] {
  switch (tipoDiaNoMesmoFuso(date)) {
    case 'segunda_a_sexta':
      return [SEG_P1, SEG_P2]
    case 'sabado':
      return [SAB_PRES, SAB_HO]
    case 'domingo':
      return [DOM_HO1, DOM_HO2]
  }
}

/** Título completo para o diálogo de edição. */
export function tituloTurnoNoDialogo(
  dayNum: number,
  monthLabel: string,
  meta: TurnoFixoMeta,
): string {
  return `${dayNum}/${monthLabel} · ${meta.headline} · ${meta.detail}`
}
