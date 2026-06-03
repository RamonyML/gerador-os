import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Alert, Box, Chip, Container, Fade, Paper, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined'
import { useNavigate } from 'react-router-dom'
import { app } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { brandLogoSrc } from '../lib/brandAssets'
import { canManageOsTemplates, canManageUsers } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'
import { canManageHelpdesk } from '../lib/helpdeskAccess'
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

export function HomePage() {
  const theme = useTheme()
  const { mode } = useColorMode()
  const { user, profile, profileMissing } = useAuth()
  const navigate = useNavigate()
  const primary = theme.palette.primary.main
  const success = theme.palette.success.main
  const [quickLinksVisible, setQuickLinksVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setQuickLinksVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const showSupportHub = profile != null && canAccessSupportHub(profile)
  const showModels = profile != null && canManageOsTemplates(profile)
  const showUsers = profile != null && canManageUsers(profile)
  const showHelpdeskManager = profile != null && canManageHelpdesk(profile)

  const greetingName =
    profile?.displayName?.trim() ||
    user?.email?.split('@')[0] ||
    'usuário'

  const heroGradient =
    mode === 'light'
      ? `linear-gradient(135deg, ${alpha(primary, 0.14)} 0%, ${alpha(primary, 0.04)} 42%, transparent 100%)`
      : `linear-gradient(135deg, ${alpha(primary, 0.22)} 0%, ${alpha('#000', 0.15)} 50%, transparent 100%)`

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
      key: 'os',
      title: 'Gerar O.S.',
      description: 'Monte textos a partir dos templates salvos no Firestore.',
      to: '/gerar-os',
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 28 }} />,
    },
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
      description:
        'Turnos fixos por tipo de dia — preencha só os nomes do seu setor.',
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
    ...(showModels
      ? [
          {
            key: 'modelos',
            title: 'Modelos de O.S.',
            description: 'Crie e edite presets usados na geração de ordens.',
            to: '/admin/modelos-os',
            icon: <AssignmentOutlinedIcon sx={{ fontSize: 28 }} />,
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
    <Box
      sx={{
        flex: 1,
        width: '100%',
        background: heroGradient,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
              <Box
                component="img"
                src={brandLogoSrc(mode)}
                alt=""
                sx={{
                  height: { xs: 40, sm: 48 },
                  width: 'auto',
                  objectFit: 'contain',
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
                >
                  Painel
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
                >
                  Olá, {greetingName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
                  Selecione abaixo a área ou ferramenta necessária para sua operação. As opções exibidas
                  respeitam seu perfil e seu nível de acesso no sistema.
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              label={app.options.projectId ?? 'Firebase'}
              variant="outlined"
              sx={{
                borderColor: alpha(primary, 0.35),
                color: 'text.secondary',
                fontFamily: 'inherit',
              }}
            />
          </Box>

          {profileMissing ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Não existe documento <code>users/{user?.uid}</code> no Firestore ou faltam os campos{' '}
              <code>sector</code> e <code>hierarchy</code>. Crie o documento no console (coleção{' '}
              <code>users</code>, ID = seu UID) com pelo menos: sector, hierarchy, displayName, active.
            </Alert>
          ) : null}

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Acesso rápido
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(auto-fill, minmax(260px, 1fr))',
                },
                gap: 2,
                alignItems: 'stretch',
              }}
            >
              {actions.map((a, index) => {
                const isSupportHub = a.key === 'suporte'
                return (
                <Box
                  key={a.key}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                  }}
                >
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Fade
                      in={quickLinksVisible}
                      timeout={420}
                      style={{ transitionDelay: `${index * 75}ms` }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: 0,
                          height: '100%',
                        }}
                      >
                      <Paper
                        elevation={0}
                        onClick={() => navigate(a.to)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(a.to)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          p: 2.5,
                          borderRadius: 2.5,
                          border: 1,
                          cursor: 'pointer',
                          transition:
                            'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
                          ...(isSupportHub
                            ? {
                                bgcolor:
                                  mode === 'light'
                                    ? alpha(success, 0.12)
                                    : alpha(success, 0.18),
                                borderColor: alpha(success, mode === 'light' ? 0.42 : 0.5),
                                '&:hover': {
                                  borderColor: alpha(success, 0.62),
                                  boxShadow:
                                    mode === 'light'
                                      ? `0 12px 32px ${alpha(success, 0.2)}`
                                      : `0 12px 28px ${alpha(success, 0.12)}`,
                                  transform: 'translateY(-2px)',
                                },
                                '&:focus-visible': {
                                  outline: `2px solid ${success}`,
                                  outlineOffset: 2,
                                },
                              }
                            : {
                                bgcolor: 'background.paper',
                                borderColor: 'divider',
                                '&:hover': {
                                  borderColor: alpha(primary, 0.45),
                                  boxShadow:
                                    mode === 'light'
                                      ? `0 12px 32px ${alpha(primary, 0.12)}`
                                      : '0 12px 32px rgba(0,0,0,0.35)',
                                  transform: 'translateY(-2px)',
                                },
                                '&:focus-visible': {
                                  outline: `2px solid ${primary}`,
                                  outlineOffset: 2,
                                },
                              }),
                        }}
                      >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 2,
                          alignItems: 'flex-start',
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isSupportHub
                              ? alpha(success, mode === 'dark' ? 0.28 : 0.2)
                              : alpha(primary, mode === 'dark' ? 0.2 : 0.12),
                            color: isSupportHub ? 'success.main' : 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          {a.icon}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {a.title}
                            </Typography>
                            <ArrowForwardRoundedIcon
                              sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {a.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                      </Box>
                    </Fade>
                  </Box>
                </Box>
                )
              })}
            </Box>
          </Box>

          {!profileMissing && profile ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Seu perfil
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2,
                }}
              >
                <Chip
                  label={SECTOR_LABELS[profile.sector] ?? profile.sector}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={HIERARCHY_LABELS[profile.hierarchy] ?? profile.hierarchy}
                  size="small"
                  variant="outlined"
                />
                {profile.isAdmin ? (
                  <Chip label="Administrador" size="small" color="secondary" variant="outlined" />
                ) : null}
                {profile.isDev ? <Chip label="Dev" size="small" variant="outlined" /> : null}
              </Box>
              <Typography variant="body2" color="text.secondary" component="div">
                {profile.displayName ? (
                  <>
                    Nome: <strong>{profile.displayName}</strong>
                    <br />
                  </>
                ) : null}
                {user?.email ? (
                  <>
                    E-mail: <strong>{user.email}</strong>
                  </>
                ) : null}
              </Typography>
              {canManageUsers(profile) ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Gestão de contas: use o card <strong>Usuários</strong> acima.
                </Typography>
              ) : null}
            </Paper>
          ) : null}
        </Box>
      </Container>
    </Box>
  )
}
