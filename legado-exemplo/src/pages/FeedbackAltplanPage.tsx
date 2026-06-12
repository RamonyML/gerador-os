import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import PrivateRoute from '../components/PrivateRoute';
import Navbar from '../components/Navbar';

const FeedbackAltplanPage: React.FC = () => {
  return (
    <PrivateRoute>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 12 }}>
        <Box p={4} bgcolor="#fff" borderRadius={2} boxShadow={2}>
          <Typography variant="h4" gutterBottom>
            Feedback - Alteração de Plano (com/sem troca de equipamento)
          </Typography>
          {/* Aqui vai o formulário de feedback adaptado do HTML */}
          <Typography variant="body1" color="textSecondary">
            (Formulário de feedback será implementado aqui)
          </Typography>
        </Box>
      </Container>
    </PrivateRoute>
  );
};

export default FeedbackAltplanPage; 