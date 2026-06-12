import React, { useState } from 'react';
import { Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, FormControlLabel, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Questionnaire, Question, QuestionType } from '../types';

// Mock local para testes
const initialQuestionnaires: Questionnaire[] = [];

const defaultQuestionTypes: { label: string; value: QuestionType }[] = [
  { label: 'Texto curto', value: 'text' },
  { label: 'Texto longo', value: 'textarea' },
  { label: 'Múltipla escolha (radio)', value: 'radio' },
  { label: 'Caixa de seleção (checkbox)', value: 'checkbox' },
  { label: 'Seleção (dropdown)', value: 'select' },
];

const QuestionnaireManagementPage: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(initialQuestionnaires);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Questionnaire | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [published, setPublished] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setQuestions([]);
    setPublished(false);
    setEditing(null);
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (editing) {
      setQuestionnaires(qs => qs.map(q => q.id === editing.id ? { ...editing, title, description, questions, published } : q));
    } else {
      setQuestionnaires(qs => [
        ...qs,
        {
          id: Date.now().toString(),
          title,
          description,
          questions,
          createdBy: 'gerente@local',
          createdAt: new Date().toISOString(),
          published,
        },
      ]);
    }
    handleClose();
  };

  const handleEdit = (q: Questionnaire) => {
    setEditing(q);
    setTitle(q.title);
    setDescription(q.description || '');
    setQuestions(q.questions);
    setPublished(q.published);
    setOpen(true);
  };

  // Adicionar/remover perguntas (simples para protótipo)
  const handleAddQuestion = () => {
    setQuestions(qs => [
      ...qs,
      {
        id: Date.now().toString(),
        label: '',
        type: 'text',
        required: false,
      },
    ]);
  };
  const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };
  const handleRemoveQuestion = (idx: number) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h4">Gerenciar Questionários</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Novo Questionário
        </Button>
      </Box>
      <List>
        {questionnaires.map(q => (
          <ListItem key={q.id} secondaryAction={
            <IconButton edge="end" onClick={() => handleEdit(q)}><EditIcon /></IconButton>
          }>
            <ListItemText primary={q.title} secondary={q.published ? 'Publicado' : 'Rascunho'} />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Editar' : 'Novo'} Questionário</DialogTitle>
        <DialogContent>
          <TextField label="Título" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} />
          <TextField label="Descrição" fullWidth margin="normal" value={description} onChange={e => setDescription(e.target.value)} />
          <FormControlLabel control={<Checkbox checked={published} onChange={e => setPublished(e.target.checked)} />} label="Publicado" />
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Perguntas</Typography>
            {questions.map((q, idx) => (
              <Box key={q.id} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, mb: 2 }}>
                <TextField label="Pergunta" fullWidth margin="dense" value={q.label} onChange={e => handleQuestionChange(idx, 'label', e.target.value)} />
                <TextField
                  select
                  label="Tipo"
                  fullWidth
                  margin="dense"
                  value={q.type}
                  onChange={e => handleQuestionChange(idx, 'type', e.target.value)}
                  SelectProps={{ native: true }}
                >
                  {defaultQuestionTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </TextField>
                <FormControlLabel
                  control={<Checkbox checked={q.required || false} onChange={e => handleQuestionChange(idx, 'required', e.target.checked)} />}
                  label="Obrigatória"
                />
                <Button color="error" onClick={() => handleRemoveQuestion(idx)}>Remover</Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddQuestion}>Adicionar Pergunta</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionnaireManagementPage; 