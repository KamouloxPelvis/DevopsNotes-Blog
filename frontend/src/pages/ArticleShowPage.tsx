import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext'; 
import { RelatedArticles } from '../components/RelatedArticles';
import { useAllArticles } from '../hooks/useAllArticles';
import { Article } from '../types/articles';
import hljs from 'highlight.js';
import NProgress from 'nprogress';
import 'highlight.js/styles/tokyo-night-dark.css'; 
import '../styles/ArticleShowPage.css';

interface Comment {
  _id: string;
  content: string;
  author: {
    pseudo: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function ArticleShow() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { articles: allArticles = [], loading: loadingAllArticles } = useAllArticles();

  const [article, setArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://resources.devopsnotes.org";

  // 1. Chargement des données avec NProgress et Skeleton
  useEffect(() => {
    if (!slug) return;
    setLoadingArticle(true);
    NProgress.start();

    api.get(`/articles/${slug}`)
      .then((res) => {
        setArticle(res.data);
        setError(null);
        return api.get(`/comments/${slug}`);
      })
      .then((res) => setComments(res.data))
      .catch((err) => {
        const isCommentError = err.config?.url?.includes('/comments');
        if (!isCommentError) setError(err.response?.data?.message || "Article introuvable");
      })
      .finally(() => {
        setLoadingArticle(false);
        NProgress.done();
      });
  }, [slug]);

  // 2. Coloration syntaxique Highlight.js
  useEffect(() => {
    if (article?.content && !loadingArticle) {
      const preBlocks = document.querySelectorAll('.article-body-content pre');
      preBlocks.forEach((pre) => {
        const codeBlock = pre.querySelector('code');
        if (codeBlock) {
          hljs.highlightElement(codeBlock as HTMLElement);
          if (!pre.querySelector('.copy-button')) {
            const button = document.createElement('button');
            button.className = 'copy-button';
            button.innerText = 'Copier';
            button.onclick = () => {
              const text = codeBlock.innerText;
              navigator.clipboard.writeText(text).then(() => {
                button.innerText = 'Copié !';
                button.classList.add('copied');
                setTimeout(() => {
                  button.innerText = 'Copier';
                  button.classList.remove('copied');
                }, 2000);
              });
            };
            pre.appendChild(button);
          }
        }
      });
    }
  }, [article?.content, loadingArticle]);

  // 3. Incrémenter les vues
  useEffect(() => {
    if (article && !loadingArticle) {
      api.post(`/articles/${article.slug}/view`)
        .catch((err) => console.error("Erreur increment vues:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?._id, loadingArticle]);

  async function handleDelete() {
    if (!slug || !window.confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${slug}`);
      navigate('/articles');
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !slug) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/comments', { articleSlug: slug, content: commentBody });
      setComments((prev) => [res.data, ...prev]);
      setCommentBody('');
    } catch (err: any) {
      alert("Erreur lors de l'envoi du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert("Impossible de supprimer le commentaire");
    }
  }

  if (error) return <div className="error-msg">⚠️ {error}</div>;

  const fullImageUrl = article?.imageUrl 
      ? (article.imageUrl.startsWith('http') 
          ? article.imageUrl 
          : `${R2_PUBLIC_URL}${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`)
      : null;

  return (
    <div className="article-detail-page page-transition fade-in-page">
      <Helmet>
        <title>{loadingArticle ? 'Chargement...' : `${article?.title} | DevOpsNotes`}</title>
        <link rel="canonical" href={`https://blog.devopsnotes.org/articles/${article?.slug}`} />
        <meta name="description" content={article?.excerpt || "Chargement de l'article..."} />
      </Helmet>

      <header className="detail-nav">
        <Link to="/articles" className="btn btn-secondary btn-sm">← Retour aux articles</Link>
        {isAdmin && article && !loadingArticle && (
          <div className="admin-quick-actions">
            <Link to={`/articles/${article.slug}/edit`} className="btn btn-primary btn-sm">Modifier</Link>
            <button aria-label="Supprimer l'article" onClick={handleDelete} className="btn btn-danger btn-sm">Supprimer</button>
          </div>
        )}
      </header>

      <article className="article-detail-container">
        {loadingArticle ? (
          /* ===== SQUELETTE DE CHARGEMENT ===== */
          <div className="article-skeleton">
            <div className="skeleton-loader hero-skeleton"></div>
            <div className="skeleton-content-padding">
              <div className="skeleton-loader title-skeleton"></div>
              <div className="skeleton-loader tag-skeleton"></div>
              <div className="skeleton-loader text-line"></div>
              <div className="skeleton-loader text-line"></div>
              <div className="skeleton-loader text-line" style={{ width: '60%' }}></div>
            </div>
          </div>
        ) : article ? (
          /* ===== CONTENU RÉEL DE L'ARTICLE ===== */
          <>
            {fullImageUrl && (
              <div className="article-hero-image">
              <>
                <img src={fullImageUrl} alt={article.title} />
                <span className="ai-badge-hero">Illustration générée par IA</span>
              </>
              </div>
            )}

            <div className="article-header-meta">
              <h1 className="article-detail-title">{article.title}</h1>
              <div className="article-tags">
                {article.tags?.map(tag => <span key={tag} className="tag-pill">#{tag}</span>)}
              </div>
            </div>

            <div 
              className="article-body-content"
              dangerouslySetInnerHTML={{ __html: article.content || '' }} 
            />

            <hr className="section-divider" />

            <section className="comments-section">
              <h3 className="section-title">Discussion ({comments.length})</h3>
              
              {user ? (
                <form onSubmit={handlePostComment} className="comment-box">
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Un avis ? Une question technique ?"
                    required
                  />
                  <div className="comment-actions">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Envoi...' : 'Publier le commentaire'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="login-prompt">
                  <Link to="/login">Connectez-vous</Link> pour participer à la discussion.
                </div>
              )}

              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c._id} className="comment-card">
                    <div className="comment-header">
                      <span className="comment-author">{c.author?.pseudo || "Anonymous"}</span>
                      <div className="comment-meta-right">
                        <span className="comment-date">
                          {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {(isAdmin || (user && (c.author as any)?._id === user.id)) && (
                          <button onClick={() => handleDeleteComment(c._id)} className="btn-delete-comment">
                            <span role="img" aria-label="Supprimer">🗑️</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                ))}
              </div>
            </section>

            {!loadingAllArticles && allArticles.length > 0 && (
              <div className="related-articles-footer">
                <RelatedArticles currentArticle={article} allArticles={allArticles} />
              </div>
            )}
          </>
        ) : (
          <div className="error-msg" style={{ padding: '2rem' }}>Article introuvable.</div>
        )}
      </article>
    </div>
  );
}