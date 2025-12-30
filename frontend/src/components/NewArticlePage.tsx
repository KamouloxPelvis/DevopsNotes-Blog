// src/components/NewArticle.tsx
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../api/auth';
import { useToast } from '../context/ToastContext';
import TextToolbar from './TextToolbar';
import MarkdownPreview from './MarkdownPreview';


export default function NewArticle() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const token = getAuthToken();
  const navigate = useNavigate();

  const [cursorStart, setCursorStart] = useState(0);
  const [cursorEnd, setCursorEnd] = useState(0);


  const API_ROOT = process.env.REACT_APP_API_ROOT ?? 'http://localhost:5000/';
  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    const normalized = value
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    setTags(normalized);
  };

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
    setError(null);

    try {
      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, imageUrl, tags, status }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }

      if (!res.ok) {
        const msg =
          (data && data.message) ||
          `Failed to create the article (status ${res.status}).`;
        throw new Error(msg);
      }

      const created = data;

      showToast({
        type: 'success',
        message:
          status === 'published'
            ? 'Article published successfully.'
            : 'Draft saved successfully.',
      });

      navigate(`/articles/${created.slug}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to create the article.';
      setError(msg);
      showToast({
        type: 'error',
        message: msg,
      });
    }
  }

  return (
    <div>
      <p>
        <Link to="/articles" className="btn btn-secondary">
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
            name="content"
            value={content}
            rows={15}
            onChange={(e) => {
              setContent(e.target.value);
              setCursorStart(e.target.selectionStart || 0);
              setCursorEnd(e.target.selectionEnd || 0);
            }}
            onSelect={(e) => {
              setCursorStart(e.currentTarget.selectionStart || 0);
              setCursorEnd(e.currentTarget.selectionEnd || 0);
            }}
          />
        </div>
        <TextToolbar 
          content={content} 
          setContent={setContent}
          cursorStart={cursorStart}
          cursorEnd={cursorEnd}
        />
        <div className="form-field">
          <label>Preview</label>
          <MarkdownPreview content={content} />
        </div>
        <div className="form-field">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            value={rawTags}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="docker, kubernetes, ci-cd"
          />
          <p className="form-help">
            Separate tags with commas. They will be used for filters and related articles.
          </p>
        </div>
        <div className="form-field">
          <label>Status</label>
          <select
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
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
  