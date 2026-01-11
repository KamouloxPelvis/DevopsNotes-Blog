import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createThread } from '../api/forum';
import TiptapEditor from '../components/Editor'; // Import de l'éditeur riche
import '../styles/ThreadNewPage.css';

export default function ThreadNewPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Stockera le HTML de Tiptap
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // On vérifie que le contenu n'est pas vide (Tiptap peut envoyer <p></p>)
    if (!title.trim() || !content.replace(/<[^>]*>/g, '').trim()) {
      setError("Le titre et le contenu sont obligatoires.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
        
      await createThread({ title, content, tags: tagsArray });
      navigate('/forum');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Impossible de créer le sujet';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commonEmojis = ['😊', '😂', '🚀', '🔥', '💻', '👍', '🙌', '🤔', '✅', '❌'];

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji); // Tiptap gère bien l'ajout de texte brut à la suite du HTML
    setShowEmojiPicker(false);
  };

  return (
    <div className="new-thread-container">
      <div className="form-header">
        <Link to="/forum" className="back-link">← Annuler</Link>
        <h1>Démarrer une discussion</h1>
        <p>Utilisez la barre d'outils pour formater votre code ou vos logs.</p>
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
          <label>Description du problème</label>
          <div className="editor-wrapper forum-rich-editor">
            <TiptapEditor value={content} onChange={setContent} />
            <div className="forum-emoji-container">
            <button 
              type="button" 
              className="action-btn" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ padding: '10px', fontSize: '1.2rem' }}
            >
              😊
            </button>

            {showEmojiPicker && (
              <div className="forum-emoji-picker">
                {commonEmojis.map(emoji => (
                  <span key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</span>
                ))}
              </div>
            )}
          </div>
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
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Création en cours...' : 'Publier le sujet'}
          </button>
        </div>
      </form>
    </div>
  );
}