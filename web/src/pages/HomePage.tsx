import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Chip, Container, Divider, Fade, Paper, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import { alpha, useTheme } from '@mui/material/styles'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { app, db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { NavCard } from '../components/NavCard'
import { HeroIllustration } from '../components/HeroIllustration'
import { Reveal } from '../components/Reveal'
import { ILLUSTRATIONS } from '../data/illustrations'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded'
import AppsRoundedIcon from '@mui/icons-material/AppsRounded'
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded'
import { canManageUsers, canAccessUpgrades, canManagePausas } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'
import { canAccessCadastroHub } from '../lib/cadastroAccess'
import { canAccessInstalacaoHub } from '../lib/instalacaoAccess'
import { canManageHelpdesk } from '../lib/helpdeskAccess'
import { canAccessCondominios } from '../lib/condominiosAccess'
import { SECTOR_LABELS, type Hierarchy } from '../types/profile'
import { ProfileWeekSchedule } from '../components/ProfileWeekSchedule'
import { subscribeMyTickets, subscribeAllTickets } from '../lib/ticketsFirestore'
import { TICKET_STATUS_LABELS, type Ticket } from '../types/ticket'
import { NotesWidget } from '../components/NotesWidget'
import { PausaTeamCard } from '../components/PausaTeamCard'

function formatRelative(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins}min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

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
  const { isDark } = useColorMode()
  const { user, profile, profileMissing, photoURL } = useAuth()
  const primary = theme.palette.primary.main
  const success = theme.palette.success.main
  const [quickLinksVisible, setQuickLinksVisible] = useState(false)

  type ViewMode = 'cards' | 'icons' | 'list'
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem('home-view-mode') as ViewMode) ?? 'cards'
  })
  const [gridVisible, setGridVisible] = useState(true)

  const handleViewMode = (_: unknown, val: ViewMode | null) => {
    if (!val || val === viewMode) return
    setGridVisible(false)
    setTimeout(() => {
      setViewModeState(val)
      localStorage.setItem('home-view-mode', val)
      setTimeout(() => setGridVisible(true), 30)
    }, 200)
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setQuickLinksVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const showSupportHub = profile != null && canAccessSupportHub(profile)
  const showCadastroHub = profile != null && canAccessCadastroHub(profile)
  const showInstalacaoHub = profile != null && canAccessInstalacaoHub(profile)
  const showUpgrades = profile != null && canAccessUpgrades(profile)
  const showUsers = profile != null && canManageUsers(profile)
  const showHelpdeskManager = profile != null && canManageHelpdesk(profile)
  const showCondominios = profile != null && canAccessCondominios(profile)
  const showMkTestes = profile?.isDev === true
  const isTi = profile?.isTi === true
  const showPausas = profile != null && canManagePausas(profile)

  const [activeTickets, setActiveTickets] = useState<Ticket[]>([])
  const [ticketsReady, setTicketsReady] = useState(false)

  useEffect(() => {
    if (!user) return
    if (isTi) {
      return subscribeAllTickets(
        db,
        { status: 'aberto' },
        (tickets) => { setActiveTickets(tickets.slice(0, 5)); setTicketsReady(true) },
        () => setTicketsReady(true),
      )
    }
    return subscribeMyTickets(
      db,
      user.uid,
      (tickets) => {
        setActiveTickets(
          tickets.filter((t) => !t.archiveTag && t.status !== 'resolvido').slice(0, 5),
        )
        setTicketsReady(true)
      },
      () => setTicketsReady(true),
    )
  }, [user?.uid, isTi])  // eslint-disable-line react-hooks/exhaustive-deps

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
    ...(showCadastroHub
      ? [
          {
            key: 'cadastro',
            title: 'Hub Cadastro',
            description:
              'Registre instalações grátis e com taxa para clientes PF e PJ.',
            to: '/cadastro',
            icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
    ...(showInstalacaoHub
      ? [
          {
            key: 'instalacao',
            title: 'Hub Instalação',
            description:
              'Formulários de encerramento de O.S: Padrão Casa, Wi-Fi Extend e Empresa.',
            to: '/instalacao',
            icon: <HomeRepairServiceOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
    ...(showUpgrades
      ? [
          {
            key: 'upgrades',
            title: 'Registro de Upgrades',
            description:
              'Acesse a área de registro de upgrades e gerencie as suas comissões.',
            to: '/upgrades',
            icon: <TrendingUpOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
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
        'Organize e acompanhe as visitas da equipe técnica em tempo real.',
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
    ...(showMkTestes
      ? [
          {
            key: 'mk-testes',
            title: 'Laboratório MK',
            description: 'Teste a integração com a API do MK Solutions — auth, busca, criação de OS.',
            to: '/dev/mk',
            icon: <BiotechOutlinedIcon sx={{ fontSize: 28 }} />,
          } satisfies QuickAction,
        ]
      : []),
  ]

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
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
            {/* Header: título + toggle de visão */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Acesso rápido
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewMode}
                size="small"
                sx={{
                  bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                  borderRadius: 2,
                  p: 0.375,
                  gap: 0.25,
                  '& .MuiToggleButtonGroup-grouped': { border: 0 },
                  '& .MuiToggleButton-root': {
                    borderRadius: '7px !important',
                    px: 1.125,
                    py: 0.5,
                    color: 'text.secondary',
                    transition: 'all 0.15s',
                    '&.Mui-selected': {
                      bgcolor: isDark ? alpha('#fff', 0.14) : 'background.paper',
                      color: 'primary.main',
                      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
                    },
                    '&:hover:not(.Mui-selected)': { bgcolor: alpha(primary, 0.07) },
                  },
                }}
              >
                <Tooltip title="Cards" placement="top">
                  <ToggleButton value="cards" aria-label="Visão cards">
                    <ViewModuleRoundedIcon sx={{ fontSize: 16 }} />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Ícones" placement="top">
                  <ToggleButton value="icons" aria-label="Visão ícones">
                    <AppsRoundedIcon sx={{ fontSize: 16 }} />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Lista" placement="top">
                  <ToggleButton value="list" aria-label="Visão lista">
                    <ViewListRoundedIcon sx={{ fontSize: 16 }} />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {/* Coluna principal: grid/ícones/lista + widgets abaixo */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Área animada de alternância de visão */}
            <Box
              sx={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'scale(1) translateY(0px)' : 'scale(0.97) translateY(8px)',
                filter: gridVisible ? 'blur(0px)' : 'blur(4px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease',
                willChange: 'opacity, transform, filter',
              }}
            >

            {/* ── VISÃO CARDS ── */}
            {viewMode === 'cards' && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(auto-fill, minmax(260px, 1fr))',
                    xl: 'repeat(auto-fill, minmax(240px, 1fr))',
                  },
                  gap: 2,
                  alignItems: 'start',
                }}
              >
                {actions.map((a, index) => {
                  const isHubCard = a.key === 'suporte' || a.key === 'cadastro' || a.key === 'instalacao'
                  return (
                    <Fade
                      key={a.key}
                      in={quickLinksVisible}
                      timeout={420}
                      style={{ transitionDelay: `${index * 70}ms` }}
                    >
                      <Box>
                        <NavCard
                          to={a.to}
                          icon={a.icon}
                          title={a.title}
                          description={a.description}
                          accent={isHubCard ? success : primary}
                          featured={isHubCard}
                        />
                      </Box>
                    </Fade>
                  )
                })}
              </Box>
            )}

            {/* ── VISÃO ÍCONES ── */}
            {viewMode === 'icons' && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))',
                  gap: 0.5,
                }}
              >
                {actions.map((a) => {
                  const isHubCard = a.key === 'suporte' || a.key === 'cadastro' || a.key === 'instalacao'
                  const color = isHubCard ? success : primary
                  return (
                    <Box
                      key={a.key}
                      component={RouterLink}
                      to={a.to}
                      sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.875,
                        p: 1.5, borderRadius: 3, textDecoration: 'none', color: 'inherit',
                        transition: 'background 0.15s, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': {
                          bgcolor: alpha(color, isDark ? 0.1 : 0.07),
                          transform: 'translateY(-4px) scale(1.06)',
                        },
                        '&:active': { transform: 'scale(0.93)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 58, height: 58, borderRadius: '18px', flexShrink: 0,
                          background: `linear-gradient(145deg, ${alpha(color, isDark ? 0.3 : 0.18)}, ${alpha(color, isDark ? 0.12 : 0.07)})`,
                          border: `1px solid ${alpha(color, isDark ? 0.3 : 0.2)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                          boxShadow: `0 3px 10px ${alpha(color, 0.2)}`,
                          '& svg': { fontSize: '26px !important' },
                        }}
                      >
                        {a.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 11, fontWeight: 700, textAlign: 'center',
                          lineHeight: 1.25, color: 'text.primary',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}
                      >
                        {a.title}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}

            {/* ── VISÃO LISTA ── */}
            {viewMode === 'list' && (
              <Paper
                elevation={0}
                sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}
              >
                {actions.map((a, idx) => {
                  const isHubCard = a.key === 'suporte' || a.key === 'cadastro' || a.key === 'instalacao'
                  const color = isHubCard ? success : primary
                  return (
                    <Box key={a.key}>
                      {idx > 0 && <Divider />}
                      <Box
                        component={RouterLink}
                        to={a.to}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 2,
                          px: 2.5, py: 1.375,
                          textDecoration: 'none', color: 'inherit',
                          transition: 'background 0.12s',
                          '&:hover': { bgcolor: alpha(color, isDark ? 0.07 : 0.05) },
                          '&:hover .list-arrow': { transform: 'translateX(4px)', color },
                        }}
                      >
                        <Box
                          sx={{
                            width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                            background: `linear-gradient(145deg, ${alpha(color, isDark ? 0.28 : 0.16)}, ${alpha(color, isDark ? 0.1 : 0.06)})`,
                            border: `1px solid ${alpha(color, 0.2)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                            '& svg': { fontSize: '18px !important' },
                          }}
                        >
                          {a.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, color: isHubCard ? color : 'text.primary' }}>
                            {a.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.1 }}>
                            {a.description}
                          </Typography>
                        </Box>
                        <ArrowForwardRoundedIcon
                          className="list-arrow"
                          sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0, transition: 'transform 0.18s ease, color 0.18s ease' }}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Paper>
            )}

            </Box>{/* fim área animada */}

              {/* Chamados — apenas T.I, 2 colunas */}
              {profile && isTi && <Paper
                elevation={0}
                sx={{
                  gridColumn: { xs: '1 / -1', sm: 'span 2', md: 'span 2' },
                  borderRadius: 4,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                  <Box
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      pt: { xs: 2, sm: 2.5 },
                      pb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Fila de chamados</Typography>
                    </Box>
                    <Button
                      component={RouterLink}
                      to="/chamados"
                      size="small"
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontSize: 12, color: 'text.secondary' }}
                    >
                      Ver
                    </Button>
                  </Box>

                  <Divider />

                  <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.75, flex: 1 }}>
                    {!ticketsReady ? (
                      <Stack spacing={1}>
                        {[0, 1].map((i) => (
                          <Skeleton key={i} variant="rounded" height={50} sx={{ borderRadius: 1.5 }} />
                        ))}
                      </Stack>
                    ) : activeTickets.length === 0 ? (
                      <Box sx={{ py: 3.5, textAlign: 'center' }}>
                        <CheckCircleOutlineRoundedIcon
                          sx={{ color: 'success.main', fontSize: 34, mb: 0.75, opacity: 0.7 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Nenhum chamado na fila
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={0} sx={{ height: '100%' }}>
                        <Box
                          sx={{
                            mb: 1.5,
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: alpha(primary, isDark ? 0.12 : 0.07),
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 0.75,
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}
                          >
                            {activeTickets.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            aguardando atendimento
                          </Typography>
                        </Box>
                        <Stack spacing={0.625}>
                          {activeTickets.slice(0, 3).map((ticket) => {
                            const dotColor =
                              ticket.status === 'aberto'
                                ? theme.palette.error.main
                                : ticket.status === 'em_atendimento'
                                  ? theme.palette.warning.main
                                  : theme.palette.info.main
                            return (
                              <Box
                                key={ticket.id}
                                component={RouterLink}
                                to={`/chamados/${ticket.id}`}
                                sx={{
                                  display: 'block',
                                  p: 1,
                                  borderRadius: 1.5,
                                  bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.025),
                                  textDecoration: 'none',
                                  transition: 'background 0.15s',
                                  '&:hover': {
                                    bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.05),
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.875, mb: 0.2 }}>
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: dotColor,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, lineHeight: 1.3 }}
                                    noWrap
                                  >
                                    {ticket.title}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                  sx={{ pl: 1.75 }}
                                >
                                  {TICKET_STATUS_LABELS[ticket.status]} · {formatRelative(ticket.createdAt)}
                                </Typography>
                              </Box>
                            )
                          })}
                        </Stack>
                      </Stack>
                    )}
                  </Box>
                </Paper>}

            {/* NotesWidget — fora do grid, sem interferir nos NavCards */}
            {profile && <NotesWidget />}

            </Box>{/* fim coluna principal */}

            {/* Pausa sidebar — fora do grid, não interfere no layout dos cards */}
            {showPausas && profile && (
              <Box sx={{ width: 280, flexShrink: 0, position: 'sticky', top: 16, display: { xs: 'none', lg: 'block' } }}>
                <PausaTeamCard profile={profile} />
              </Box>
            )}
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
                  <Box sx={{ minWidth: 0 }}>
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
                  {user?.email ? (
                    <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', lg: 'block' }, px: 1 }}>
                      <ProfileWeekSchedule userEmail={user.email} sector={profile.sector} />
                    </Box>
                  ) : null}
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
