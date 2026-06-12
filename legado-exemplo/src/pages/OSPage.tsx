import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const OSPage: React.FC = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="xl">
      <Box className="py-6">
        <Typography variant="h4" className="mb-6">
          {id ? `Ordem de Serviço #${id}` : 'Nova Ordem de Serviço'}
        </Typography>
        
        {/* Conteúdo da OS será implementado posteriormente */}
      </Box>
    </Container>
  );
};

export default OSPage; 