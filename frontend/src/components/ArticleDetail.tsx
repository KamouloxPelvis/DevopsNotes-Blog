// src/components/ArticleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageLayout } from './PageLayout';

type Article = {
  _id: string;
  title: string;
  content: string;
  slug: string;
  imageUrl?: string;
};

type RouteParams = {
  slug: string;
};

export default function ArticleDetail() {
  const { slug } = useParams<RouteParams>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:5000/api/articles/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erreur HTTP');
        return res.json();
      })
      .then((data: Article) => setArticle(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error}</p>;
  if (!article) return <p>Can't find this article</p>;

  async function handleDelete() {
    if (!slug) return;

    const confirmDelete = window.confirm('Do you really want to delete this article ?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/articles/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        throw new Error('Erreur HTTP');
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <PageLayout>
      {article.imageUrl && (
        <div className="article-detail-image">
          <img
            src={`http://localhost:5000${article.imageUrl}`}
            alt={article.title}
          />
        </div>
      )}

      <h1>{article.title}</h1>
      <p>{article.content}</p>

      <p>
        <Link to="/" className="btn btn-secondary">
          ← Back to the list
        </Link>{' '}
        <Link to={`/articles/${article.slug}/edit`} className="btn btn-primary">
          Edit
        </Link>{' '}
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </p>
    </PageLayout>
  );
}
