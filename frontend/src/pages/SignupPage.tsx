import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import '../styles/Signup.css'

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  const PASSWORD_REGEX =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;

  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // validations AVANT l'appel API
    if (pseudo.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      const msg =  'Password must be at least 6 characters with 1 uppercase letter, 1 digit and 1 special character.';
      setError(msg);
      showToast({ type: 'error', message: msg });
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, pseudo }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Signup failed');
      }

      const data = await res.json();
      localStorage.setItem('devopsnotes_token', data.token);
      showToast({
        type: 'success',
        message: 'Your account has been created successfully. Welcome to DevOpsNotes!',
      });
      navigate('/forum');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-card auth-page">
      <div className="auth-card">
        <h1>Create your DevOpsNotes account</h1>
        <p className="auth-subtitle">
          Become a member to create threads and reply on the DevOps forum.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <div className="form-group">
            <label htmlFor="pseudo">Username</label>
            <input
              id="pseudo"
              type="text"
              autoComplete="nickname"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="devops_wizard"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <span className="icon-eye-open" />
                ) : (
                  <span className="icon-eye-closed" />
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="password-field">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <span className="icon-eye-open" />
                ) : (
                  <span className="icon-eye-closed" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/member-login">SignIn</Link>
        </p>
      </div>
    </div>
  );
}
