import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { canManageOsTemplates, canManageUsers } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'
import { brandLogoSrc } from '../lib/brandAssets'
import { useNotices } from '../hooks/useNotices'
import { SECTOR_LABELS } from '../types/profile'
import { NoticeDialog } from './NoticeDialog'

export function AppLayout() {
  const { user, profile, logOut } = useAuth()
  const showModels = profile != null && canManageOsTemplates(profile)
  const showUsers = profile != null && canManageUsers(profile)
  const showSupport = profile != null && canAccessSupportHub(profile)
  const { mode, toggle } = useColorMode()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  /** No painel inicial os atalhos principais estão nos cards; a barra fica mais enxuta. */
  const isHome = pathname === '/'
  const [noticeAnchor, setNoticeAnchor] = useState<HTMLElement | null>(null)
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const notices = useNotices({ uid: user?.uid ?? null, profile })

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        <Toolbar variant="dense" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Box
            component="button"
            type="button"
            onClick={() => navigate('/')}
            sx={{
              mr: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: 'inherit',
              font: 'inherit',
              p: 0,
            }}
          >
            {isHome ? null : (
              <Box
                component="img"
                src={brandLogoSrc(mode)}
                alt=""
                sx={{ height: 28, width: 'auto', display: 'block' }}
              />
            )}
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Gerador de O.S
            </Typography>
          </Box>

          {isHome ? (
            <>
              <Button color="inherit" size="small" onClick={() => navigate('/avisos')}>
                Avisos
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate('/sobre')}>
                Sobre
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/')}>
                Início
              </Button>
              {showSupport ? (
                <Button color="inherit" onClick={() => navigate('/suporte')}>
                  Suporte
                </Button>
              ) : null}
              {showModels ? (
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin/modelos-os')}
                >
                  Modelos
                </Button>
              ) : null}
              <Button color="inherit" onClick={() => navigate('/escala')}>
                Escala
              </Button>
              <Button color="inherit" onClick={() => navigate('/upgrades')}>
                Upgrades
              </Button>
              {showUsers ? (
                <Button color="inherit" onClick={() => navigate('/admin/usuarios')}>
                  Usuários
                </Button>
              ) : null}
              <Button color="inherit" onClick={() => navigate('/avisos')}>
                Avisos
              </Button>
              <Button color="inherit" onClick={() => navigate('/sobre')}>
                Sobre
              </Button>
            </>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 220 }}
            noWrap
            title={user?.email ?? ''}
          >
            {user?.email}
          </Typography>

          <Tooltip title={notices.unreadCount > 0 ? `${notices.unreadCount} aviso(s) não lido(s)` : 'Avisos'}>
            <IconButton
              color="inherit"
              aria-label="Avisos"
              onClick={(e) => openNoticeMenu(e.currentTarget)}
              sx={{ ml: 0.5 }}
            >
              <Badge
                color="error"
                variant={notices.unreadCount > 0 ? 'dot' : 'standard'}
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
            slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 24px)', borderRadius: 2 } } }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Notificações
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notices.unreadCount > 0
                  ? `${notices.unreadCount} não lida(s)`
                  : 'Nenhum aviso novo.'}
              </Typography>
            </Box>
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
                    onClick={async () => {
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
                          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
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
            isUnread={selectedNotice ? notices.state.unreadIds.has(selectedNotice.id) : false}
          />

          <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema escuro'}>
            <IconButton
              color="inherit"
              onClick={() => toggle()}
              aria-label="Alternar tema"
            >
              {mode === 'dark' ? (
                <LightModeOutlinedIcon />
              ) : (
                <DarkModeOutlinedIcon />
              )}
            </IconButton>
          </Tooltip>

          <Button color="inherit" size="small" onClick={() => void logOut()}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  )
}
