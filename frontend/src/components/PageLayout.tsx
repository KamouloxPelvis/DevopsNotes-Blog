import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, ChevronDown, Home, BookOpen, MessageSquare, MessageCircle } from 'lucide-react'; // Ajout d'icônes
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

      {/* 1. Menu Déroulant Flottant (Indépendant en fixed) */}
      <div className="floating-menu-container" ref={menuRef}>
        <button 
          className={`floating-menu-trigger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu de navigation"
        >
          <img src={devopsFav} alt="Menu" />
          <ChevronDown size={16} className={`chevron ${menuOpen ? 'rotate' : ''}`} />
        </button>

        {menuOpen && (
          <div className="dropdown-menu shadow-lg">
            <Link to="/homepage" className="dropdown-item" onClick={() => setMenuOpen(false)}>
              <Home size={18} /> <span>Accueil</span>
            </Link>
            <div className="dropdown-divider" />
            <Link to="/articles" className="dropdown-item" onClick={() => setMenuOpen(false)}>
              <BookOpen size={18} /> <span>Articles</span>
            </Link>
            <Link to="/forum" className="dropdown-item" onClick={() => setMenuOpen(false)}>
              <MessageSquare size={18} /> <span>Forum</span>
            </Link>
            <Link to="/chat" className="dropdown-item" onClick={() => setMenuOpen(false)}>
              <MessageCircle size={18} /> <span>Chat</span>
            </Link>
          </div>
        )}
      </div>

      {/* 2. Barre de Navigation Supérieure (Centrée horizontalement) */}
      <div className="top-nav-bar">
        <div className="nav-spacer" /> 
        <div className="user-status">
          {user ? (
            <>
              <span className="user-greeting">
                <span className="welcome-text">Bonjour, </span>
                <strong>{user.pseudo ?? user.email}</strong>
              </span>
              <div className="user-actions">
                <Link to="/profile" className="btn btn-sm btn-secondary">Profil</Link>
                <button onClick={logout} className="btn btn-sm btn-secondary">Se déconnecter</button>
              </div>
            </>
          ) : (
            <>
              <span className="user-greeting">Mode visiteur</span>
              <div className="user-actions">
                <Link to="/login" className="btn btn-sm btn-primary">Connexion</Link>
                <Link to="/signup" className="btn btn-sm btn-outline-primary">S'inscrire</Link>
              </div>
            </>
          )}
          
          <div className="separator" />
          
          <button
            aria-label='Changer le thème'
            onClick={toggleTheme} 
            className="btn-theme-toggle-classic"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* 3. Conteneur Principal (Indépendant de la barre du haut) */}
      <div className="main-container">
        <header className="main-header">
          <img src={devopsLogo} alt="DevOpsNotes Logo" className="header-logo-img" />
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  )
};