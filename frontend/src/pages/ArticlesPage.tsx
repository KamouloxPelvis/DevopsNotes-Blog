import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 
import { getArticles } from '../api/articles';
import { Article } from '../types/articles';
import { useAuth } from '../context/AuthContext';
import MarkdownPreview from '../components/MarkdownPreview';
import NProgress from 'nprogress';
import '../styles/ArticlesPage.css';

type CommentCountMap = Record<string, number>;

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentCounts, setCommentCounts] = useState<CommentCountMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [isLiking, setIsLiking] = useState<string | null>(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://resources.devopsnotes.org";

  // Simulation d'un petit délai pour l'onctuosité de l'animation si besoin
  useEffect(() => {
    NProgress.start();
    setLoading(true);
    getArticles(page, 6)
      .then((data) => {
        setArticles(data.items);
        setPages(data.pages);

        if (user) {
          const initialLikes = new Set<string>();
          data.items.forEach((a: Article) => {
            if (a.likedBy?.some(id => id.toString() === user.id)) {
              initialLikes.add(a.slug);
            }
          });
          setLikedArticles(initialLikes);
        }
      })
      .catch((err) => setError(err.message))
      .finally(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        NProgress.done();
        setLoading(false);
      });
  }, [page, user]);

  // Récupération des compteurs de commentaires
  useEffect(() => {
    if (articles.length === 0) return;

    const loadCounts = async () => {
      const counts: CommentCountMap = {};
      await Promise.all(
        articles.map(async (a) => {
          try {
            const res = await api.get(`/articles/${a.slug}/comments/count`);
            counts[a.slug] = res.data.count;
          } catch {
            counts[a.slug] = 0;
          }
        })
      );
      setCommentCounts(counts);
    };

    loadCounts();
  }, [articles]);

  const handleLike = async (slug: string) => {
    if (!user) {
      alert("Veuillez vous connecter pour aimer cet article.");
      return;
    }
    if (isLiking === slug) return;
    try {
      setIsLiking(slug); 
      const res = await api.post(`/articles/${slug}/like`);
      const { likes, hasLiked } = res.data;
      setArticles(prev => prev.map(a => a.slug === slug ? { ...a, likes: likes } : a));
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        if (hasLiked) newSet.add(slug);
        else newSet.delete(slug);
        return newSet;
      });
    } catch (error) {
      console.error('Erreur lors du like:', error);
    } finally {
      setIsLiking(null);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesTag = activeTag === null || (article.tags || []).includes(activeTag);
      const term = searchTerm.toLowerCase();
      const matchesSearch = term === '' || 
        (article.title || '').toLowerCase().includes(term) ||
        (article.content || '').toLowerCase().includes(term);
      return matchesTag && matchesSearch;
    });
  }, [articles, activeTag, searchTerm]);

  const allTags = useMemo(() => {
    const tags = new Set(articles.flatMap(a => a.tags || []));
    return Array.from(tags).filter(Boolean).sort();
  }, [articles]);

  if (error) return <div className="error-msg">Erreur: {error}</div>;

  return (
    /* 1. Animation de fondu sur toute la page */
    <div className="articles-content fade-in-page">
      <div className="articles-header-v2">
        <div className="articles-search-wrapper">
          <input
            type="text"
            className="articles-search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="articles-actions-v2">
          <div className="nav-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/forum" className="btn btn-secondary">Forum</Link>
            {user && <Link to="/chat" aria-label="chat" className="btn btn-secondary">Chat</Link>}
          </div>
          {user && isAdmin && (
            <Link to="/articles/new" className="btn btn-primary admin-new-btn">
              <span className="full-text">+ Nouvel article</span>
              <span className="mobile-icon">+</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tags avec skeleton si loading */}
      <div className="articles-filters-v2">
        <div className="tags-grid-v2">
          {loading ? (
             [1, 2, 3, 4, 5].map(n => <div key={n} className="skeleton-loader" style={{ width: '60px', height: '30px', borderRadius: '20px' }}></div>)
          ) : (
            <>
              <button className={`tag-pill ${activeTag === null ? 'active' : ''}`} onClick={() => setActiveTag(null)}>All</button>
              {allTags.map((tag) => (
                <button key={tag} className={`tag-pill ${activeTag === tag ? 'active' : ''}`} onClick={() => setActiveTag(tag)}>{tag}</button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="articles-grid-v2">
        {loading ? (
          /* 2. Squelettes améliorés pour correspondre aux cartes réelles */
          [...Array(6)].map((_, i) => (
            <div key={i} className="article-card-v2">
              <div className="skeleton-loader" style={{ height: '250px', width: '100%' }}></div>
              <div style={{ padding: '1.25rem' }}>
                <div className="skeleton-loader" style={{ height: '24px', width: '80%', marginBottom: '15px' }}></div>
                <div className="skeleton-loader" style={{ height: '16px', width: '100%', marginBottom: '8px' }}></div>
                <div className="skeleton-loader" style={{ height: '16px', width: '90%', marginBottom: '20px' }}></div>
                <div className="skeleton-loader" style={{ height: '35px', width: '120px', borderRadius: '8px' }}></div>
              </div>
            </div>
          ))
        ) : (
          filteredArticles.map((article, index) => {
            const isLiked = likedArticles.has(article.slug);
            const likesCount = article.likes || 0;
            const imageUrl = article.imageUrl 
              ? (article.imageUrl.startsWith('http') 
                  ? article.imageUrl 
                  : `${R2_PUBLIC_URL}${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`)
              : null;

            return (
              <div key={article._id} className="article-card-v2">
                {imageUrl && (
                  <div className="article-image-v2">
                    <img
                      src={imageUrl} 
                      alt={article.title}
                      style={{ width: '100%', height: '250px', objectFit: 'cover', objectPosition: 'center 30%' }}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                )}
                <div className="article-content-v2">
                  <h3 className="article-title-v2">
                    {article.title}
                    {article.status === 'draft' && <span className="draft-badge">Brouillon</span>}
                  </h3>
                  <div className="article-excerpt">
                    <MarkdownPreview 
                      content={(article.excerpt || article.content || '').slice(0, 180) + '...'}
                      className="preview-card-clean" 
                    />
                  </div>
                  <div className="article-tags-v2">
                    {(article.tags || []).map((tag) => <span key={tag} className="tag">#{tag}</span>)}
                  </div>
                  <div className="article-stats-v2">
                    <button 
                      className={`stat-btn ${isLiked ? 'active' : ''}`} 
                      onClick={() => handleLike(article.slug)}
                      disabled={isLiking === article.slug}
                      style={{ 
                        color: likesCount === 0 ? '#a0aec0' : (isLiked ? '#e31b23' : '#ffb6c1'),
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ❤️ {likesCount}
                    </button>
                    <div className="stat-btn">👁️ {article.views ?? 0}</div>
                    <span className="comments-count">💬 {commentCounts[article.slug] ?? 0}</span>
                  </div>
                  <div className="article-footer-v2">
                    <Link to={`/articles/${article.slug}`} className="btn btn-primary">Lire l'article</Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && pages > 1 && (
        <div className="pagination-v2">
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
          <span className="pagination-info">Page {page} sur {pages}</span>
          <button className="btn btn-secondary" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
      )}
    </div>
  );
};