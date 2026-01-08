import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CookieBanner from './CookieBanner';
import devopsLogo from '../styles/logo_devopsnotes.webp';
import devopsFav from '../styles/icone_devopsnotes.webp';
import '../styles/PageLayout.css';

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  // Initialisation du thème au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="layout-wrapper">
      <CookieBanner />
      {/* 1. Petit Logo Flottant (Fixed) */}
      <Link to="/homepage" className="floating-home-btn">
        <img src={devopsFav} 
             alt="Home" 
             fetchpriority="high" />
      </Link>

      {/* 2. Barre de Navigation Supérieure */}
      <div className="top-nav-bar">
        <div className="user-status">
          {user ? (
            <>
              <span className="user-greeting">
                Hello, <strong>{user.pseudo ?? user.email}</strong>
              </span>
              <Link to="/profile" className="btn btn-sm btn-secondary">Profile</Link>
              <button arial-label='se déconnecter' onClick={logout} className="btn btn-sm btn-secondary">Log Out</button>
            </>
          ) : (
            <>
              <span className="user-greeting">Visitor mode</span>
              <Link to="/login" className="btn btn-sm btn-primary">Sign In</Link>
            </>
          )}
          
          {/* Séparateur visuel */}
          <div style={{ width: '1px', height: '20px', background: 'var(--toolbar-separator)', margin: '0 8px' }} />
          
          {/* Bouton Toggle Theme intégré dans la barre utilisateur */}
          <button
            aria-label='Changer le thème'
            onClick={toggleTheme} 
            className="btn-theme-toggle"
            style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* 3. Conteneur Principal Centré */}
      <div className="main-container">
        {/* En-tête avec le gros logo */}
        <header className="main-header">
          <img src={devopsLogo} 
               alt="DevOpsNotes Logo" 
               className="header-logo-img"
               fetchpriority="high" />
        </header>

        {/* Zone de contenu dynamique */}
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}