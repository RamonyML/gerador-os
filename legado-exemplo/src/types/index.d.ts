export type UserRole = 'operador' | 'supervisor' | 'gerente';

export interface User {
  uid: string;
  email: string;
  nome: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  nome: string;
  role: UserRole;
}

export interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: User;
} 