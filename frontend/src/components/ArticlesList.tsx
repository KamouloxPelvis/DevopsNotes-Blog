import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { Article } from '../types/articles';

export function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArticles()
      .then((data) => setArticles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading articles...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="articles-list">
      <div className="articles-list-header">
        <h2>Articles</h2>
        <Link to="/articles/new" className="btn btn-primary">
          New article
        </Link>
      </div>

      <div className="articles-grid">
        {articles.map((article) => (
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
              <Link to={`/articles/${article.slug}`} className="btn btn-primary">
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
