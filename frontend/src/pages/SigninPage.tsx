import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Signup.css';

export default function SigninPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/articles');
    } catch (err: any) {
      // Affiche l'erreur du backend (ex: "Veuillez confirmer votre email")
      setError(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Bon retour !</h1>
          <p>Connectez-vous pour participer à la communauté.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-banner">⚠️ {error}</div>}

          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: devops@notes.com"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label htmlFor="password">Mot de passe</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#4299e1' }}>
                Oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
            />
          </div>

          <button aria-label="Se connecter" type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <footer className="auth-footer">
          Pas encore de compte ? <Link aria-label="Créer un compte" to="/signup">Créer un compte</Link>
        </footer>
      </div>
    </div>
  );
}