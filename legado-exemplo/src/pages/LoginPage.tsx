import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { TextField, Button, Paper, Box, Typography, Link } from '@mui/material';
import toast from 'react-hot-toast';
import logoPadrao from '../assets/mzlogo-padrao.png';
import { useAuth } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      // O redirecionamento será feito pelo useEffect quando o user for atualizado
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Email ou senha incorretos');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#ffffff',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img src={logoPadrao} alt="MZ NET" style={{ height: '80px', marginBottom: '16px' }} />
        </Box>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Registro de Upgrades
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = 'https://mz-gerador.web.app/suporte/dashboard.html'}
          sx={{ mt: 2 }}
        >
          Voltar para o Gerador de O.S
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage; 