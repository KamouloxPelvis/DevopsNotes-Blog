import { FormEvent, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createThread } from '../../api/forum';
import '../../styles/NewThreadPage.css';

export default function NewThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Le titre et le contenu sont obligatoires.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
        
      await createThread({ title, content, tags: tagsArray });
      navigate('/forum');
    } catch (err: any) {
      setError(err.message || 'Impossible de créer le sujet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="new-thread-container">
      <div className="form-header">
        <Link to="/forum" className="back-link">← Annuler</Link>
        <h1>Démarrer une discussion</h1>
        <p>Partagez vos problématiques DevOps avec la communauté.</p>
      </div>

      <form className="new-thread-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="form-group">
          <label htmlFor="title">Titre du sujet</label>
          <input
            id="title"
            type="text"
            placeholder="Ex: Erreur 403 sur S3 avec Terraform et OIDC"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="title-input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Description du problème</label>
          <div className="editor-wrapper">
            <textarea
              id="content"
              ref={textAreaRef}
              placeholder="Décris ton contexte, ta stack, tes logs ou ton code..."
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
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="kubernetes, aws, cicd"
            className="tags-input-field"
          />
        </div>

        <div className="form-actions">
          <button aria-label='Création en cours...' type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Création en cours...' : 'Publier le sujet'}
          </button>
        </div>
      </form>
    </div>
  );
}