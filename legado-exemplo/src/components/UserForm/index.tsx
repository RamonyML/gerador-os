import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Switch,
  FormControlLabel
} from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase';
import toast from 'react-hot-toast';
import { User, UserRole, UserFormProps, FormData } from '../../types';

// Lista de emails de gerentes
const GERENTE_EMAILS = [
  'deivitrafael56@outlook.com',    // DEIVIT
  'ramony_sep@live.com',           // RAMONY
  'hiagomznet@gmail.com',          // HIAGO
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony.mznet@gmail.com'         // RAMON
];

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onResetPassword }) => {
  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || 'operador',
    ativo: user?.ativo ?? true
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isGerente = auth.currentUser?.email && GERENTE_EMAILS.includes(auth.currentUser.email);

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData({ ...formData, role: event.target.value as UserRole });
  };

  const handleAtivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, ativo: event.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        // Verifica se é gerente
        if (!isGerente) {
          toast.error('Apenas gerentes podem criar usuários');
          return;
        }

        // Primeiro cria o documento no Firestore
        const userDocRef = doc(db, 'operadores', formData.email);
        await setDoc(userDocRef, {
          nome: formData.name,
          role: formData.role,
          email: formData.email,
          ativo: formData.ativo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Depois cria o usuário no Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          password
        );

        // Atualiza o documento com o UID
        await setDoc(userDocRef, {
          uid: userCredential.user.uid
        }, { merge: true });

        toast.success('Usuário criado com sucesso!');
      } else {
        // Atualiza usuário existente
        const userDocRef = doc(db, 'operadores', user.email);
        await setDoc(userDocRef, {
          nome: formData.name,
          role: formData.role,
          ativo: formData.ativo,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast.success('Usuário atualizado com sucesso!');
      }

      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        {user ? 'Editar Usuário' : 'Novo Usuário'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!!user}
            required
            fullWidth
          />

          <TextField
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          {!user && (
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
          )}

          <FormControl fullWidth>
            <InputLabel>Função</InputLabel>
            <Select
              value={formData.role}
              onChange={handleRoleChange}
              label="Função"
              required
            >
              <MenuItem value="operador">Operador</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.ativo}
                onChange={handleAtivoChange}
                color="primary"
              />
            }
            label="Usuário Ativo"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default UserForm; 