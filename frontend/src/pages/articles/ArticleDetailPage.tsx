// src/components/ArticleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../api/auth';
import { RelatedArticles } from '../../components/RelatedArticles';
import { useAllArticles } from '../../hooks/useAllArticles';
import { Article } from '../../types/articles';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/ArticleDetailPage.css';


type RouteParams = {
  slug: string;
};

type Comment = {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export default function ArticleDetail() {
  const { slug } = useParams<RouteParams>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = !!getAuthToken();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { articles: allArticles = [], loading: loadingAllArticles } = useAllArticles(); // ✅ Fix: fallback []
  
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  useEffect(() => {
    if (!slug) return;

    fetch(`${API_URL}/articles/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erreur HTTP');
        return res.json();
      })
      .then((data: Article) => setArticle(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoadingArticle(false));

    fetch(`${API_URL}/articles/${slug}/comments`)
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data: Comment[]) => setComments(data))
      .catch(() => {});
  }, [slug, API_URL]);

  if (loadingArticle) return <p>Loading...</p>;
  if (error) return <p>Error : {error}</p>;
  if (!article) return <p>Can't find this article</p>;

  async function handleDelete() {
    if (!slug) return;

    const confirmDelete = window.confirm('Do you really want to delete this article ?');
    if (!confirmDelete) return;

    try {
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/articles/${slug}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok && res.status !== 204) {
        throw new Error('Erreur HTTP');
      }

      navigate('/articles');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;

    setSubmitting(true);
    setCommentError(null);

    try {
      const res = await fetch(`${API_URL}/articles/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: commentAuthor,
          content: commentBody,
        }),
      });

      if (!res.ok) throw new Error('Error posting comment');

      const created: Comment = await res.json();
      setComments((prev) => [created, ...prev]);
      setCommentAuthor('');
      setCommentBody('');
    } catch (err: any) {
      setCommentError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReplyTo(author: string) {
    setCommentBody((prev) =>
      prev
        ? `${prev}\n@${author} `
        : `@${author} `
    );
  }

  return (
    <div className="article-detail-page">
      {/* Bouton retour rapide hors du cadre pour plus de clarté */}
      <div style={{ maxWidth: '900px', width: '100%', marginBottom: '1rem' }}>
        <Link to="/articles" className="btn btn-secondary" style={{ border: 'none', background: 'transparent' }}>
          ← Retour aux articles
        </Link>
      </div>

      <div className="article-detail-container">
        {/* IMAGE DE COUVERTURE : Limitée en hauteur par le CSS */}
        {article.imageUrl && (
          <div className="article-detail-image">
            <img
              src={`${API_URL}${article.imageUrl}`}
              alt={article.title}
            />
          </div>
        )}

        {/* CONTENU : Padding interne pour décoller le texte des bords */}
        <div className="article-content-wrapper">
          <h1 className="article-detail-title">{article.title}</h1>
          
          <div className="article-body">
            <MarkdownPreview content={article.content || ''} />
          </div>

          {/* SECTION COMMENTAIRES */}
          <section className="comments">
            <h3>Commentaires ({comments.length})</h3>
            
            <form className="comment-form" onSubmit={handleSubmitComment}>
              {commentError && <p className="form-error">{commentError}</p>}
              
              <div className="form-field">
                <label htmlFor="comment-name">Votre nom</label>
                <input
                  id="comment-name"
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Ex: John Doe"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="comment-body">Votre message</label>
                <textarea
                  id="comment-body"
                  rows={4}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Écrivez votre commentaire ici..."
                  required
                />
              </div>

              <div className="comment-actions-row">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Envoi...' : 'Publier le commentaire'}
                </button>
              </div>
            </form>

            {/* LISTE DES COMMENTAIRES */}
            <ul className="comment-list" style={{ listStyle: 'none', padding: 0 }}>
              {comments.map((c) => (
                <li key={c._id} className="comment-item" style={{ 
                  padding: '1.5rem', 
                  background: '#f8fafc', 
                  borderRadius: '12px', 
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0' 
                }}>
                  <div className="comment-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#1e293b' }}>{c.authorName}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>{c.content}</p>
                  <button
                    type="button"
                    className="comment-reply-btn"
                    onClick={() => handleReplyTo(c.authorName)}
                    style={{ background: 'none', border: 'none', color: '#7aa1e0', cursor: 'pointer', marginTop: '0.5rem', fontWeight: 'bold' }}
                  >
                    Répondre
                  </button>
                </li>
              ))}
              {comments.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  Aucun commentaire pour le moment. Soyez le premier à réagir !
                </p>
              )}
            </ul>
          </section>

          {/* ARTICLES LIÉS (Composant externe) */}
          {!loadingAllArticles && article && allArticles.length > 0 && (
            <div style={{ marginTop: '4rem' }}>
              <RelatedArticles 
                currentArticle={article} 
                allArticles={allArticles} 
              />
            </div>
          )}

          {/* ACTIONS D'ADMINISTRATION */}
          {isAdmin && (
            <div className="article-admin-actions">
              <Link to={`/articles/${article.slug}/edit`} className="btn btn-primary">
                Modifier l'article
              </Link>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
                style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }}
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )};