import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getThread, getReplies, createReply } from '../../api/forum';
import { ForumThread, Reply } from '../../types/forum';
import { getAuthToken, getCurrentUser } from '../../api/auth';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/ThreadDetailPage.css';

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  
  const isAuthenticated = !!getAuthToken();
  const currentUser = getCurrentUser();
  
  const canEditOrDelete = !!thread && !!currentUser &&
    (currentUser.role === 'admin' || 
     (thread.authorId && (thread.authorId as any).toString?.() === currentUser.id));

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const [threadData, repliesData] = await Promise.all([
          getThread(id),
          getReplies(id)
        ]);
        setThread(threadData);
        setReplies(repliesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  async function handleSubmitReply(e: FormEvent) {
    e.preventDefault();
    if (!id || !replyContent.trim()) {
      setReplyError('Vous devez écrire quelque chose pour répondre.');
      return;
    }

    setReplyError(null);
    setReplyLoading(true);
    try {
      const newReply = await createReply(id, replyContent);
      setReplies((prev) => [...prev, newReply]);
      setReplyContent('');
    } catch (err: any) {
      setReplyError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setReplyLoading(false);
    }
  }

  async function handleDeleteThread() {
    if (!id || !window.confirm('Supprimer définitivement ce sujet ?')) return;

    try {
      const res = await fetch(`${API_URL}/forum/threads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      navigate('/forum');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <div className="thread-detail-container loading">Chargement de la discussion...</div>;
  if (error || !thread) return <div className="thread-detail-container error">⚠️ {error || 'Thread introuvable'}</div>;

  return (
    <div className="thread-detail-container">
      <nav className="thread-nav">
        <Link to="/forum" className="back-link">← Retour au Forum</Link>
        {canEditOrDelete && (
          <div className="admin-actions">
            <Link to={`/forum/${thread._id}/edit`} className="btn btn-secondary btn-sm">Modifier</Link>
            <button onClick={handleDeleteThread} className="btn btn-danger btn-sm">Supprimer</button>
          </div>
        )}
      </nav>

      <article className="main-thread-post">
        <header className="thread-header">
          <h1>{thread.title}</h1>
          <div className="thread-meta">
            <span className="author-badge">{thread.authorPseudo?.charAt(0).toUpperCase()}</span>
            <div className="meta-text">
              <strong>{thread.authorPseudo || 'Anonyme'}</strong>
              <span>Posté le {new Date(thread.createdAt).toLocaleString()}</span>
              {thread.editedAt && <span className="edited-tag">(Modifié)</span>}
            </div>
          </div>
        </header>

        <div className="thread-content">
          <MarkdownPreview content={thread.content} />
        </div>

        {thread.tags && (
          <div className="thread-tags">
            {thread.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
          </div>
        )}
      </article>

      <section className="replies-section">
        <div className="replies-header">
          <h2>Réponses ({replies.length})</h2>
        </div>

        <div className="replies-list">
          {replies.length === 0 ? (
            <p className="no-replies">Soyez le premier à répondre à cette discussion !</p>
          ) : (
            replies.map((reply) => (
              <div key={reply._id} className="reply-item">
                <div className="reply-sidebar">
                  <div className="reply-avatar">{reply.authorPseudo?.charAt(0).toUpperCase()}</div>
                </div>
                <div className="reply-body">
                  <div className="reply-meta">
                    <strong>{reply.authorPseudo}</strong>
                    <span>{new Date(reply.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="reply-content">
                    {/* On utilise MarkdownPreview aussi pour les réponses pour supporter le code */}
                    <MarkdownPreview content={reply.content} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isAuthenticated ? (
          <div className="reply-form-wrapper">
            <h3>Ajouter une réponse</h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Partagez votre avis ou demandez une précision..."
                rows={5}
              />
              {replyError && <p className="error-msg">{replyError}</p>}
              <div className="form-footer">
                <p className="hint">Supporte le Markdown (code blocks, gras, etc.)</p>
                <button type="submit" className="btn btn-primary" disabled={replyLoading}>
                  {replyLoading ? 'Envoi...' : 'Répondre'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="login-prompt">
            <p><Link to="/login">Connectez-vous</Link> pour participer à la discussion.</p>
          </div>
        )}
      </section>
    </div>
  );
}