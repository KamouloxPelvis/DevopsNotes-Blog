// src/components/RequireAuthRoute.tsx
import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  children: ReactElement;
};

export function RequireAuthRoute({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // redirige vers /login en gardant la destination souhaitée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
