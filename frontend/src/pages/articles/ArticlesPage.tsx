import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getArticles } from '../../api/articles';
import { Article } from '../../types/articles';
import { useAuth } from '../../context/AuthContext';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/ArticlesPage.css';

type CommentCountMap = Record<string, number>

export function ArticlesList() {

  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  const [articles, setArticles] = useState<Article[]>([]);
  const [commentCounts, setCommentCounts] = useState<CommentCountMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();          // <-- contexte
  const isAdmin = user?.role === 'admin';
  const [likedArticles, setLikedArticles] = useState(new Set<string>());
  
  const handleLike = async (slug: string) => {
  if (!user) return;
  
  const isLiked = likedArticles.has(slug);
  
  try {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.slug === slug
          ? { ...article, likes: Math.max(0, (article.likes || 0) + (isLiked ? -1 : 1)) }
          : article
      )
    );
    
    if (isLiked) {
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(slug);
        return newSet;
      });
    } else {
      setLikedArticles(prev => new Set(prev).add(slug));
    }
    
    await fetch(`/api/articles/${slug}/like`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Like échoué:', error);
  }
};


  async function handleLogout() {
    logout();              // supprime le token du localStorage
    navigate('/articles');    
}

  useEffect(() => {
    setLoading(true);
    getArticles(page, 6)
      .then((data) => {
        setArticles(data.items);
        setPages(data.pages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
  if (articles.length === 0) return;

  async function loadCounts() {
    const entries = await Promise.all(
      articles.map(async (a) => {
        try {
          const res = await fetch(
            `${API_URL}/articles/${a.slug}/comments/count`
          );
          if (!res.ok) return [a.slug, 0] as const;
          const data = await res.json();
          return [a.slug, data.count as number] as const;
        } catch {
          return [a.slug, 0] as const;
        }
      })
    );

    const map: CommentCountMap = {};
    for (const [slug, count] of entries) {
      map[slug] = count;
    }
    setCommentCounts(map);
  }

  loadCounts();
}, [API_URL, articles]);


  if (loading) return <p className='loading'>Loading articles...</p>;
  if (error) return <p>Error: {error}</p>;

  const allTags = Array.from(
    new Set(
      (articles || []) // Protection si articles est null
        .flatMap((a) => a?.tags ?? []) // Optionnal chaining + fallback
    )
  )
  .filter((t): t is string => typeof t === 'string' && t.length > 0)
  .sort();

  const filteredArticles = articles.filter((article) => {
  const matchesTag =
    activeTag === null || (article.tags || []).includes(activeTag);

  const term = searchTerm.toLowerCase();
  // Protection : on s'assure que title et content existent avant le toLowerCase()
  const matchesSearch =
    term === '' ||
    (article.title || '').toLowerCase().includes(term) ||
    (article.content || '').toLowerCase().includes(term);

  return matchesTag && matchesSearch;
});

  return (
    <div className="articles-content">
      
      {/* --- HEADER --- */}
      <div className="articles-header-v2">
        <h1 className="articles-title-v2">Articles</h1>
        
        <div className="articles-actions-v2">
          <input
            type="text"
            className="articles-search"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      
          <div className="articles-actions-v2">
            <Link to="/forum" className="btn btn-secondary">Forum</Link>

            {user ? (
              <>
                <Link to="/chat" className="btn btn-secondary">Chat</Link>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>

                {isAdmin && (
                  <Link to="/articles/new" className="btn btn-primary">
                    + New
                  </Link>
                )}
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

      {/* --- TAGS FILTER --- */}
      {allTags.length > 0 && (
        <div className="articles-filters-v2">
          <span className="filters-label-v2">Filter by tag</span>
          <div className="tags-grid-v2">
            <button
              type="button"
              className={`tag-pill ${activeTag === null ? 'active' : ''}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-pill ${activeTag === tag ? 'active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- ARTICLES GRID --- */}
      <div className="articles-grid-v2">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article._id} className="article-card-v2">
              {article.imageUrl && (
                <div className="article-image-v2">
                  <img src={`${API_URL}${article.imageUrl}`} alt={article.title || 'Article image'} />
                </div>
              )}
              
              <div className="article-content-v2">
                <h3 className="article-title-v2">
                  {article.title || "Untitled Article"}
                  {article.status === 'draft' && <span className="draft-badge">Draft</span>}
                </h3>
                
                <div className="article-excerpt">
                  <MarkdownPreview 
                    content={(article.excerpt || article.content || '').slice(0, 280) + '...'}
                    className="preview-card-clean"
                  />
                </div>

                <div className="article-tags-v2">
                  {(article.tags || []).slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className={`tag ${activeTag === tag ? 'active' : ''}`}
                      onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="article-stats-v2">
                  <button 
                    className="stat-btn like-btn"
                    onClick={() => handleLike(article.slug)}
                    disabled={!user}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>{article.likes ?? 0}</span>
                  </button>
                  
                  <div className="stat-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span>{article.views ?? 0}</span>
                  </div>
                </div>
              
                <div className="article-footer-v2">
                  <Link to={`/articles/${article.slug}`} className="btn btn-primary">
                    Read more
                  </Link>
                  <span className="comments-count">
                    {commentCounts[article.slug] ?? 0} comment{(commentCounts[article.slug] ?? 0) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results-message" style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
            <p>No articles found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      {pages > 1 && (
        <div className="pagination-v2">
          <div className="pagination-nav">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span className="pagination-info">Page {page} of {pages}</span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
            >
              Next
            </button>
          </div>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate('/homepage')}
          >
            About
          </button>
        </div>
      )}
    </div>
  )};