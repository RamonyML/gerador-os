import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Paper, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useColorMode } from '../contexts/ColorModeContext'

type NavCardProps = {
  icon: ReactNode
  title: string
  description?: ReactNode
  /** Conteúdo opcional do rodapé (chip de contagem, badge, etc.). */
  badge?: ReactNode
  /** Cor de destaque (hex). Default = primary do tema. */
  accent?: string
  /** Destino de navegação (RouterLink). Use `onClick` para ações. */
  to?: string
  onClick?: () => void
  /** Card em destaque (fundo levemente tonalizado). */
  featured?: boolean
  /** Layout compacto: menos padding/ícone e oculta a descrição. */
  dense?: boolean
}

/**
 * Card de navegação premium, reutilizado no dashboard, nos hubs de categoria e
 * nos atalhos do painel. Ícone em container tonalizado, título + chevron,
 * descrição e badge opcional, com hover elegante (elevação + borda de acento).
 */
export function NavCard({
  icon,
  title,
  description,
  badge,
  accent,
  to,
  onClick,
  featured = false,
  dense = false,
}: NavCardProps) {
  const theme = useTheme()
  const { mode } = useColorMode()
  const isDark = mode === 'dark'
  const accentMain = accent ?? theme.palette.primary.main
  const iconBg = alpha(accentMain, isDark ? 0.22 : 0.14)

  const linkProps = to
    ? { component: RouterLink, to }
    : {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
          }
        },
      }

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      {...linkProps}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: dense ? 1.75 : 2.5,
        borderRadius: 3,
        border: 1,
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        borderColor: featured
          ? alpha(accentMain, isDark ? 0.5 : 0.42)
          : 'divider',
        bgcolor: featured
          ? alpha(accentMain, isDark ? 0.16 : 0.08)
          : 'background.paper',
        transition:
          'box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease',
        '&:hover': {
          borderColor: alpha(accentMain, isDark ? 0.62 : 0.55),
          boxShadow: isDark
            ? `0 16px 36px ${alpha('#000', 0.5)}`
            : `0 16px 36px ${alpha(accentMain, 0.16)}`,
          transform: 'translateY(-3px)',
        },
        '&:hover .NavCard-arrow': {
          color: accentMain,
          transform: 'translateX(3px)',
        },
        '&:focus-visible': {
          outline: `2px solid ${accentMain}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: dense ? 1.5 : 2,
          alignItems: dense ? 'center' : 'flex-start',
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: dense ? 40 : 48,
            height: dense ? 40 : 48,
            borderRadius: dense ? 2 : 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: iconBg,
            color: accentMain,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </Typography>
            <ArrowForwardRoundedIcon
              className="NavCard-arrow"
              sx={{
                fontSize: 20,
                color: 'text.disabled',
                flexShrink: 0,
                mt: 0.25,
                transition: 'color 0.22s ease, transform 0.22s ease',
              }}
            />
          </Box>
          {description && !dense ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {description}
            </Typography>
          ) : null}
          {badge ? <Box sx={{ mt: dense ? 0.75 : 1.5 }}>{badge}</Box> : null}
        </Box>
      </Box>
    </Paper>
  )
}
