import React, { useState, useEffect } from 'react';
import { Container, Button, Dialog } from '@mui/material';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import { User } from '../types';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, deleteDoc, DocumentData } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';

// Lista de emails de gerentes
const GERENTE_EMAILS = [
  'ramony_sep@live.com',          // RAMONY
  'deivitrafael56@outlook.com',   // DEIVIT
  'hiagomznet@gmail.com',         // HIAGO
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony.mznet@gmail.com'        // RAMON
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isGerente = auth.currentUser?.email && GERENTE_EMAILS.includes(auth.currentUser.email);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'operadores'));
      const loadedUsers: User[] = [];
      querySnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data() as DocumentData;
        loadedUsers.push({
          email: docSnapshot.id,
          name: data.nome,
          role: data.role,
          ativo: data.ativo,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          uid: data.uid
        });
      });
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    if (!isGerente) {
      toast.error('Apenas gerentes podem editar usuários');
      return;
    }
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!isGerente) {
      toast.error('Apenas gerentes podem excluir usuários');
      return;
    }

    try {
      await deleteDoc(doc(db, 'operadores', user.email));
      toast.success('Usuário excluído com sucesso');
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!isGerente) {
      toast.error('Apenas gerentes podem redefinir senhas');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`Email de redefinição de senha enviado para ${user.email}`);
    } catch (error: any) {
      console.error('Erro ao enviar email de redefinição:', error);
      toast.error(error.message || 'Erro ao enviar email de redefinição');
    }
  };

  return (
    <Container>
      {isGerente && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedUser(null);
            setIsFormOpen(true);
          }}
          sx={{ mb: 2 }}
        >
          Novo Usuário
        </Button>
      )}

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
      />

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <UserForm
          user={selectedUser || undefined}
          onClose={() => {
            setIsFormOpen(false);
            loadUsers();
          }}
          onResetPassword={handleResetPassword}
        />
      </Dialog>
    </Container>
  );
};

export default Users; 