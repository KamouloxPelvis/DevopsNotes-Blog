import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios'; // Importe ton instance Axios configurée
import { disconnectChatSocket } from '../api/chatSocket';

type UserPayload = {
  id: string;
  role: string;
  email: string;
  pseudo: string;
};

type AuthContextType = {
  user: UserPayload | null;
  loading: boolean; // Ajout d'un état de chargement pour éviter les sauts d'UI
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier la session au démarrage
  useEffect(() => {
  const checkAuth = async () => {
    try {
      // On tente l'appel
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err: any) {
      // ÉTAPE CLÉ : On vérifie si c'est une 401 (non connecté)
      // Si c'est le cas, on ne logge RIEN dans la console.
      if (err.response?.status !== 401) {
        // On ne logge que les vraies erreurs (ex: 500 serveur HS)
        console.error("Erreur d'authentification inattendue", err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  checkAuth();
}, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // Informe le backend pour supprimer le cookie
    } catch (err) {
      console.error("Erreur logout backend", err);
    } finally {
      disconnectChatSocket();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}