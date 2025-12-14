import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

type RouteParams = {
  slug: string;
};

type Article = {
  _id: string;
  title: string;
  content: string;
  slug: string;
};

export default function EditArticle() {
  const { slug } = useParams<RouteParams>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // charger l'article existant
  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:5000/api/articles/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erreur HTTP');
        return res.json();
      })
      .then((data: Article) => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slug) return;

    try {
      const res = await fetch(`http://localhost:5000/api/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error('Erreur HTTP');

      const updated: Article = await res.json();
      navigate(`/articles/${updated.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error}</p>;

  return (
    <div>
      <p>
        <Link to="/">← Back to the list</Link>
      </p>

      <h1>Edit the article</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
