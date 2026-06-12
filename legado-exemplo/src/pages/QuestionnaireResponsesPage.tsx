import React, { useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Questionnaire, QuestionnaireResponse } from '../types';

// Mock local para testes
const mockQuestionnaire: Questionnaire = {
  id: '1',
  title: 'Check-in Semestral',
  description: 'Formulário para colaboradores com mais de 6 meses de empresa',
  questions: [
    { id: 'q1', label: 'Como você tem se sentido trabalhando na empresa?', type: 'textarea', required: true },
    { id: 'q2', label: 'O que mais te motiva no dia a dia aqui?', type: 'text', required: false },
  ],
  createdBy: 'gerente@local',
  createdAt: new Date().toISOString(),
  published: true,
};

const mockResponses: QuestionnaireResponse[] = [
  {
    id: 'r1',
    questionnaireId: '1',
    userId: 'u1',
    userName: 'Ana Souza',
    userEmail: 'ana@email.com',
    answers: { q1: 'Muito bem!', q2: 'O ambiente é ótimo.' },
    submittedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'r2',
    questionnaireId: '1',
    userId: 'u2',
    userName: 'Carlos Silva',
    userEmail: 'carlos@email.com',
    answers: { q1: 'Motivado.', q2: 'Os colegas.' },
    submittedAt: '2024-06-02T11:00:00Z',
  },
];

const QuestionnaireResponsesPage: React.FC = () => {
  const [selected, setSelected] = useState<QuestionnaireResponse | null>(null);
  const [open, setOpen] = useState(false);

  // Ordenar por nome
  const responses = [...mockResponses].sort((a, b) => a.userName.localeCompare(b.userName));

  const handleOpen = (r: QuestionnaireResponse) => {
    setSelected(r);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>Respostas - {mockQuestionnaire.title}</Typography>
      <List>
        {responses.map(r => (
          <ListItem key={r.id} secondaryAction={
            <Button variant="outlined" onClick={() => handleOpen(r)}>Ver detalhes</Button>
          }>
            <ListItemText primary={r.userName} secondary={r.userEmail} />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Respostas de {selected?.userName}</DialogTitle>
        <DialogContent>
          {mockQuestionnaire.questions.map(q => (
            <div key={q.id} style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1">{q.label}</Typography>
              <Typography variant="body2" sx={{ color: '#333', ml: 2 }}>{selected?.answers[q.id] || <i>Não respondido</i>}</Typography>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionnaireResponsesPage; 