// src/components/ArticleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Article = {
  _id: string;
  title: string;
  body: string;
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

  return (
    <article>
      <h1>{article.title}</h1>
      <p>{article.body}</p>
    </article>
  );
}
