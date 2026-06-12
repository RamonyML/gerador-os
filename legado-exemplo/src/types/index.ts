import { Timestamp } from 'firebase/firestore';

export type UserRole = 'operador' | 'supervisor' | 'gerente';

// Lista de emails de gerentes
export const GERENTE_EMAILS: string[] = [
  'deivitrafael56@outlook.com',  // DEIVIT
  'hiagomznet@gmail.com',        // HIAGO
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony_sep@live.com',         // RAMONY
  'ramony.mznet@gmail.com'       // RAMON
];

// Lista de emails de supervisores
export const SUPERVISOR_EMAILS: string[] = [
  'reh.saraiva@gmail.com'        // RENATA
];

export enum MeioContato {
  PRESENCIAL = 'presencial',
  LIGACAO = 'ligacao',
  WHATSAPP = 'whatsapp'
}

export enum TipoAssinatura {
  DIGITAL = 'digital',
  FISICA = 'fisica'
}

export enum TipoUpgrade {
  ATIVO = 'ativo',
  RECEPTIVO = 'receptivo'
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
  newPassword?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  nome: string;
  role: UserRole;
}

export interface UserFormProps {
  user?: User;
  onClose: () => void;
  onResetPassword?: (user: User) => void;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  phoneNumber?: string | null;
  isAnonymous: boolean;
  tenantId?: string | null;
  providerData: any[];
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface UserData {
  nome: string;
  role: UserRole;
}

export interface OperadorData {
  nome: string;
  role: UserRole;
  ativo: boolean;
}

export interface DashboardData {
  totalUpgrades: number;
  upgradesPorOperador: Record<string, number>;
  upgradesPorMeioContato: Record<string, number>;
  upgradesPorTipo: Record<string, number>;
  upgradesPorAssinatura: Record<string, number>;
}

export interface Upgrade {
  id: string;
  data: Timestamp;
  cliente: string;
  meioContato: MeioContato;
  numeroContato: string;
  assinatura?: TipoAssinatura;
  tipoUpgrade: TipoUpgrade;
  observacao?: string;
  operadorId: string;
  operadorNome: string;
  criadoEm: Timestamp;
  createdBy?: string;
  ultimaAtualizacao: Timestamp;
  updatedBy?: string;
  duplicado?: boolean;
  isRoku?: boolean;
}

export interface Log {
  id: string;
  timestamp: Timestamp;
  userEmail: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  targetCollection?: string;
  targetId?: string;
  details?: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export interface FormData {
  email: string;
  name: string;
  role: UserRole;
  ativo: boolean;
}

export interface FirestoreOperador extends OperadorData {
  uid: string;
  email: string;
}

export interface UserTableComponentProps {
  onEditUser: (user: User) => void;
}

export interface UserFormComponentProps {
  user?: User | null;
  onClose: () => void;
}

// Tipos para Questionários e Feedbacks Internos
export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[]; // Para radio, checkbox, select
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdBy: string; // email do gerente
  createdAt: string;
  published: boolean;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  userId: string;
  userName: string;
  userEmail: string;
  answers: Record<string, any>; // questionId -> resposta
  submittedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: 'questionnaire' | 'info' | 'alert';
  createdAt: string;
  questionnaireId?: string; // Se for aviso de questionário
  readBy: string[]; // lista de emails que já leram
} 