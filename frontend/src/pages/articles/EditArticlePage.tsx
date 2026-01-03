import { FormEvent, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAuthToken } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import TextToolbar from '../../components/TextToolbar';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/NewArticlePage.css';

export default function EditArticle() {
  const { slug: currentSlug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { showToast } = useToast();
  const token = getAuthToken();
  const navigate = useNavigate();

  const API_ROOT = process.env.REACT_APP_API_ROOT ?? 'https://www.devopsnotes.org/';
  const API_URL = process.env.REACT_APP_API_URL ?? 'https://www.devopsnotes.org/api';

  // Chargement des données existantes
  useEffect(() => {
  if (!currentSlug) return;

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/articles/${currentSlug}`);
      if (!res.ok) throw new Error("Article introuvable");
      
      const data = await res.json();

      setTitle(data.title);
      setContent(data.content); 
      setStatus(data.status);
      
      // Gestion de l'image
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);

        const fullUrl = data.imageUrl.startsWith('http') 
          ? data.imageUrl 
          : `${API_ROOT}${data.imageUrl.startsWith('/') ? '' : '/'}${data.imageUrl}`;
        setImagePreview(fullUrl);
      }

      // Gestion des tags
      const articleTags = data.tags || [];
      setTags(articleTags);
      setRawTags(articleTags.join(', '));

    } catch (err: any) {
      setError(err.message);
      showToast({ type: 'error', message: "Erreur de chargement" });
    } finally {
      setLoading(false);
    }
  };

  fetchArticle();
}, [currentSlug, API_URL, API_ROOT, showToast]);

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

      const res = await fetch(`${API_ROOT}/uploads`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();

      setImageUrl(data.imageUrl);
      showToast({ type: 'success', message: 'Image mise à jour !' });
    } catch (err) { setError("Erreur upload"); } 
    finally { setUploading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/articles/${currentSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title, content, imageUrl, tags, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      showToast({ type: 'success', message: 'Article mis à jour !' });
      navigate(`/articles/${data.slug}`);
    } catch (err) { setError("Erreur lors de la sauvegarde"); }
  }

  return (
    <div className="new-article-v2"> {/* On garde la même classe CSS */}
      <header className="editor-header">
        <div className="header-container">
          <Link to="/articles" className="back-link">← Annuler</Link>
          <div className="view-switcher">
            <button onClick={() => setViewMode('edit')} className={viewMode === 'edit' ? 'active' : ''}>Édition</button>
            <button onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>Aperçu</button>
          </div>
          <div className="final-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </select>
            <button onClick={handleSubmit} className="btn-publish">Mettre à jour</button>
          </div>
        </div>
      </header>

      <main className="editor-content-area">
        {viewMode === 'edit' ? (
          <div className="edit-stack">
            <section className="meta-section">
              <div className="image-uploader">
                <label>Couverture</label>
                <div className="upload-row">
                  <input type="file" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) setImagePreview(URL.createObjectURL(file));
                  }} />
                  <button onClick={handleUploadImage} disabled={!imageFile || uploading}>Update</button>
                </div>
                {imagePreview && <img src={imagePreview} className="mini-preview" alt="preview" />}
              </div>
              <div className="tag-box">
                <label>Tags</label>
                <input value={rawTags} onChange={(e) => handleTagsChange(e.target.value)} />
              </div>
            </section>

            <input className="main-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="toolbar-sticky">
              <TextToolbar content={content} setContent={setContent} textAreaRef={textAreaRef} />
            </div>
            <textarea ref={textAreaRef} className="main-textarea" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        ) : (
          <article className="full-preview">
            {imagePreview && <img src={imagePreview} className="cover-img" alt="cover" />}
            <h1 className="preview-title">{title}</h1>
            <div className="preview-tags">{tags.map(t => <span key={t}>#{t} </span>)}</div>
            <hr />
            <MarkdownPreview content={content} />
          </article>
        )}
      </main>
    </div>
  );
};