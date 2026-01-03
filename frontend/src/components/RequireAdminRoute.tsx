import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

// On utilise React.ReactElement au lieu de JSX.Element pour éviter l'erreur de namespace
export const RequireAdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Redirige vers la home si connecté mais pas admin
    return <Navigate to="/homepage" replace />;
  }

  return children;
};