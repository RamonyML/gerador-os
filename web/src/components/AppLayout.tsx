import { Outlet, useNavigate } from 'react-router-dom'
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
import { canManageOsTemplates } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'

export function AppLayout() {
  const { user, profile, logOut } = useAuth()
  const showModels = profile != null && canManageOsTemplates(profile)
  const showSupport = profile != null && canAccessSupportHub(profile)
  const { mode, toggle } = useColorMode()
  const navigate = useNavigate()

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
          <Typography
            variant="h6"
            component="button"
            type="button"
            onClick={() => navigate('/')}
            sx={{
              mr: 1,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: 'inherit',
              font: 'inherit',
              p: 0,
            }}
          >
            Gerador de O.S
          </Typography>

          <Button color="inherit" onClick={() => navigate('/')}>
            Início
          </Button>
          <Button color="inherit" onClick={() => navigate('/gerar-os')}>
            Gerar O.S
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
