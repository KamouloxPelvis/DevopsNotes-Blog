import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Signup.css';

export default function SignupPage() {

  const [formData, setFormData] = useState({
    pseudo: '',
    email: '',
    password: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = new FormData();
    data.append('pseudo', formData.pseudo);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (avatar) data.append('avatar', avatar);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setMessage({ type: 'success', text: result.message });
      // On ne redirige pas tout de suite car l'utilisateur doit voir le message du mail
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Rejoignez l'aventure</h1>
          <p>Créez votre profil pour contribuer au portfolio.</p>
        </header>

        {message && (
          <div className={`auth-error-banner ${message.type === 'success' ? 'success-banner' : ''}`}
               style={message.type === 'success' ? {backgroundColor: '#f0fff4', color: '#2f855a', borderColor: '#c6f6d5'} : {}}>
            {message.type === 'success' ? '✅ ' : '⚠️ '} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Avatar (Optionnel)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setAvatar(e.target.files ? e.target.files[0] : null)} 
            />
          </div>

          <div className="form-group">
            <label>Pseudo</label>
            <input
              type="text"
              required
              value={formData.pseudo}
              onChange={(e) => setFormData({...formData, pseudo: e.target.value})}
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="6+ caractères, 1 majuscule..."
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </form>

        <footer className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </footer>
      </div>
    </div>
  );
}