// PageLayout.tsx
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/PageLayout.css';
import '../styles/Toast.css'

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  const { user, logout } = useAuth();  // <-- récupère user + logout depuis le contexte

  return (
    <div className="page-layout">
      <header className="top-user-bar">
        <div className="top-user-bar-inner">
          <div className="top-user-bar-left">
            {user ? (
              <span>
                You are connected as <strong>{user.pseudo ?? user.email}</strong>
              </span>
            ) : (
              <span>You are browsing as visitor</span>
            )}
          </div>

          <div className="top-user-bar-right">
            {user ? (
              <>
                <Link to="/profile" className="btn btn-secondary btn-sm">
                  Profile
                </Link>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
