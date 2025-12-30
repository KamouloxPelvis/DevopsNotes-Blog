import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { Article } from '../types/articles';
import { useAuth } from '../context/AuthContext';
import MarkdownPreview from '../components/MarkdownPreview';

type CommentCountMap = Record<string, number>;

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


  if (loading) return <p>Loading articles...</p>;
  if (error) return <p>Error: {error}</p>;

  const allTags = Array.from(
    new Set(
      articles
        .flatMap((a) => a.tags || [])
        .filter((t) => t && t.length > 0)
    )
  ).sort();

  const filteredArticles = articles.filter((article) => {
    const matchesTag =
      activeTag === null || (article.tags || []).includes(activeTag);

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      term === '' ||
      article.title.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term);

    return matchesTag && matchesSearch;
  });

  return (
  <div className="articles-list">
    <div className="articles-list-header">
      <h2>Articles</h2>
      <div className="articles-header-right">
        <input
          type="text"
          className="articles-search-input"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link to="/forum" className="btn btn-secondary">
          Forum
        </Link>
        {user ? (                                  // <-- connecté = n'importe quel rôle
          <>
          <Link to="/chat" className="btn btn-secondary">
            Chat
          </Link>
            {isAdmin && (                           // <-- admin uniquement
              <Link to="/articles/new" className="btn btn-primary">
                New article
              </Link>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="btn btn-light">
              Sign up
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>

    {allTags.length > 0 && (
      <div className="articles-filters">
        <span className="articles-filters-label">Filter by tag</span>

        <div className="tags-filter">
          <button
            type="button"
            className={activeTag === null ? 'tag-pill active' : 'tag-pill'}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={activeTag === tag ? 'tag-pill active' : 'tag-pill'}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    )}

    <div className="articles-grid">
      {filteredArticles.map((article) => (
        <div key={article._id} className="article-card">
          {article.imageUrl && (
            <img
              src={`${API_URL}${article.imageUrl}`}
              alt={article.title}
              className="article-card-thumb"
            />
          )}

          <div className="article-card-body">
            <h3>{article.title}</h3>
            {article.status === 'draft' && (
              <span className="badge-draft">Draft</span>
            )}

            <div className="article-excerpt text-center max-w-[90%] mx-auto mb-4">
            <MarkdownPreview 
              content={(article.excerpt || article.content || '').slice(0, 280) + '...'}
              className="preview-card-clean"
            />
            </div>

            <div className="article-tags">
              {article.tags?.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className={activeTag === tag ? 'tag tag-active' : 'tag'}
                  onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="article-stats mt-3 text-xs text-gray-500 py-2 border-t border-gray-100">
              <button 
                className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                onClick={() => handleLike(article.slug)}
                disabled={!user}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" 
                    fill={likedArticles.has(article.slug) ? "#ef4444" : "none"} 
                    stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="font-semibold">{article.likes ?? 0}</span>
              </button>
              
              <div className="flex items-center gap-1.5 p-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="font-semibold">{article.views ?? 0}</span>
              </div>
            </div>

            <div className="article-card-footer">
              <Link
                to={`/articles/${article.slug}`}
                className="btn btn-primary"
              >
                Read more
              </Link>
              <span className="article-comments-count">
                {commentCounts[article.slug] ?? 0} comment
                {(commentCounts[article.slug] ?? 0) > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      ))}

      {pages > 1 && (
        <div className="pagination">
          <div className="pagination-left">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>

            <span className="pagination-info">
              Page {page} of {pages}
            </span>

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
  </div>
)};
