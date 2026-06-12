import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Chip, Container, Fade, Paper, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import { alpha, useTheme } from '@mui/material/styles'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { app } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { NavCard } from '../components/NavCard'
import { HeroIllustration } from '../components/HeroIllustration'
import { Reveal } from '../components/Reveal'
import { ILLUSTRATIONS } from '../data/illustrations'
import { canManageUsers } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'
import { canManageHelpdesk } from '../lib/helpdeskAccess'
import { canAccessCondominios } from '../lib/condominiosAccess'
import { SECTOR_LABELS, type Hierarchy } from '../types/profile'

const HIERARCHY_LABELS: Record<Hierarchy, string> = {
  gerente: 'Gestor',
  supervisor: 'Supervisor',
  operador: 'Operador',
}

type QuickAction = {
  key: string
  title: string
  description: string
  to: string
  icon: ReactNode
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function HomePage() {
  const theme = useTheme()
  const { mode } = useColorMode()
  const isDark = mode === 'dark'
  const { user, profile, profileMissing, photoURL } = useAuth()
  const primary = theme.palette.primary.main
  const success = theme.palette.success.main
  const [quickLinksVisible, setQuickLinksVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setQuickLinksVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const showSupportHub = profile != null && canAccessSupportHub(profile)
  const showUsers = profile != null && canManageUsers(profile)
  const showHelpdeskManager = profile != null && canManageHelpdesk(profile)
  const showCondominios = profile != null && canAccessCondominios(profile)

  const greetingName =
    profile?.displayName?.trim() || user?.email?.split('@')[0] || 'usuário'
  const envLabel = import.meta.env.PROD ? 'Produção' : 'Desenvolvimento'

  const heroGradient = isDark
    ? `linear-gradient(135deg, ${alpha(primary, 0.26)} 0%, ${alpha(primary, 0.08)} 42%, ${alpha('#000', 0.1)} 100%)`
    : `linear-gradient(135deg, ${alpha(primary, 0.16)} 0%, ${alpha(primary, 0.05)} 46%, ${alpha('#fff', 0)} 100%)`

  const infoPills: { key: string; icon: ReactNode; text: string }[] = [
    {
      key: 'instancia',
      icon: (
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            bgcolor: success,
            boxShadow: `0 0 0 3px ${alpha(success, 0.2)}`,
          }}
        />
      ),
      text: app.options.projectId ?? 'Firebase',
    },
    { key: 'ambiente', icon: <CloudOutlinedIcon sx={{ fontSize: 16 }} />, text: envLabel },
    ...(profile
      ? [
          {
            key: 'setor',
            icon: <BadgeOutlinedIcon sx={{ fontSize: 16 }} />,
            text: SECTOR_LABELS[profile.sector] ?? profile.sector,
          },
          {
            key: 'cargo',
            icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 16 }} />,
            text: HIERARCHY_LABELS[profile.hierarchy] ?? profile.hierarchy,
          },
        ]
      : []),
  ]

  const actions: QuickAction[] = [
    ...(showSupportHub
      ? [
          {
            key: 'suporte',
            title: 'Hub Suporte',
            description:
              'Demandas por tipo: mudança de endereço, plano, manutenção e mais.',
            to: '/suporte',
            icon: <DashboardCustomizeOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
    {
      key: 'upgrades',
      title: 'Registro de Upgrades',
      description:
        'Acesse a área de registro de upgrades e gerencie as suas comissões.',
      to: '/upgrades',
      icon: <TrendingUpOutlinedIcon sx={{ fontSize: 28 }} />,
    },
    {
      key: 'escala',
      title: 'Escala de trabalho',
      description: 'Turnos fixos por tipo de dia — preencha só os nomes do seu setor.',
      to: '/escala',
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 28 }} />,
    },
    {
      key: 'chamados',
      title: 'Chamados internos (T.I)',
      description: showHelpdeskManager
        ? 'Receba, resgate e encerre chamados internos com parecer resolutivo.'
        : 'Abra chamados para o T.I e acompanhe o andamento dos seus pedidos.',
      to: '/chamados',
      icon: <SupportAgentOutlinedIcon sx={{ fontSize: 28 }} />,
    },
    {
      key: 'agenda',
      title: 'Agenda',
      description:
        'Agende visitas técnicas de instalação, mudança de endereço e manutenção.',
      to: '/agenda',
      icon: <EventNoteOutlinedIcon sx={{ fontSize: 28 }} />,
    },
    ...(showCondominios
      ? [
          {
            key: 'condominios',
            title: 'Condomínios',
            description:
              'Consulte condomínios com viabilidade de fibra e registros de inviabilidade.',
            to: '/condominios',
            icon: <ApartmentOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
    ...(showUsers
      ? [
          {
            key: 'usuarios',
            title: 'Usuários',
            description: 'Gerencie contas no Auth e perfis em users/{uid}.',
            to: '/admin/usuarios',
            icon: <PeopleOutlineOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
  ]

  return (
    <Box sx={{ flex: 1, width: '100%', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 3.5 } }}>
          {/* Hero */}
          <Reveal>
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              background: heroGradient,
              p: { xs: 3, sm: 4 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 4 },
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: '0.1em', fontWeight: 700 }}
                >
                  Painel
                </Typography>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.12,
                    fontSize: { xs: '1.9rem', sm: '2.3rem' },
                  }}
                >
                  Olá, {greetingName}!
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1, maxWidth: 540 }}
                >
                  Selecione uma área para iniciar sua operação. As opções respeitam seu perfil e seu
                  nível de acesso.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5 }}>
                  {infoPills.map((pill) => (
                    <Box
                      key={pill.key}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        py: 0.625,
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'text.secondary',
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#fff', 0.7),
                        backdropFilter: 'blur(6px)',
                        '& svg': { color: 'primary.main' },
                      }}
                    >
                      {pill.icon}
                      {pill.text}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: { md: 300, lg: 340 },
                  flexShrink: 0,
                  filter: isDark ? `drop-shadow(0 12px 30px ${alpha('#000', 0.4)})` : undefined,
                }}
              >
                <HeroIllustration src={ILLUSTRATIONS.operations} alt="Operações" />
              </Box>
            </Box>
          </Paper>
          </Reveal>

          {profileMissing ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Não existe documento <code>users/{user?.uid}</code> no Firestore ou faltam os campos{' '}
              <code>sector</code> e <code>hierarchy</code>. Crie o documento no console (coleção{' '}
              <code>users</code>, ID = seu UID) com pelo menos: sector, hierarchy, displayName, active.
            </Alert>
          ) : null}

          {/* Cards de navegação */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Acesso rápido
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(auto-fill, minmax(280px, 1fr))',
                },
                gap: 2,
                alignItems: 'stretch',
              }}
            >
              {actions.map((a, index) => {
                const isSupportHub = a.key === 'suporte'
                return (
                  <Fade
                    key={a.key}
                    in={quickLinksVisible}
                    timeout={420}
                    style={{ transitionDelay: `${index * 70}ms` }}
                  >
                    <Box sx={{ height: '100%' }}>
                      <NavCard
                        to={a.to}
                        icon={a.icon}
                        title={a.title}
                        description={a.description}
                        accent={isSupportHub ? success : primary}
                        featured={isSupportHub}
                      />
                    </Box>
                  </Fade>
                )
              })}
            </Box>
          </Box>

          {/* Seu perfil */}
          {!profileMissing && profile ? (
            <Reveal delay={120}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Seu perfil
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 4,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2.5,
                    alignItems: { xs: 'flex-start', sm: 'center' },
                  }}
                >
                  <Avatar
                    src={photoURL ?? undefined}
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.main',
                      fontSize: 22,
                      fontWeight: 700,
                      boxShadow: `0 8px 22px ${alpha(primary, 0.3)}`,
                    }}
                  >
                    {initialsFrom(greetingName)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {profile.displayName || greetingName}
                    </Typography>
                    {user?.email ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
                        {user.email}
                      </Typography>
                    ) : null}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                      <Chip
                        label={SECTOR_LABELS[profile.sector] ?? profile.sector}
                        size="small"
                        sx={{
                          bgcolor: alpha(primary, isDark ? 0.22 : 0.12),
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        label={HIERARCHY_LABELS[profile.hierarchy] ?? profile.hierarchy}
                        size="small"
                        variant="outlined"
                      />
                      {profile.isTi ? (
                        <Chip label="T.I" size="small" color="primary" />
                      ) : null}
                      {profile.isAdmin ? (
                        <Chip label="Administrador" size="small" color="secondary" />
                      ) : null}
                      {profile.isDev ? (
                        <Chip label="Dev" size="small" variant="outlined" />
                      ) : null}
                    </Box>
                  </Box>
                  <Button
                    component={RouterLink}
                    to="/perfil"
                    variant="outlined"
                    size="small"
                    startIcon={<ManageAccountsOutlinedIcon />}
                    sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
                  >
                    Editar perfil
                  </Button>
                </Box>
                {canManageUsers(profile) ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}
                  >
                    Gestão de contas: use o atalho <strong>Usuários</strong> acima.
                  </Typography>
                ) : null}
              </Paper>
            </Box>
            </Reveal>
          ) : null}
        </Box>
      </Container>
    </Box>
  )
}
