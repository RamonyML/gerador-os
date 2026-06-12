import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Key as KeyIcon } from '@mui/icons-material';
import { User, UserTableProps, GERENTE_EMAILS } from '../../types';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onResetPassword }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const isGerente = auth.currentUser?.email && GERENTE_EMAILS.includes(auth.currentUser.email);

  const handleResetPassword = (user: User) => {
    if (!isGerente) {
      toast.error('Apenas gerentes podem redefinir senhas');
      return;
    }
    setUserToReset(user);
    setResetConfirmOpen(true);
  };

  const handleConfirmResetPassword = () => {
    if (userToReset) {
      onResetPassword(userToReset);
      setResetConfirmOpen(false);
      setUserToReset(null);
    }
  };

  const handleDeleteClick = (user: User) => {
    if (!isGerente) {
      toast.error('Apenas gerentes podem excluir usuários');
      return;
    }
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (user: User) => {
    if (!isGerente) {
      toast.error('Apenas gerentes podem editar usuários');
      return;
    }
    onEdit(user);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.ativo ? "Ativo" : "Inativo"}
                    color={user.ativo ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {isGerente && (
                    <>
                      <IconButton onClick={() => handleEditClick(user)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleResetPassword(user)} size="small">
                        <KeyIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(user)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir o usuário {userToDelete?.name}?
          Esta ação não pode ser desfeita.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)}>
        <DialogTitle>Confirmar Redefinição de Senha</DialogTitle>
        <DialogContent>
          Deseja enviar um email de redefinição de senha para {userToReset?.email}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmResetPassword} color="primary">
            Enviar Email
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserTable; 