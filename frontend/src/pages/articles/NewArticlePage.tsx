import { FormEvent, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import TextToolbar from '../../components/TextToolbar';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/NewArticlePage.css';

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
  
  // Utilisation de la ref pour le textarea
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const { showToast } = useToast();
  const token = getAuthToken();
  const navigate = useNavigate();

  const API_ROOT = process.env.REACT_APP_API_ROOT ?? 'http://localhost:5000/';
  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    const normalized = value.split(',').map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
    setTags(normalized);
  };

  async function handleUploadImage() {
    if (!imageFile || uploading) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch(`${API_ROOT}upload`, { // Correction du slash si nécessaire
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur lors de l’upload');
      const data = await res.json();
      setImageUrl(data.imageUrl);
      showToast({ type: 'success', message: 'Image uploadée !' });
    } catch (err: any) {
      setError(err.message);
    } finally { setUploading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title, content, imageUrl, tags, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur creation');
      showToast({ type: 'success', message: status === 'published' ? 'Article publié !' : 'Brouillon sauvé.' });
      navigate(`/articles/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="new-article-page">
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
        <div className="form-header">
          <Link to="/articles" className="btn btn-secondary">← Back</Link>
          <h1>Create New Article</h1>
          <div className="header-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')} className="status-select">
              <option value="draft">Draft Mode</option>
              <option value="published">Ready to Publish</option>
            </select>
            <button onClick={handleSubmit} className="btn btn-primary">Save Article</button>
          </div>
        </div>

      <div className="editor-grid">
        <div className="editor-main">
          <input 
            className="title-input"
            placeholder="Article Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="toolbar-container">
            {/* Passage de la ref ici */}
            <TextToolbar 
              content={content} 
              setContent={setContent} 
              textAreaRef={textAreaRef} 
            />
          </div>

          <textarea
            ref={textAreaRef}
            className="content-textarea"
            placeholder="Write your story in Markdown..."
            value={content}
            rows={20}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <aside className="editor-sidebar">
          <div className="sidebar-card">
            <h3>Featured Image</h3>
            <div className="image-upload-zone">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="side-preview-img" />
              ) : (
                <div className="img-placeholder">No image selected</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) setImagePreview(URL.createObjectURL(file));
              }} />
              <button type="button" onClick={handleUploadImage} disabled={!imageFile || uploading} className="btn btn-secondary btn-sm">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Tags</h3>
            <input 
              value={rawTags} 
              onChange={(e) => handleTagsChange(e.target.value)} 
              placeholder="devops, react, node..."
              className="tag-input"
            />
          </div>

          <div className="sidebar-card preview-mini">
            <h3>Live Preview</h3>
            <div className="markdown-render">
              <MarkdownPreview content={content || "*Nothing to preview yet...*"} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}