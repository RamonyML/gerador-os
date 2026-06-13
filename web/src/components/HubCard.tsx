import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined'

export type HubCardData = {
  label: string
  to: string
  description?: string
  icon?: ReactNode
  /** Badge customizado (ReactNode). Tem precedência sobre `badgeLabel`. */
  badge?: ReactNode
  /** Texto do badge em pílula, colorido conforme o accent do card. */
  badgeLabel?: string
  /** Cor de destaque (hex). Sobrepõe o accent da seção. */
  accent?: string
}

/** Badge em pílula com pontinho colorido, no estilo do catálogo de fluxos. */
export function HubBadge({ label, color }: { label: string; color: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.625,
        px: 1.25,
        py: 0.375,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.2,
        bgcolor: alpha(color, 0.12),
        color,
        border: `1px solid ${alpha(color, 0.22)}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      {label}
    </Box>
  )
}

/** Cabeçalho de categoria: indicador colorido + título + contador + linha. */
export function HubCategoryHeader({
  title,
  accent,
  count,
}: {
  title: string
  accent: string
  count: number
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: accent,
          boxShadow: `0 0 0 4px ${alpha(accent, 0.18)}`,
          flexShrink: 0,
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      <Box
        component="span"
        sx={{
          px: 1,
          py: 0.125,
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.6,
          bgcolor: alpha(accent, 0.12),
          color: accent,
        }}
      >
        {count}
      </Box>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', ml: 0.5 }} />
    </Box>
  )
}

/**
 * Card de fluxo moderno (estilo SaaS): ícone tonalizado, título, descrição curta,
 * badge e seta de ação, com hover elegante. Modo `horizontal` para visão em lista.
 */
export function HubCard({
  item,
  accent,
  horizontal = false,
}: {
  item: HubCardData
  accent: string
  horizontal?: boolean
}) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const color = item.accent ?? accent
  const iconBg = alpha(color, isDark ? 0.22 : 0.12)

  const iconBox = (
    <Box
      className="mc-icon"
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: iconBg,
        color,
        transition: 'transform 0.25s ease, background-color 0.25s ease',
      }}
    >
      {item.icon ?? <AppsOutlinedIcon sx={{ fontSize: 26 }} />}
    </Box>
  )

  const arrow = (
    <ArrowForwardRoundedIcon
      className="mc-arrow"
      sx={{
        fontSize: 20,
        color: 'text.disabled',
        flexShrink: 0,
        transition: 'color 0.25s ease, transform 0.25s ease',
      }}
    />
  )

  const badgeNode = item.badgeLabel ? (
    <HubBadge label={item.badgeLabel} color={color} />
  ) : (
    item.badge ?? null
  )

  const baseSx = {
    position: 'relative' as const,
    display: 'flex',
    height: '100%',
    textDecoration: 'none',
    color: 'inherit',
    border: 1,
    borderColor: 'divider',
    bgcolor: 'background.paper',
    borderRadius: 3.5,
    overflow: 'hidden',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: alpha(color, isDark ? 0.6 : 0.5),
      boxShadow: isDark
        ? `0 18px 40px ${alpha('#000', 0.5)}`
        : `0 18px 40px ${alpha(color, 0.18)}`,
    },
    '&:hover .mc-icon': {
      transform: 'scale(1.08)',
      bgcolor: alpha(color, isDark ? 0.32 : 0.18),
    },
    '&:hover .mc-arrow': { color, transform: 'translateX(4px)' },
    '&:focus-visible': { outline: `2px solid ${color}`, outlineOffset: 2 },
  }

  if (horizontal) {
    return (
      <Paper
        component={RouterLink}
        to={item.to}
        elevation={0}
        sx={{ ...baseSx, flexDirection: 'row', alignItems: 'center', gap: 2, p: 2 }}
      >
        {iconBox}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {item.label}
          </Typography>
          {item.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.description}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          {badgeNode ? (
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>{badgeNode}</Box>
          ) : null}
          {arrow}
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      component={RouterLink}
      to={item.to}
      elevation={0}
      sx={{ ...baseSx, flexDirection: 'column', p: 2.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {iconBox}
        <Box sx={{ mt: 0.5 }}>{arrow}</Box>
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, mt: 1.75 }}>
        {item.label}
      </Typography>
      {item.description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </Typography>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}
      {badgeNode ? <Box sx={{ mt: 2 }}>{badgeNode}</Box> : null}
    </Paper>
  )
}
