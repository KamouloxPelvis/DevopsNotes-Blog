import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';          // <-- ajout
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
    <div>
      <p>
        <Link to="/articles/new">Nouvel article</Link>
      </p>

      <ul>
        {articles.map((article) => (
          <li key={article._id}>
            <Link to={`/articles/${article.slug}`}>
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}