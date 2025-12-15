import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { Article } from '../types/articles';
import { getAuthToken, logout } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = !!getAuthToken();
  const navigate = useNavigate();

  function handleLogout() {
  logout();              // supprime le token du localStorage
  navigate('/');    // ou navigate('/') si tu préfères revenir à la liste
}

  useEffect(() => {
    getArticles()
      .then((data) => setArticles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
            <Link to="/login" className="btn btn-secondary">
              Admin Login
            </Link>
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

              <Link
                to={`/articles/${article.slug}`}
                className="btn btn-primary"
              >
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
