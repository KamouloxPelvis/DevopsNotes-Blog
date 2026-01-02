import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css'; // Nouveau fichier CSS

interface UserPayload {
  id: string;
  role: string;
  email: string;
  pseudo: string;
  avatarUrl?: string; // Optionnel car peut être vide
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cast de l'utilisateur
  const currentUser = user as unknown as UserPayload;
  const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="auth-card">
          <p>Veuillez vous connecter pour voir votre profil.</p>
          <button onClick={() => navigate('/login')} className="btn-profile-primary">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return { label: 'Administrateur', class: 'role-admin' };
      case 'moderator': return { label: 'Modérateur', class: 'role-mod' };
      default: return { label: 'Membre', class: 'role-member' };
    }
  };

  const roleInfo = getRoleStyle(currentUser.role || 'member');

  return (
    <div className="profile-container">
      <div className="profile-card">
        <header className="profile-header">
          <h1>Mon Profil</h1>
        </header>

        <div className="profile-content">
          <div className="avatar-wrapper">
            <img 
              src={currentUser.avatarUrl ? `${API_BASE_URL}${currentUser.avatarUrl}` : 'https://via.placeholder.com/150'} 
              alt={`Avatar de ${currentUser.pseudo}`} 
              className={`profile-avatar ${roleInfo.class}`}
            />
            <span className={`role-badge ${roleInfo.class}`}>
              {roleInfo.label}
            </span>
          </div>

          <h2 className="profile-pseudo">{currentUser.pseudo}</h2>
          <p className="profile-email">{currentUser.email}</p>
        </div>

        <div className="profile-actions">
          <button onClick={() => navigate('/articles')} className="btn-profile-secondary">
            Retour aux articles
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-profile-danger">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}