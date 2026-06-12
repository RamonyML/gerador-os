import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Lista de emails de gerentes
const GERENTE_EMAILS = [
  'deivitrafael56@outlook.com',  // DEIVIT
  'hiagomznet@gmail.com',        // HIAGO
  'karolayne2pereira@gmail.com',   // KAROLAYNE
  'ramony_sep@live.com'          // RAMONY
];

interface GerenteRouteProps {
  children: React.ReactNode;
}

const GerenteRoute: React.FC<GerenteRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const isGerente = user?.email && GERENTE_EMAILS.includes(user.email);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || !isGerente) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default GerenteRoute; 