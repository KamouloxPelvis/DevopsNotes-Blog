// PageLayout.tsx
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import '../components/PageLayout.css'

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  const user = getCurrentUser();

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

          {user && (
            <div className="top-user-bar-right">
              <Link to="/profile" className="btn btn-secondary btn-sm">
                Profile
              </Link>
            </div>
          )}
        </div>
      </header>

      {children}
    </div>
  );
}
