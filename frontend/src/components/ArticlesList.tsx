import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { Article } from '../types/articles';
import { getAuthToken, logout } from '../api/auth';
import { useNavigate } from 'react-router-dom';

type CommentCountMap = Record<string, number>;

export function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [commentCounts, setCommentCounts] = useState<CommentCountMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = !!getAuthToken();
  
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const navigate = useNavigate();

  function handleLogout() {
  logout();              // supprime le token du localStorage
  navigate('/articles');    // ou navigate('/') si tu préfères revenir à la liste
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
            `http://localhost:5000/api/articles/${a.slug}/comments/count`
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
}, [articles]);


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
        {isAdmin ? (
          <>
            <Link to="/articles/new" className="btn btn-primary">
              New article
            </Link>
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
            <Link to="/member-login" className="btn btn-secondary">
              Sign in
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Admin
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
              src={`http://localhost:5000${article.imageUrl}`}
              alt={article.title}
              className="article-card-thumb"
            />
          )}

          <div className="article-card-body">
            <h3>{article.title}</h3>
            {article.status === 'draft' && (
              <span className="badge-draft">Draft</span>
            )}
            <p className="article-excerpt">
              {article.content.slice(0, 120)}…
            </p>

            <div className="article-tags">
              {article.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={activeTag === tag ? 'tag tag-active' : 'tag'}
                  onClick={() =>
                    setActiveTag((prev) => (prev === tag ? null : tag))
                  }
                >
                  {tag}
                </span>
              ))}
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
