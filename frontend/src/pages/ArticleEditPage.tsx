import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { useToast } from '../context/ToastContext';
import TiptapEditor from '../components/Editor';
import '../styles/ArticleNewPage.css';

export default function EditArticle() {
  const { slug: currentSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(true);

const R2_PUBLIC_URL = process.env.REACT_APP_R2_PUBLIC_URL ?? "https://resources.devopsnotes.org";

// 1. On mémorise la fonction avec useCallback
const getFullImageUrl = useCallback((path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${R2_PUBLIC_URL}${cleanPath}`;
}, [R2_PUBLIC_URL]);

useEffect(() => {
  if (!currentSlug) {
    setLoading(false);
    return};

  const fetchArticle = async () => {
    try {
      const res = await api.get(`/articles/${currentSlug}`);
      const data = res.data;
      setTitle(data.title);
      setContent(data.content);
      setStatus(data.status);
      setImageUrl(data.imageUrl || '');
      if (data.imageUrl) {
        // 2. On utilise la fonction mémorisée
        setImagePreview(getFullImageUrl(data.imageUrl));
      }
      setTags(data.tags || []);
      setRawTags((data.tags || []).join(', '));
    } catch (err) {
      showToast({ type: 'error', message: "Erreur de chargement" });
    } finally {
      setLoading(false);
    }
  };

  fetchArticle();
}, [currentSlug, showToast, getFullImageUrl]); // 3. Maintenant, l'ajouter ici est 100% sûr

  async function handleManualUpload() {
    if (!imageFile || uploading) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile); // 'file' pour correspondre à routes/upload.ts
      formData.append('folder', 'articles');
      
      const res = await api.post('/upload', formData);
      const newImageKey = res.data.imageUrl; // Récupère la Key R2
      
      setImageUrl(newImageKey); 
      setImagePreview(getFullImageUrl(newImageKey));
      setImageFile(null);
      showToast({ type: 'success', message: 'Image mise à jour sur R2 !' });
    } catch (err) {
      showToast({ type: 'error', message: "Échec de l'envoi de l'image." });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // On prépare l'objet JSON pour le PUT
      const updateData = {
        title,
        content,
        imageUrl, // On envoie la Key R2 stockée
        tags,
        status
      };

      await api.put(`/articles/${currentSlug}`, updateData);

      showToast({ type: 'success', message: 'Article mis à jour avec succès !' });
      navigate(`/articles/${currentSlug}`);
    } catch (err: any) {
      showToast({ type: 'error', message: "Erreur lors de la sauvegarde de l'article" });
    } finally {
      setSubmitting(false);
    }
  }

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    setTags(value.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0));
  };

  if (loading) return <div className="loading">Chargement de l'article...</div>;

  return (
    <div className="new-article-v2">
      <header className="editor-header">
        <div className="header-container">
          <Link to={`/articles/${currentSlug}`} className="back-link">← Annuler</Link>
          <div className="view-switcher">
            <button type="button" onClick={() => setViewMode('edit')} className={viewMode === 'edit' ? 'active' : ''}>Édition</button>
            <button type="button" onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>Aperçu</button>
          </div>
          <div className="final-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </select>
            <button onClick={handleSubmit} className="btn-publish" disabled={submitting || uploading}>
              {submitting ? 'Sauvegarde...' : 'Mettre à jour'}
            </button>
          </div>
        </div>
      </header>

      <main className="editor-content-area">
        {viewMode === 'edit' ? (
          <div className="edit-stack">
            <section className="meta-section">
              <div className="image-uploader">
                <label>Image de couverture (R2 Storage)</label>
                <div className="upload-row">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) setImagePreview(URL.createObjectURL(file));
                  }} />
                  {imageFile && (
                    <button type="button" onClick={handleManualUpload} disabled={uploading} className="btn-validate-upload">
                      {uploading ? 'Upload...' : 'Remplacer l\'image'}
                    </button>
                  )}
                </div>
                {imagePreview && <img src={imagePreview} className="mini-preview" alt="Aperçu" />}
              </div>
              <div className="tag-box">
                <label>Tags</label>
                <input value={rawTags} onChange={(e) => handleTagsChange(e.target.value)} placeholder="devsecops, infrastructure, docker..." />
              </div>
            </section>

            <input className="main-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'article" />
            
            <TiptapEditor value={content} onChange={setContent} />
          </div>
        ) : (
          <article className="full-preview">
            {imagePreview && <img src={imagePreview} className="cover-img" alt="cover" />}
            <h1 className="preview-title">{title}</h1>
            <div className="preview-body" dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        )}
      </main>
    </div>
  );
}