import React, { useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Questionnaire, Question } from '../types';

// Mock local para testes
const mockQuestionnaires: Questionnaire[] = [
  {
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
  },
];

const QuestionnaireListPage: React.FC = () => {
  const [questionnaires] = useState<Questionnaire[]>(mockQuestionnaires);
  const [selected, setSelected] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [open, setOpen] = useState(false);

  const handleOpen = (q: Questionnaire) => {
    setSelected(q);
    setAnswers({});
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setAnswers({});
  };
  const handleChange = (qid: string, value: any) => {
    setAnswers(a => ({ ...a, [qid]: value }));
  };
  const handleSubmit = () => {
    // Aqui você pode salvar localmente ou exibir um alerta
    alert('Respostas enviadas! (mock local)');
    handleClose();
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>Questionários Disponíveis</Typography>
      <List>
        {questionnaires.filter(q => q.published).map(q => (
          <ListItem key={q.id} secondaryAction={
            <Button variant="contained" onClick={() => handleOpen(q)}>Responder</Button>
          }>
            <ListItemText primary={q.title} secondary={q.description} />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent>
          {selected?.questions.map(q => (
            <div key={q.id} style={{ marginBottom: 16 }}>
              <Typography variant="subtitle1">{q.label}{q.required && ' *'}</Typography>
              {q.type === 'text' && (
                <TextField fullWidth value={answers[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)} />
              )}
              {q.type === 'textarea' && (
                <TextField fullWidth multiline minRows={3} value={answers[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)} />
              )}
              {q.type === 'checkbox' && (
                <FormControlLabel control={<Checkbox checked={!!answers[q.id]} onChange={e => handleChange(q.id, e.target.checked)} />} label="Selecionar" />
              )}
              {/* Outros tipos podem ser implementados conforme necessário */}
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Enviar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionnaireListPage; 