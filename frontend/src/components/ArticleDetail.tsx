// src/components/ArticleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

type Article = {
  _id: string;
  title: string;
  content: string;
  slug: string;
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
      .then((data) => setArticle(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;
  if (!article) return <p>Article introuvable</p>;

  async function handleDelete() {
  if (!slug) return;

  const confirmDelete = window.confirm('Tu veux vraiment supprimer cet article ?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/articles/${slug}`, {
      method: 'DELETE',
    });

    if (!res.ok && res.status !== 204) {
      throw new Error('Erreur HTTP');
    }

      navigate('/'); // retour à la liste
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <article>
      <p>
        <Link to="/">← Retour à la liste</Link>
      </p>

      <h1>{article.title}</h1>
      <p>{article.content}</p>

      <button type="button" onClick={handleDelete}>
        Supprimer
      </button>
    </article>
  );
}
