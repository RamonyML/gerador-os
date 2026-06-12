import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import { Add as AddIcon } from '@mui/icons-material';
import { User } from '../types';
import { collection, getDocs, doc, deleteDoc, QueryDocumentSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

// Lista de emails de gerentes
const GERENTE_EMAILS = [
  'deivitrafael56@outlook.com',    // DEIVIT
  'ramony_sep@live.com',           // RAMONY
  'hiagomznet@gmail.com',          // HIAGO
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony.mznet@gmail.com'         // RAMON
];

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isGerente = auth.currentUser?.email && GERENTE_EMAILS.includes(auth.currentUser.email);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'operadores'));
      const usersData = Array.from(querySnapshot.docs).map((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: (data as any).email || '',
          name: (data as any).nome || '',
          role: (data as any).role || 'operador',
          ativo: (data as any).ativo ?? true,
          createdAt: (data as any).createdAt?.toDate?.()?.toISOString(),
          updatedAt: (data as any).updatedAt?.toDate?.()?.toISOString(),
        } as User;
      });
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteDoc(doc(db, 'operadores', user.uid));
      await loadUsers();
      toast.success('Usuário excluído com sucesso');
      setError(null);
    } catch (err) {
      setError('Erro ao excluir usuário');
      toast.error('Erro ao excluir usuário');
      console.error(err);
    }
  };

  const handleResetPassword = async (user: User) => {
    console.log('Reset senha do usuário:', user);
  };

  return (
    <Container maxWidth="xl">
      <Box className="py-6">
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h4">
            Gerenciamento de Usuários
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUser(null);
              setIsFormOpen(true);
            }}
          >
            Novo Usuário
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <UserTable 
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
        />

        <Dialog
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <UserForm
            user={selectedUser || undefined}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedUser(null);
              loadUsers();
            }}
            onResetPassword={handleResetPassword}
          />
        </Dialog>
      </Box>
    </Container>
  );
};

export default UserManagementPage; 