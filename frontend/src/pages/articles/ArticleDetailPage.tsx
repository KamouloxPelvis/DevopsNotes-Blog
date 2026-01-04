import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext'; 
import { RelatedArticles } from '../../components/RelatedArticles';
import { useAllArticles } from '../../hooks/useAllArticles';
import { Article } from '../../types/articles';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/ArticleDetailPage.css';

// Interface pour les commentaires (typée pour ton Backend)
interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la gestion des commentaires
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const API_ROOT = 'http://localhost:5000';
  const navigate = useNavigate();
  const { articles: allArticles = [], loading: loadingAllArticles } = useAllArticles();

  useEffect(() => {
    if (!slug) return;
    setLoadingArticle(true);

    // 1. On charge d'abord l'article (Indispensable)
    api.get(`/articles/${slug}`)
      .then((res) => {
        setArticle(res.data);
        setError(null);

        // 2. Une fois l'article chargé, on tente de charger les commentaires (Optionnel)
        return api.get(`/comments/${slug}`);
      })
      .then((res) => {
        setComments(res.data);
      })
      .catch((err) => {
        // On différencie l'erreur selon la ressource
        const isCommentError = err.config?.url?.includes('/comments');
        
        if (isCommentError) {
          console.warn("Section commentaires indisponible (404)");
          // On ne met pas d'erreur globale, l'article restera visible
        } else {
          setError(err.response?.data?.message || "Article introuvable");
        }
      })
      .finally(() => setLoadingArticle(false));
  }, [slug]);

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !slug) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/comments', {
        articleSlug: slug,
        content: commentBody
      });
      // Mise à jour optimiste de la liste
      setComments((prev) => [res.data, ...prev]);
      setCommentBody('');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!slug || !window.confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${slug}`);
      navigate('/articles');
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  }

  if (loadingArticle) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error-msg">⚠️ {error}</div>;
  if (!article) return <p>Article introuvable.</p>;

  const fullImageUrl = article.imageUrl 
    ? (article.imageUrl.startsWith('http') 
        ? article.imageUrl 
        : `${API_ROOT}${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`)
    : null;

  return (
    <div className="article-detail-page">
      <div className="back-nav">
        <Link to="/articles" className="btn btn-secondary">← Retour aux articles</Link>
      </div>

      <div className="article-detail-container">
        {fullImageUrl && (
          <div className="article-detail-image">
            <img src={fullImageUrl} alt={article.title} />
          </div>
        )}

        <div className="article-content-wrapper">
          <h1 className="article-detail-title">{article.title}</h1>
          <div className="article-body">
            <MarkdownPreview content={article.content || ''} />
          </div>

          <hr className="section-divider" />

          {/* SECTION COMMENTAIRES */}
          <section className="comments-area">
            <h3>Discussion ({comments.length})</h3>
            
            {user ? (
              <form onSubmit={handlePostComment} className="comment-form">
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Partagez votre avis..."
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : 'Publier'}
                </button>
              </form>
            ) : (
              <p className="auth-notice">
                <Link to="/login">Connectez-vous</Link> pour commenter.
              </p>
            )}

            <div className="comments-list">
              {comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{c.author?.username}</span>
                    <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="comment-text">{c.content}</p>
                </div>
              ))}
            </div>
          </section>

          {!loadingAllArticles && allArticles.length > 0 && (
            <div className="related-section">
              <RelatedArticles currentArticle={article} allArticles={allArticles} />
            </div>
          )}

          {isAdmin && (
            <div className="article-admin-actions">
              <Link to={`/articles/${article.slug}/edit`} className="btn btn-primary">Modifier</Link>
              <button onClick={handleDelete} className="btn btn-danger">Supprimer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}