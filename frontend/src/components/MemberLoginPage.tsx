import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthToken } from '../api/auth';

const API_URL = 'http://localhost:5000';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('devopsnotes_token', data.token);
      navigate('/forum');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-card">
      <h1>Member login</h1>
      <p className="page-subtitle">
        Sign in to post threads and replies on the DevOps forum.
      </p>

      <form className="form-vertical" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="form-footer">
          No account yet? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </div>
  );
}
