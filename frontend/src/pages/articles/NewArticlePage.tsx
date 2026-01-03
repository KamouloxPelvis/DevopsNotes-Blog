import { FormEvent, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import TextToolbar from '../../components/TextToolbar';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/NewArticlePage.css'; // On va adapter ce CSS

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
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { showToast } = useToast();
  const token = getAuthToken();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL ?? 'https://www.devopsnotes.org/api';

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

      const res = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (!res.ok) throw new Error('Erreur lors de l’upload');

      const data = await res.json();

      setImageUrl(data.imageUrl);
      showToast({ type: 'success', message: 'Image prête pour l’article !' });
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
    <div className="new-article-v2">
      {/* 1. Header Fixe avec Actions */}
      <header className="editor-header">
        <div className="header-container">
          <Link to="/articles" className="back-link">← Articles</Link>
          <div className="view-switcher">
            <button 
              onClick={() => setViewMode('edit')} 
              className={viewMode === 'edit' ? 'active' : ''}
            >Édition</button>
            <button 
              onClick={() => setViewMode('preview')} 
              className={viewMode === 'preview' ? 'active' : ''}
            >Aperçu</button>
          </div>
          <div className="final-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </select>
            <button onClick={handleSubmit} className="btn-publish">Enregistrer</button>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <main className="editor-content-area">
        {viewMode === 'edit' ? (
          <div className="edit-stack">
            {/* 2. Zone Image et Tags (Meta) */}
            <section className="meta-section">
              <div className="image-uploader">
                <label>Couverture</label>
                <div className="upload-row">
                  <input type="file" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) setImagePreview(URL.createObjectURL(file));
                  }} />
                  <button onClick={handleUploadImage} disabled={!imageFile || uploading}>
                    {uploading ? '...' : 'Upload'}
                  </button>
                </div>
                {imagePreview && <img src={imagePreview} className="mini-preview" alt="preview" />}
              </div>
              
              <div className="tag-box">
                <label>Tags (séparés par virgules)</label>
                <input 
                  value={rawTags} 
                  onChange={(e) => handleTagsChange(e.target.value)} 
                  placeholder="ex: devops, docker, ci-cd" 
                />
              </div>
            </section>

            {/* 3. Titre et Éditeur (Largeur Maximale) */}
            <input 
              className="main-title-input"
              placeholder="Titre de l'article technique..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="toolbar-sticky">
              <TextToolbar content={content} setContent={setContent} textAreaRef={textAreaRef} />
            </div>

            <textarea
              ref={textAreaRef}
              className="main-textarea"
              placeholder="Commencez votre tutoriel en Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        ) : (
          /* 4. Mode Preview plein écran */
          <article className="full-preview">
            {imagePreview && <img src={imagePreview} className="cover-img" alt="cover" />}
            <h1 className="preview-title">{title || "Titre de l'article"}</h1>
            <div className="preview-tags">
              {tags.map(t => <span key={t}>#{t}</span>)}
            </div>
            <hr />
            <MarkdownPreview content={content || "*Aucun contenu à afficher...*"} />
          </article>
        )}
      </main>
    </div>
  );
};