import { FormEvent, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Correction : Import du contexte
import { updateThread, getThread } from '../api/forum';
import '../styles/ThreadNewPage.css';

export default function ThreadEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Utilisation du contexte global
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Sécurité : redirection si non connecté ou si ce n'est pas l'auteur (optionnel ici, géré par le backend)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    
    getThread(id)
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        setTags(data.tags?.join(', ') || '');
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    
    setError(null);
    setUpdating(true);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      // Correction : On ne passe plus le token manuellement, Axios utilise les cookies
      await updateThread(id, { title, content, tags: tagsArray });
      navigate(`/forum/${id}`); 
    } catch (err: any) {
      setError(err.message || 'Impossible de modifier le sujet');
    } finally {
      setUpdating(false);
    }
  }

  if (loading || authLoading) return <div className="new-thread-container">Chargement...</div>;

  return (
    <div className="new-thread-container">
      <div className="form-header">
        <Link to={`/forum/${id}`} className="back-link">← Annuler</Link>
        <h1>Modifier le sujet</h1>
      </div>

      <form className="new-thread-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="form-group">
          <label htmlFor="title">Titre du sujet</label>
          <input
            id="title"
            type="text"
            className="title-input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Description</label>
          <div className="editor-wrapper">
            <textarea
              id="content"
              ref={textAreaRef}
              value={content}
              rows={12}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (séparés par des virgules)</label>
          <input
            id="tags"
            type="text"
            className="tags-input-field"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="devops, kubernetes..."
          />
        </div>

        <div className="form-actions">
          <button 
            aria-label={updating ? 'Mise à jour en cours...' : 'Sauvegarder les modifications'}
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={updating}
          >
            {updating ? 'Mise à jour...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}