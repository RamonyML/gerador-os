import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Lista de emails de gerentes
const GERENTE_EMAILS = [
  'ramony_sep@live.com',           // RAMONY
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony.mznet@gmail.com'         // RAMON
];

interface SupervisorRouteProps {
  children: React.ReactNode;
}

const SupervisorRoute: React.FC<SupervisorRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const isGerente = user?.email && GERENTE_EMAILS.includes(user.email);
  const isSupervisor = user?.role === 'supervisor';
  const canAccess = isGerente || isSupervisor;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || !canAccess) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default SupervisorRoute; 