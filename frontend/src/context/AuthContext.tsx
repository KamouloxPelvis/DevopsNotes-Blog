// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
} from '../api/auth';

type JwtPayload = {
  id?: string;
  role?: string;
  email?: string;
  pseudo?: string;
  exp?: number;
};

type AuthContextType = {
  user: JwtPayload | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<JwtPayload | null>(null);

  // Initialisation : lire le token au chargement de l’app
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Login centralisé : appelle l’API + met à jour le state global
  const login = async (email: string, password: string) => {
    await apiLogin(email, password);   // enregistre le token dans localStorage
    setUser(getCurrentUser());         // relit et stocke le user décodé
  };

  // Logout centralisé
  const logout = () => {
    apiLogout();       // supprime devopsnotes_token
    setUser(null);     // met à jour immédiatement l’UI
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}