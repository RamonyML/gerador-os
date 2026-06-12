import { FC } from 'react';
import { User } from './index';

export interface UserTableProps {
  onEditUser: (user: User) => void;
}

export interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

export interface UserManagementPageProps {} 