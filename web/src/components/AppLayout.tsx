import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { canManageUsers } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'
import { canAccessCadastroHub } from '../lib/cadastroAccess'
import { canAccessCondominios } from '../lib/condominiosAccess'
import { brandLogoSrc } from '../lib/brandAssets'
import { useNotices } from '../hooks/useNotices'
import { useHelpdeskNotifications } from '../hooks/useHelpdeskNotifications'
import { useSidebarTexture } from '../contexts/SidebarTextureContext'
import { SECTOR_LABELS } from '../types/profile'
import { buildNavItems } from '../config/navItems'
import { NoticeDialog } from './NoticeDialog'
import { GlobalMeshBackground } from './GlobalMeshBackground'
import { GlobalCircuitBackground } from './GlobalCircuitBackground'
import { GlobalDotsBackground } from './GlobalDotsBackground'
import { SidebarCircuit } from './SidebarCircuit'
import { SidebarWaves } from './SidebarWaves'
import { SidebarBubbles } from './SidebarBubbles'
import { SidebarDots } from './SidebarDots'
import { SidebarHexagons } from './SidebarHexagons'
import { SidebarMesh } from './SidebarMesh'

const SIDEBAR_WIDTH = 268
const SIDEBAR_COLLAPSED_WIDTH = 76
const SIDEBAR_COLLAPSED_KEY = 'gerador-os:sidebarCollapsed'

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function AppLayout() {
  const { user, profile, photoURL, logOut } = useAuth()
  const showUsers = profile != null && canManageUsers(profile)
  const showSupport = profile != null && canAccessSupportHub(profile)
  const showCadastro = profile != null && canAccessCadastroHub(profile)
  const showCondominios = profile != null && canAccessCondominios(profile)
  const { mode, toggle } = useColorMode()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  const [noticeAnchor, setNoticeAnchor] = useState<HTMLElement | null>(null)
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const notices = useNotices({ uid: user?.uid ?? null, profile })
  const helpdesk = useHelpdeskNotifications({ uid: user?.uid ?? null, profile })
  const { texture } = useSidebarTexture()

  useEffect(() => {
    if (pathname.startsWith('/chamados')) helpdesk.markSeenAll()
  }, [pathname, helpdesk.markSeenAll])

  const totalUnread = notices.unreadCount + helpdesk.unreadCount

  const navItems = useMemo(
    () => buildNavItems({ showSupport, showCadastro, showUsers, showCondominios }),
    [showSupport, showCadastro, showUsers, showCondominios],
  )

  const openNoticeMenu = (el: HTMLElement) => setNoticeAnchor(el)
  const closeNoticeMenu = () => setNoticeAnchor(null)
  const noticeMenuOpen = Boolean(noticeAnchor)
  const selectedNotice = useMemo(
    () =>
      selectedNoticeId
        ? notices.state.notices.find((n) => n.id === selectedNoticeId) ?? null
        : null,
    [selectedNoticeId, notices.state.notices],
  )

  const displayName =
    profile?.displayName?.trim() || user?.email?.split('@')[0] || 'Usuário'
  const sectorLabel = profile ? SECTOR_LABELS[profile.sector] ?? profile.sector : ''

  const renderDrawer = (isCollapsed: boolean) => (
    <Box sx={{ position: 'relative', height: '100%', overflowX: 'hidden' }}>
      {texture === 'circuito' ? <SidebarCircuit /> : null}
      {texture === 'ondas' ? <SidebarWaves /> : null}
      {texture === 'bolhas' ? <SidebarBubbles /> : null}
      {texture === 'pontos' ? <SidebarDots /> : null}
      {texture === 'hexagonos' ? <SidebarHexagons /> : null}
      {texture === 'malha' ? <SidebarMesh /> : null}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
      <Box
        component={RouterLink}
        to="/"
        onClick={() => setMobileOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: 1.25,
          px: isCollapsed ? 1 : 2.5,
          height: 64,
          textDecoration: 'none',
          color: 'inherit',
          flexShrink: 0,
          transition: 'padding 0.25s ease',
        }}
      >
        <Box
          component="img"
          src={brandLogoSrc(mode)}
          alt=""
          sx={{
            height: isCollapsed ? 24 : 30,
            width: 'auto',
            display: 'block',
            transition: 'height 0.25s ease',
          }}
        />
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.01em',
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? 0 : 200,
            overflow: 'hidden',
            transition: 'opacity 0.2s ease, max-width 0.25s ease',
          }}
        >
          Gerador de O.S
        </Typography>
      </Box>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            px: 3,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: isCollapsed ? 0 : 1,
            height: isCollapsed ? 0 : 'auto',
            overflow: 'hidden',
            transition: 'opacity 0.2s ease',
          }}
        >
          Navegação
        </Typography>
        <List sx={{ mt: 0.5 }}>
          {navItems.map((item) => {
            const active = item.isActive(pathname)
            const Icon = item.icon
            return (
              <Tooltip
                key={item.to}
                title={item.label}
                placement="right"
                disableHoverListener={!isCollapsed}
                disableFocusListener={!isCollapsed}
                disableTouchListener={!isCollapsed}
              >
                <ListItemButton
                  component={RouterLink}
                  to={item.to}
                  selected={active}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    position: 'relative',
                    mx: 1.25,
                    my: 0.25,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    color: active ? 'primary.main' : 'text.secondary',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    '&.Mui-selected, &.Mui-selected:hover': {
                      bgcolor: (t) =>
                        alpha(t.palette.primary.main, mode === 'dark' ? 0.18 : 0.1),
                    },
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: (t) =>
                        alpha(t.palette.primary.main, mode === 'dark' ? 0.12 : 0.06),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 4,
                      top: 9,
                      bottom: 9,
                      width: 3,
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      transform: active ? 'scaleY(1)' : 'scaleY(0)',
                      transition: 'transform 0.25s ease',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 50,
                      right: 16,
                      bottom: 7,
                      height: 2,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      opacity: 0.7,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.25s ease',
                      display: isCollapsed ? 'none' : 'block',
                    },
                    '&:hover::after': { transform: active ? 'scaleX(0)' : 'scaleX(1)' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 38,
                      justifyContent: 'center',
                      color: active ? 'primary.main' : 'text.secondary',
                      transition: 'min-width 0.25s ease',
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      my: 0,
                      opacity: isCollapsed ? 0 : 1,
                      maxWidth: isCollapsed ? 0 : 200,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      transition: 'opacity 0.2s ease, max-width 0.25s ease',
                    }}
                    slotProps={{
                      primary: {
                        sx: { fontSize: 14, fontWeight: active ? 700 : 500 },
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            )
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 2 }} />

      <Box
        sx={{
          p: 1.5,
          flexShrink: 0,
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Box
          component={RouterLink}
          to="/perfil"
          onClick={() => setMobileOpen(false)}
          sx={{
            flex: isCollapsed ? '0 0 auto' : 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 1.25,
            p: 1,
            borderRadius: 2,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              bgcolor: (t) => alpha(t.palette.primary.main, mode === 'dark' ? 0.12 : 0.06),
            },
          }}
        >
          <Avatar
            src={photoURL ?? undefined}
            sx={{
              width: 38,
              height: 38,
              bgcolor: 'primary.main',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initialsFrom(displayName)}
          </Avatar>
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? 0 : 200,
              overflow: 'hidden',
              transition: 'opacity 0.2s ease, max-width 0.25s ease',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {sectorLabel || user?.email}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Sair" placement={isCollapsed ? 'right' : 'top'}>
          <IconButton size="small" onClick={() => void logOut()} aria-label="Sair">
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH },
          flexShrink: { md: 0 },
          transition: (t) =>
            t.transitions.create('width', {
              easing: t.transitions.easing.easeInOut,
              duration: t.transitions.duration.standard,
            }),
        }}
        aria-label="Navegação principal"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
            },
          }}
        >
          {renderDrawer(false)}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              overflowX: 'hidden',
              transition: (t) =>
                t.transitions.create('width', {
                  easing: t.transitions.easing.easeInOut,
                  duration: t.transitions.duration.standard,
                }),
            },
          }}
        >
          {renderDrawer(collapsed)}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <Toolbar variant="dense" sx={{ gap: 0.5 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              sx={{ display: { md: 'none' }, mr: 0.5 }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Tooltip title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
              <IconButton
                edge="start"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                sx={{ display: { xs: 'none', md: 'inline-flex' }, mr: 0.5 }}
              >
                <MenuOpenRoundedIcon
                  sx={{
                    transform: collapsed ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </IconButton>
            </Tooltip>

            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: { xs: 'flex', md: 'none' },
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                component="img"
                src={brandLogoSrc(mode)}
                alt=""
                sx={{ height: 26, width: 'auto', display: 'block' }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {user?.email ? (
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  maxWidth: { sm: 180, md: 320 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'text.secondary',
                  fontWeight: 700,
                  mr: 0.5,
                }}
                title={user.email}
              >
                {user.email}
              </Typography>
            ) : null}

            <Tooltip
              title={
                totalUnread > 0
                  ? `${totalUnread} notificação(ões) não lida(s)`
                  : 'Notificações'
              }
            >
              <IconButton
                color="inherit"
                aria-label="Notificações"
                onClick={(e) => openNoticeMenu(e.currentTarget)}
              >
                <Badge
                  color="error"
                  variant={totalUnread > 0 ? 'dot' : 'standard'}
                  overlap="circular"
                >
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Popover
              open={noticeMenuOpen}
              anchorEl={noticeAnchor}
              onClose={() => closeNoticeMenu()}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: { sx: { width: 360, maxWidth: 'calc(100vw - 24px)', borderRadius: 2 } },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Notificações
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalUnread > 0
                    ? `${totalUnread} não lida(s)`
                    : 'Tudo em dia por aqui.'}
                </Typography>
              </Box>

              {helpdesk.items.length > 0 && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box
                    sx={{
                      px: 2,
                      pt: 1.25,
                      pb: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    >
                      Chamados
                    </Typography>
                    <Tooltip title="Marcar chamados como vistos">
                      <IconButton
                        size="small"
                        aria-label="Marcar chamados como vistos"
                        onClick={() => helpdesk.markSeenAll()}
                      >
                        <MarkChatReadOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <List disablePadding dense>
                    {helpdesk.items.slice(0, 6).map((it) => (
                      <ListItemButton
                        key={it.id}
                        onClick={() => {
                          helpdesk.markSeenAll()
                          closeNoticeMenu()
                          navigate(`/chamados/${it.ticketId}`)
                        }}
                        sx={{ alignItems: 'flex-start', gap: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, mt: 0.25, color: 'primary.main' }}>
                          <ConfirmationNumberOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {it.kind === 'novo'
                                ? 'Novo chamado aberto'
                                : 'Nova resposta no seu chamado'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {it.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {it.kind === 'novo'
                                  ? `Aberto por ${it.who}`
                                  : `Resposta de ${it.who}`}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              )}

              {(helpdesk.items.length > 0 || notices.unreadNotices.length > 0) && (
                <Box sx={{ px: 2, pt: 1.25, pb: 0.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    Avisos
                  </Typography>
                </Box>
              )}
              <List disablePadding dense>
                {notices.unreadNotices.length === 0 ? (
                  <Box sx={{ px: 2, py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Sem notificações pendentes.
                    </Typography>
                  </Box>
                ) : (
                  notices.unreadNotices.slice(0, 8).map((n) => (
                    <ListItemButton
                      key={n.id}
                      onClick={() => {
                        setSelectedNoticeId(n.id)
                      }}
                      sx={{ alignItems: 'flex-start' }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {n.authorName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {n.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {n.target.scope === 'all'
                                ? 'Para todos'
                                : `Para ${SECTOR_LABELS[n.target.sector] ?? n.target.sector}`}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  onClick={() => {
                    closeNoticeMenu()
                    navigate('/avisos')
                  }}
                >
                  Ver todos
                </Button>
                {notices.unreadNotices.length > 0 ? (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={async () => {
                      const ids = notices.unreadNotices.slice(0, 8).map((n) => n.id)
                      await Promise.all(ids.map((id) => notices.markAsRead(id)))
                    }}
                  >
                    Marcar exibidos como lidos
                  </Button>
                ) : (
                  <Box />
                )}
              </Box>
            </Popover>

            <NoticeDialog
              notice={selectedNotice}
              open={selectedNotice != null}
              onClose={() => setSelectedNoticeId(null)}
              onMarkRead={async (id) => {
                await notices.markAsRead(id)
              }}
              isUnread={
                selectedNotice ? notices.state.unreadIds.has(selectedNotice.id) : false
              }
            />

            <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema escuro'}>
              <IconButton color="inherit" onClick={() => toggle()} aria-label="Alternar tema">
                {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: 'background.default',
          }}
        >
          {/* Fundo global discreto (fade à esquerda), condicionado à textura
              escolhida no perfil: mesh, circuito ou pontos (demais/Nenhuma). */}
          {texture === 'malha' ? (
            <GlobalMeshBackground />
          ) : texture === 'circuito' ? (
            <GlobalCircuitBackground />
          ) : (
            <GlobalDotsBackground />
          )}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
