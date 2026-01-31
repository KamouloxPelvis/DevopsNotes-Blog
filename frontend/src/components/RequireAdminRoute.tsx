import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { useToast } from '../context/ToastContext';

// On utilise React.ReactElement au lieu de JSX.Element pour éviter l'erreur de namespace
export const RequireAdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    showToast("Accès refusé : vous n'avez pas les droits administrateur.", "error");

    return <Navigate to="/homepage" replace />;
  }

  return children;
};