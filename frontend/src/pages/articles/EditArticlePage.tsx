import { FormEvent, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAuthToken } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import TextToolbar from '../../components/TextToolbar';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/EditArticlePage.css';

type RouteParams = { slug: string; };
type Article = {
  _id: string; title: string; content: string;
  tags?: string[]; status: 'draft' | 'published';
  imageUrl?: string; slug: string;
};

export default function EditArticle() {
  const { slug } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = getAuthToken();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [uploading, setUploading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';
  const API_ROOT = process.env.REACT_APP_API_ROOT ?? 'http://localhost:5000';

  useEffect(() => {
    if (!slug) return;

    fetch(`${API_URL}/articles/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject('Erreur lors de la récupération'))
      .then((data: Article) => {
        setTitle(data.title);
        setContent(data.content);
        setImageUrl(data.imageUrl || '');
        setImagePreview(data.imageUrl ? `${API_ROOT}${data.imageUrl}` : null);
        setTags(data.tags || []);
        setRawTags((data.tags || []).join(', '));
        setStatus(data.status || 'draft');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, API_URL, API_ROOT]);

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    setTags(value.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0));
  };

  async function handleUploadImage() {
    if (!imageFile || uploading) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch(`${API_ROOT}/api/upload`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImageUrl(data.imageUrl);
      showToast({ type: 'success', message: 'Image mise à jour !' });
    } catch (err: any) {
      setError(err.message);
    } finally { setUploading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title, content, imageUrl, tags, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      showToast({ type: 'success', message: 'Article mis à jour !' });
      navigate(`/articles/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading-state">Chargement de l'article...</div>;

  return (
    <div className="new-article-page edit-article-page">
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="form-header">
        <Link to={`/articles/${slug}`} className="btn btn-secondary">← Annuler</Link>
        <h1>Édition : {title || 'Article'}</h1>
        <div className="header-actions">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="status-select">
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
          <button onClick={handleSubmit} className="btn btn-primary">Enregistrer</button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-main">
          <input 
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'article..."
          />

          <div className="toolbar-container">
            <TextToolbar content={content} setContent={setContent} textAreaRef={textAreaRef} />
          </div>

          <textarea
            ref={textAreaRef}
            className="content-textarea"
            value={content}
            rows={20}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu en Markdown..."
          />
        </div>

        <aside className="editor-sidebar">
          <div className="sidebar-card">
            <h3>Image à la une</h3>
            <div className="image-upload-zone">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="side-preview-img" />
              ) : (
                <div className="img-placeholder">Aucune image</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) setImagePreview(URL.createObjectURL(file));
              }} />
              <button type="button" onClick={handleUploadImage} disabled={!imageFile || uploading} className="btn btn-secondary btn-sm">
                {uploading ? 'Upload...' : 'Mettre à jour l\'image'}
              </button>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Tags (séparés par des virgules)</h3>
            <input 
              value={rawTags} 
              onChange={(e) => handleTagsChange(e.target.value)} 
              className="tag-input"
            />
          </div>

          <div className="sidebar-card preview-mini">
            <h3>Aperçu direct</h3>
            <div className="markdown-render">
              <MarkdownPreview content={content || "*Commencez à écrire pour voir l'aperçu...*"} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}