import { useEffect, useState, useCallback } from 'react';
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

export default function ArticleShowPage() {
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
  const R2_PUBLIC_URL = process.env.REACT_APP_R2_PUBLIC_URL ?? "https://resources.devopsnotes.org";

  // Gestion des images R2
  const getFullImageUrl = useCallback((path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${R2_PUBLIC_URL}${cleanPath}`;
  }, [R2_PUBLIC_URL]);

  // 1. Fetching Data
  useEffect(() => {
    if (!slug) return;
    setLoadingArticle(true);
    NProgress.start();

    const loadData = async () => {
      try {
        const articleRes = await api.get(`/articles/${slug}`);
        setArticle(articleRes.data);
        setError(null);
        
        const commentRes = await api.get(`/comments/${slug}`);
        setComments(commentRes.data);
      } catch (err: any) {
        if (!err.config?.url?.includes('/comments')) {
          setError(err.response?.data?.message || "Article introuvable");
        }
      } finally {
        setLoadingArticle(false);
        NProgress.done();
      }
    };

    loadData();
  }, [slug]);

  // 2. Highlighting & Copy Button logic
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
              navigator.clipboard.writeText(codeBlock.innerText).then(() => {
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

  // 3. Increment views
  useEffect(() => {
    if (article?.slug && !loadingArticle) {
      api.post(`/articles/${article.slug}/view`).catch(() => {});
    }
  }, [article?.slug, loadingArticle]);

  const handleDelete = async () => {
    if (!slug || !window.confirm('Supprimer cet article ?')) return;
    try {
      await api.delete(`/articles/${slug}`);
      navigate('/articles');
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !slug) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/comments', { articleSlug: slug, content: commentBody });
      setComments((prev) => [res.data, ...prev]);
      setCommentBody('');
    } catch (err) {
      alert("Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="error-container">⚠️ {error}</div>;

  return (
    <div className="article-detail-page page-transition fade-in-page">
      <Helmet>
        <title>{loadingArticle ? 'Chargement...' : `${article?.title} | DevOpsNotes`}</title>
        <meta name="description" content={article?.excerpt || "Article technique DevOps"} />
      </Helmet>

      <header className="detail-nav">
        <Link to="/articles" className="btn btn-secondary btn-sm">← Retour</Link>
        {isAdmin && article && !loadingArticle && (
          <div className="admin-quick-actions">
            <Link to={`/articles/${article.slug}/edit`} className="btn btn-primary btn-sm">Modifier</Link>
            <button onClick={handleDelete} className="btn btn-danger btn-sm">Supprimer</button>
          </div>
        )}
      </header>

      <article className="article-detail-container">
        {loadingArticle ? (
          <div className="article-skeleton">
            <div className="skeleton-loader hero-skeleton" />
            <div className="skeleton-content-padding">
              <div className="skeleton-loader title-skeleton" />
              <div className="skeleton-loader text-line" />
            </div>
          </div>
        ) : article ? (
          <>
            {article.imageUrl && (
              <div className="article-hero-image">
                <img src={getFullImageUrl(article.imageUrl)!} alt={article.title} />
              </div>
            )}

            <div className="article-header-meta">
              <h1 className="article-detail-title brand-bold">{article.title}</h1>
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
                    placeholder="Un avis technique ?"
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi...' : 'Publier'}
                  </button>
                </form>
              ) : (
                <div className="login-prompt">
                  <Link to="/login">Connectez-vous</Link> pour commenter.
                </div>
              )}

              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c._id} className="comment-card">
                    <div className="comment-header">
                      <span className="comment-author brand-bold">{c.author?.pseudo}</span>
                      <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                ))}
              </div>
            </section>

            {!loadingAllArticles && <RelatedArticles currentArticle={article} allArticles={allArticles} />}
          </>
        ) : null}
      </article>
    </div>
  );
}