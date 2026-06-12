import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '@firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import { useNavbarTheme, NavbarTheme } from '../contexts/NavbarThemeContext';
import mzlogoPadrao from '../assets/mzlogo-padrao.png';
import mzlogoMBranco from '../assets/mzlogo-mbranco.png';
import mzlogoZBranco from '../assets/mzlogo-zbranco.png';
import PaletteIcon from '@mui/icons-material/Palette';
import { IconButton, Popover } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Lista de emails de gerentes
const GERENTE_EMAILS = [
  'deivitrafael56@outlook.com',  // DEIVIT
  'hiagomznet@gmail.com',        // HIAGO
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony_sep@live.com'          // RAMONY
];

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGerente = user?.email && GERENTE_EMAILS.includes(user.email);
  const { theme, setTheme } = useNavbarTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handlePaletteClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePaletteClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'navbar-theme-popover' : undefined;
  const [anchorNotif, setAnchorNotif] = React.useState<null | HTMLElement>(null);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorNotif(event.currentTarget);
  };
  const handleNotifClose = () => {
    setAnchorNotif(null);
  };
  const notifOpen = Boolean(anchorNotif);
  const notifId = notifOpen ? 'navbar-notif-popover' : undefined;

  // Definições de cor e logo conforme o tema
  let navbarColor = '#15803d';
  let logo = mzlogoMBranco;
  let buttonColor: 'inherit' | 'primary' = 'inherit';
  let buttonStyle = {};
  let textColor = '#fff';

  if (theme === 'dark') {
    navbarColor = '#23272f';
    logo = mzlogoZBranco;
    buttonColor = 'inherit';
    buttonStyle = { color: '#e0e0e0' };
    textColor = '#e0e0e0';
  } else if (theme === 'gelo') {
    navbarColor = '#f5f6fa';
    logo = mzlogoPadrao;
    buttonColor = 'primary';
    buttonStyle = { color: '#15803d' };
    textColor = '#15803d';
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AppBar position="fixed" className="navbar" style={{ backgroundColor: navbarColor }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo MZ" style={{ height: '40px', marginRight: '16px' }} />
          <Button color={buttonColor} style={buttonStyle} component={Link} to="/">
            Dashboard
          </Button>
          <Button color={buttonColor} style={buttonStyle} component={Link} to="/upgrades">
            Upgrades
          </Button>
          {isGerente && (
            <>
              <Button color={buttonColor} style={buttonStyle} component={Link} to="/users">
                Usuários
              </Button>
              <Button color={buttonColor} style={buttonStyle} component={Link} to="/gerente/comissoes">
                Comissões
              </Button>
              <Button color={buttonColor} style={buttonStyle} component={Link} to="/questionarios">
                Questionários
              </Button>
              <Button color={buttonColor} style={buttonStyle} component={Link} to="/gerente/questionarios">
                Gerenciar Questionários
              </Button>
            </>
          )}
        </Box>
        {/* Seletor de cor da navbar - agora minimalista com popover */}
        <Box sx={{ mr: 2 }}>
          <IconButton onClick={handlePaletteClick} aria-describedby={id} size="large">
            <PaletteIcon style={{ color: textColor }} />
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handlePaletteClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { p: 2, display: 'flex', gap: 2 } }}
          >
            <IconButton onClick={() => { setTheme('verde'); handlePaletteClose(); }}>
              <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: '#15803d', border: theme === 'verde' ? '2px solid #23272f' : '2px solid #fff' }} />
            </IconButton>
            <IconButton onClick={() => { setTheme('gelo'); handlePaletteClose(); }}>
              <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: '#f5f6fa', border: theme === 'gelo' ? '2px solid #23272f' : '2px solid #ccc' }} />
            </IconButton>
            <IconButton onClick={() => { setTheme('dark'); handlePaletteClose(); }}>
              <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: '#23272f', border: theme === 'dark' ? '2px solid #15803d' : '2px solid #fff' }} />
            </IconButton>
          </Popover>
        </Box>
        <Box sx={{ mr: 2 }}>
          <IconButton onClick={handleNotifClick} aria-describedby={notifId} size="large">
            <NotificationsIcon style={{ color: textColor }} />
          </IconButton>
          <Popover
            id={notifId}
            open={notifOpen}
            anchorEl={anchorNotif}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { p: 2, minWidth: 250 } }}
          >
            <Typography variant="subtitle1">Avisos</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Nenhum aviso no momento.
            </Typography>
          </Popover>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 2 }}>
          <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 600 }}>
            {user.name || user.email}
          </Typography>
          {user.name && (
            <Typography variant="caption" sx={{ color: textColor, opacity: 0.7 }}>
              {user.email}
            </Typography>
          )}
        </Box>
        <Button color={buttonColor} style={buttonStyle} onClick={handleLogout}>
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 