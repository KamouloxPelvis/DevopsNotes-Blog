import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Vérification en cours...');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email?token=${token}`)
        .then(res => res.json())
        .then(data => {
          setStatus(data.message);
          setTimeout(() => navigate('/login'), 3000); // Redirection après 3s
        })
        .catch(() => setStatus('Erreur lors de la validation.'));
    }
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{status}</h2>
    </div>
  );
}