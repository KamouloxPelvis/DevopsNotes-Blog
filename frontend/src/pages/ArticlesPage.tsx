import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import { getArticles } from '../api/articles';
import { Article } from '../types/articles';
import { useAuth } from '../context/AuthContext';
import MarkdownPreview from '../components/MarkdownPreview';
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
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://resources.devopsnotes.org";

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

      setArticles(prev => prev.map(a => 
        a.slug === slug ? { ...a, likes: likes } : a
      ));

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

  const handleLogout = () => {
    logout();
    navigate('/articles');    
  };

  useEffect(() => {
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
      .finally(() => setLoading(false));
  }, [page, user]);

  const articleIds = JSON.stringify(articles.map(a => a._id));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleIds]);

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
    <div className="articles-content">
      <div className="articles-header-v2">
        <h1 className="articles-title-v2">Articles</h1>
        <div className="articles-actions-v2">
          <input
            type="text"
            className="articles-search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="articles-actions-v2">
            <Link to="/forum" className="btn btn-secondary">Forum</Link>
            {user ? (
              <>
                <Link to="/chat" className="btn btn-secondary">Chat</Link>
                <button aria-label='Se déconnecter' className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                {isAdmin && <Link to="/articles/new" className="btn btn-primary">+ Nouvel article</Link>}
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Sign in</Link>
                <Link to="/signup" className="btn btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="articles-filters-v2">
          <div className="tags-grid-v2">
            <button className={`tag-pill ${activeTag === null ? 'active' : ''}`} onClick={() => setActiveTag(null)}>All</button>
            {allTags.map((tag) => (
              <button key={tag} className={`tag-pill ${activeTag === tag ? 'active' : ''}`} onClick={() => setActiveTag(tag)}>{tag}</button>
            ))}
          </div>
        </div>
      )}

      <div className="articles-grid-v2">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="article-card-v2 skeleton-card">
              <div style={{ height: '250px', background: '#2d3748', borderRadius: '8px', opacity: 0.5 }}></div>
              <div style={{ height: '20px', background: '#2d3748', margin: '15px', width: '70%', borderRadius: '4px' }}></div>
            </div>
          ))
        ) : (
          filteredArticles.map((article, index) => {
            const isLiked = likedArticles.has(article.slug);
            const likesCount = article.likes || 0;

            // --- CORRECTION URL IMAGE ---
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
                    style={{ 
                      width: '100%', 
                      height: '250px', 
                      objectFit: 'cover', 
                      objectPosition: 'center 30%' 
                    }}
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
                    {(article.tags || []).map((tag) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  
                  <div className="article-stats-v2">
                    <button 
                      className={`stat-btn ${isLiked ? 'active' : ''}`} 
                      onClick={() => handleLike(article.slug)}
                      disabled={isLiking === article.slug}
                      style={{ 
                        color: likesCount === 0 ? '#a0aec0' : (isLiked ? '#e31b23' : '#ffb6c1'),
                        transition: 'all 0.2s ease',
                        transform: isLiking === article.slug ? 'scale(0.9)' : 'scale(1)'
                      }}
                    >
                      ❤️ {likesCount}
                    </button>
                    <div className="stat-btn">👁️ {article.views ?? 0}</div>
                    <span className="comments-count">
                       💬 {commentCounts[article.slug] ?? 0}
                    </span>
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
}