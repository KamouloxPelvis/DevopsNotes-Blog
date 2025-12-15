import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageLayout } from './PageLayout';

type RouteParams = {
  slug: string;
};

type Article = {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
  slug: string;
};

export default function EditArticle() {
  const { slug } = useParams<RouteParams>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState(''); // champ texte brut "docker, containerization"

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    const normalized = value
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);
    setTags(normalized);
  };


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
        setImageUrl(data.imageUrl || '');
        setImagePreview(data.imageUrl || null);
        const existingTags = data.tags || [];
        setTags(existingTags);
        setRawTags(existingTags.join(', '));
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleUploadImage() {
    console.log('handleUploadImage called, imageFile =', imageFile);
    if (!imageFile) return;

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors de l’upload de l’image');
      }

      console.log('upload status', res.status);
      const data = await res.json();
      console.log('upload response', data);
      setImageUrl(data.imageUrl);          // ex: "/uploads/xxx.jpg"
    } catch (err: any) {
      console.error('upload error', err);
      setError(err.message);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slug) return;

    try {
      const res = await fetch(`http://localhost:5000/api/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl, tags }),
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
    <PageLayout>
      <p>
        <Link to="/" className="btn btn-secondary">
          ← Back to the list
        </Link>
      </p>

      <h2>Edit the article</h2>

      <form onSubmit={handleSubmit} className="article-form">
        {error && <p className="form-error">Erreur : {error}</p>}

        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            value={rawTags}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="docker, kubernetes, ci-cd"
          />
        </div>

        <div className="form-field">
          <label htmlFor="image">Illustration</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImageFile(file);
              if (file) {
                const url = URL.createObjectURL(file);
                console.log('file picked', file);
                setImagePreview(url);
              } else {
                setImagePreview(imageUrl || null);
              }
            }}
          />

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleUploadImage}
          >
            Upload an image
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </div>
      </form>
    </PageLayout>
  );
}
