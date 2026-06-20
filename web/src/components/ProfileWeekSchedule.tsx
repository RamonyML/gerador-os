import { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Skeleton, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { keyframes } from '@emotion/react'
import { doc, getDoc } from 'firebase/firestore'
import { addDays, addWeeks, format, isToday, startOfWeek } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { db } from '../lib/firebase'
import { parseEscalaMes } from '../lib/escalaFirestore'
import { metaTurnoPorId } from '../lib/escalaTurnosFixos'
import { escalaMesDocId, type EscalaMesDays } from '../types/escala'
import type { Sector } from '../types/profile'

const DAY_ABBR = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(14px); }
  to   { opacity: 1; transform: translateX(0);    }
`
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0);     }
`

type DayEntry = {
  date: Date
  shiftId: string | null
  label: string
  tooltip: string
  variant: 'presencial' | 'homeoffice' | 'extra' | null
}

type Props = {
  userEmail: string
  sector: Sector
}

function findUserShift(days: EscalaMesDays, dayNum: number, emailLc: string): string | null {
  const entry = days[String(dayNum)]
  if (!entry) return null
  for (const [shiftId, emails] of Object.entries(entry)) {
    if (emails.includes(emailLc)) return shiftId
  }
  return null
}

function shiftDisplay(
  shiftId: string,
  date: Date,
  sector: Sector,
): { label: string; tooltip: string; variant: DayEntry['variant'] } {
  const meta = metaTurnoPorId(shiftId, date, sector)
  if (!meta) return { label: shiftId, tooltip: shiftId, variant: null }
  const parts = meta.headline.split('·')
  const timePart = parts.length >= 2 ? parts[1]!.trim() : meta.headline
  const label = meta.variant === 'homeoffice' ? `HO · ${timePart}` : timePart
  return { label, tooltip: `${meta.headline} · ${meta.detail}`, variant: meta.variant }
}


export function ProfileWeekSchedule({ userEmail, sector }: Props) {
  const theme = useTheme()

  const [weekOffset, setWeekOffset] = useState(0)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [entries, setEntries] = useState<DayEntry[] | null>(null)
  const [loading, setLoading] = useState(true)

  const monthCacheRef = useRef<Record<string, EscalaMesDays>>({})

  useEffect(() => {
    let cancelled = false
    const emailLc = userEmail.trim().toLowerCase()

    const load = async () => {
      const mon = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset)
      const dates = Array.from({ length: 7 }, (_, i) => addDays(mon, i))
      const monthsNeeded = [...new Set(dates.map((d) => format(d, 'yyyy-MM')))]
      const toLoad = monthsNeeded.filter((ym) => !(ym in monthCacheRef.current))

      if (toLoad.length > 0) {
        setLoading(true)
        for (const ym of toLoad) {
          const snap = await getDoc(doc(db, 'escalaMes', escalaMesDocId(sector, ym)))
          monthCacheRef.current[ym] = snap.exists()
            ? (parseEscalaMes(snap.data())?.days ?? {})
            : {}
        }
      }

      if (cancelled) return

      const result: DayEntry[] = dates.map((date) => {
        const ym = format(date, 'yyyy-MM')
        const daysMap = monthCacheRef.current[ym] ?? {}
        const shiftId = findUserShift(daysMap, date.getDate(), emailLc)
        if (!shiftId) return { date, shiftId: null, label: 'Folga', tooltip: 'Folga', variant: null }
        const { label, tooltip, variant } = shiftDisplay(shiftId, date, sector)
        return { date, shiftId, label, tooltip, variant }
      })

      setEntries(result)
      setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [userEmail, sector, weekOffset])

  const goBack = () => { setSlideDir('left'); setWeekOffset((w) => w - 1) }
  const goNext = () => { setSlideDir('right'); setWeekOffset((w) => w + 1) }

  const chevronSx = {
    p: 0.375,
    color: 'text.disabled',
    flexShrink: 0,
    '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
  }

  const skeletonRow = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.375, px: 0.875, py: 0.5, minWidth: 46, borderLeft: i > 0 ? 1 : 0, borderColor: 'divider' }}>
          <Skeleton variant="text" width={24} height={10} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="text" width={32} height={10} />
        </Box>
      ))}
    </Box>
  )

  return (
    <Box>
      {/* Header: só label + ícone de link */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.25, gap: 0.25 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', fontSize: '0.6rem' }}
        >
          Escala da semana
        </Typography>
        <Tooltip title="Ver escala completa" placement="top">
          <IconButton
            component={RouterLink}
            to="/escala"
            size="small"
            sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Dias flanqueados pelos chevrons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Semana anterior" placement="top">
          <IconButton onClick={goBack} size="small" sx={chevronSx}>
            <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {loading ? skeletonRow : (
          <Box
            key={weekOffset}
            sx={{
              display: 'flex',
              gap: 0,
              animation: `${slideDir === 'right' ? slideInRight : slideInLeft} 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            }}
          >
            {(entries ?? []).map((entry, i) => {
              const today = isToday(entry.date)
              const isOff = !entry.shiftId

              let accent = theme.palette.text.disabled
              if (entry.variant === 'presencial') accent = theme.palette.primary.main
              else if (entry.variant === 'homeoffice') accent = theme.palette.info.main
              else if (entry.variant === 'extra') accent = theme.palette.warning.main

              return (
                <Tooltip key={i} title={entry.tooltip} placement="top" arrow disableInteractive>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.375,
                      px: 0.875,
                      py: 0.5,
                      minWidth: 46,
                      cursor: 'default',
                      borderLeft: i > 0 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: today ? accent : 'text.disabled', letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1 }}>
                      {DAY_ABBR[i]}
                    </Typography>

                    <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', bgcolor: today ? accent : 'transparent', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: today ? '#fff' : 'text.primary', lineHeight: 1 }}>
                        {entry.date.getDate()}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: '0.6rem', fontWeight: isOff ? 400 : 600, color: isOff ? 'text.disabled' : today ? accent : alpha(accent, 0.85), lineHeight: 1.3, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {entry.label}
                    </Typography>
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        )}

        <Tooltip title="Próxima semana" placement="top">
          <IconButton onClick={goNext} size="small" sx={chevronSx}>
            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
