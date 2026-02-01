import { FormEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TiptapEditor from './Editor';
import '../styles/ThreadModPage.css';

interface ThreadFormProps {
  initialData?: { title: string; content: string; tags: string[] };
  onSubmit: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  isEdit?: boolean;
  id?: string;
}

export default function ThreadForm({ initialData, onSubmit, isEdit, id }: ThreadFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const commonEmojis = ['😊', '😂', '🚀', '🔥', '💻', '👍', '🙌', '🤔', '✅', '❌'];

  // Synchro si les données arrivent après coup (mode edit)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setTags(initialData.tags?.join(', ') || '');
    }
  }, [initialData]);

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.replace(/<[^>]*>/g, '').trim()) {
      setError("Le titre et le contenu sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onSubmit({ title, content, tags: tagsArray });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'opération');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="new-thread-container">
      <div className="form-header">
        <Link to={isEdit ? `/forum/${id}` : "/forum"} className="back-link">← Annuler</Link>
        <h1>{isEdit ? 'Modifier le sujet' : 'Démarrer une discussion'}</h1>
        {!isEdit && <p>Utilisez la barre d'outils pour formater votre code ou vos logs.</p>}
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
            placeholder="Ex: Erreur 403 sur S3 avec Terraform..."
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <div className="editor-wrapper forum-rich-editor">
            <TiptapEditor value={content} onChange={setContent} />
            <div className="forum-emoji-container">
              <button type="button" className="action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
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
          <label htmlFor="tags">Tags (virgules)</label>
          <input
            id="tags"
            type="text"
            className="tags-input-field"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="kubernetes, aws..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Traitement...' : (isEdit ? 'Sauvegarder' : 'Publier le sujet')}
          </button>
        </div>
      </form>
    </div>
  );
}