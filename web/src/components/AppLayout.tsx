import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ColorModeContext'
import { canManageOsTemplates, canManageUsers } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'
import { brandLogoSrc } from '../lib/brandAssets'

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
            <Button color="inherit" size="small" onClick={() => navigate('/sobre')}>
              Sobre
            </Button>
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
