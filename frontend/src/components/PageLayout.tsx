// components/PageLayout.tsx
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import devopsLogo from '../devopsnotes_logo.png'; // Vérifie le chemin !
import devopsFav from '../devopsnotes_ico.jpg';   // Vérifie le chemin !
import '../styles/PageLayout.css'; 

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  const { user, logout } = useAuth();

  return (
    <div className="layout-wrapper">
      {/* 1. Petit Logo Flottant (Fixed) */}
      <Link to="/homepage" className="floating-home-btn">
        <img src={devopsFav} alt="Home" />
      </Link>

      {/* 2. Barre Utilisateur (Top Right) */}
      <div className="top-nav-bar">
        <div className="user-status">
            {user ? (
              <>
                <span className="user-greeting">Hello, <strong>{user.pseudo ?? user.email}</strong></span>
                <Link to="/profile" className="btn btn-sm btn-secondary">Profile</Link>
                <button onClick={logout} className="btn btn-sm btn-secondary">Log Out</button>
              </>
            ) : (
              <>
                 <span className="user-greeting">Visitor mode</span>
                 <Link to="/login" className="btn btn-sm btn-primary">Sign In</Link>
              </>
            )}
        </div>
      </div>

      {/* 3. Conteneur Principal Centré */}
      <div className="main-container">
        {/* En-tête avec le gros logo */}
        <header className="main-header">
           <img src={devopsLogo} alt="DevOpsNotes Logo" className="header-logo-img" />
        </header>

        {/* C'est ici que les pages (Articles, Forum...) s'affichent */}
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}