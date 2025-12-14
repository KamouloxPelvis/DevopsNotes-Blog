// src/components/NewArticle.tsx
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewArticle() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: body }),
      });
      if (!res.ok) throw new Error('Erreur HTTP');
      const created = await res.json();
      navigate(`/articles/${created.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p>Erreur : {error}</p>}

      <div>
        <label>Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label>Contenu</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <button type="submit">Créer</button>
    </form>
  );
}

