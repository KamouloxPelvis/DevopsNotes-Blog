// src/components/NewArticle.tsx
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from './PageLayout';
import { getAuthToken } from '../api/auth';

export default function NewArticle() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(''); // URL renvoyée par /upload

  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState(''); // "docker, containerization"

  const [status, setStatus] = useState<'draft' | 'published'>('draft');


  const navigate = useNavigate();
  const token = getAuthToken();

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    const normalized = value
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    setTags(normalized);
  };

  async function handleUploadImage() {
    if (!imageFile) return;

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch('http://localhost:5000/upload', {
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
      setImageUrl(data.imageUrl); // ex: "/uploads/xxx.jpg"
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, imageUrl, tags, status }),
      });

      if (!res.ok) throw new Error('Erreur HTTP');

      const created = await res.json();
      navigate(`/articles/${created.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <PageLayout>
      <p>
        <Link to="/" className="btn btn-secondary">
          ← Back to the list
        </Link>
      </p>

      <h2>New article</h2>

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
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
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
              console.log('file picked', file);
              setImageFile(file);
              if (file) {
                const url = URL.createObjectURL(file);
                setImagePreview(url);
              } else {
                setImagePreview(null);
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
            Create
          </button>
        </div>
      </form>
    </PageLayout>
  );
}

