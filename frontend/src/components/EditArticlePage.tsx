// src/components/EditArticle.tsx
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAuthToken } from '../api/auth';
import { useToast } from '../context/ToastContext';

type RouteParams = {
  slug: string;
};

type Article = {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  status: 'draft' | 'published';
  imageUrl?: string;
  slug: string;
};

export default function EditArticle() {
  const { slug } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [uploading, setUploading] = useState(false);

  const token = getAuthToken();

  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';
  const API_ROOT = process.env.REACT_APP_API_ROOT ?? 'http://localhost:5000/api';

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    const normalized = value
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    setTags(normalized);
  };

  useEffect(() => {
    if (!slug) return;

    fetch(`${API_URL}/articles/${slug}`)
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
        setStatus((data.status as 'draft' | 'published') || 'draft');
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, API_URL]);

  async function handleUploadImage() {
    if (!imageFile || uploading) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch(`${API_ROOT}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erreur lors de l’upload de l’image');
      }

      const data = await res.json();
      setImageUrl(data.imageUrl);

      showToast({
        type: 'success',
        message: 'Image uploaded successfully.',
      });
    } catch (err: any) {
      const msg = err.message || 'Image upload failed.';
      console.error('upload error', err);
      setError(msg);
      showToast({
        type: 'error',
        message: msg,
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!slug) {
      return;
    }

     const payload = { 
    title, 
    content: content.replace(/\n/g, '\\n'),  // escape newlines
    imageUrl, 
    tags, 
    status 
  };


    try {
      const res = await fetch(`${API_URL}/articles/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || `HTTP ${res.status}`);
      }

      const updated: Article = await res.json();

      showToast({
        type: 'success',
        message:
          status === 'published'
            ? 'Article updated and published.'
            : 'Draft updated successfully.',
      });

      navigate(`/articles/${updated.slug}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to update the article.';
      setError(msg);
      showToast({
        type: 'error',
        message: msg,
      });
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error && !title) return <p>Error : {error}</p>;

  return (
    <div>
      <p>
        <Link to="/articles" className="btn btn-secondary">
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

        <div className="form-field">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            className="form-control"
            value={rawTags}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="docker, kubernetes, ci-cd"
          />
        </div>

        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            className="form-control"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'draft' | 'published')
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
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
                setImagePreview(url);
              } else {
                setImagePreview(imageUrl || null);
              }
            }}
          />

          {imagePreview && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Preview"
                onError={() => setImagePreview(null)}
              />
            </div>
          )}

          <button
            type="button"
            className={`btn btn-secondary upload-btn ${
              uploading ? 'is-loading' : ''
            }`}
            onClick={handleUploadImage}
            disabled={uploading || !imageFile}
          >
            {uploading ? 'Uploading...' : 'Upload an image'}
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
