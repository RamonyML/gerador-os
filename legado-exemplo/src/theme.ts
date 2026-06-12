import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'verde' | 'gelo' | 'dark') => createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif' },
    h2: { fontFamily: '"Poppins", sans-serif' },
    h3: { fontFamily: '"Poppins", sans-serif' },
    h4: { fontFamily: '"Poppins", sans-serif' },
    h5: { fontFamily: '"Poppins", sans-serif' },
    h6: { fontFamily: '"Poppins", sans-serif' },
    button: { fontFamily: '"Poppins", sans-serif', textTransform: 'none' },
  },
  palette: mode === 'dark' ? {
    mode: 'dark',
    primary: {
      main: '#23272f', // Cinza escuro
      light: '#444950',
      dark: '#181a1f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#fff',
      contrastText: '#23272f',
    },
    background: {
      default: '#f3f4f6', // Cinza claro para o fundo
      paper: '#fff', // Cards claros no dark
    },
    text: {
      primary: '#23272f', // Cinza escuro para texto sobre cards claros
      secondary: '#444950',
    },
  } : mode === 'gelo' ? {
    primary: {
      main: '#4ade80',
      light: '#bbf7d0',
      dark: '#22c55e',
      contrastText: '#fff',
    },
    secondary: {
      main: '#fff',
      contrastText: '#15803d',
    },
    background: {
      default: '#f5f6fa',
      paper: '#fff',
    },
  } : {
    primary: {
      main: '#15803d',
      light: '#22c55e',
      dark: '#166534',
      contrastText: '#fff',
    },
    secondary: {
      main: '#fff',
      contrastText: '#15803d',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#23272f' : mode === 'gelo' ? '#f5f6fa' : '#15803d',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontFamily: '"Poppins", sans-serif',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
}); 