import { FormEvent, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!currentSlug) return;
    const fetchArticle = async () => {
      try {
        const res = await api.get(`/articles/${currentSlug}`);
        const data = res.data;
        setTitle(data.title);
        setContent(data.content);
        setStatus(data.status);
        setImageUrl(data.imageUrl || '');
        if (data.imageUrl) {
          setImagePreview(data.imageUrl.startsWith('http') ? data.imageUrl : `${R2_PUBLIC_URL}${data.imageUrl}`);
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
  }, [currentSlug, showToast, R2_PUBLIC_URL]);

  async function handleManualUpload() {
  if (!imageFile || uploading) return;
  try {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const res = await api.post('/upload', formData);
    const newImageUrl = res.data.imageUrl;
    
    setImageUrl(newImageUrl); 
    setImagePreview(newImageUrl);
    setImageFile(null);
    showToast({ type: 'success', message: 'Image envoyée sur R2 !' });
  } catch (err) {
    showToast({ type: 'error', message: "Échec de l'upload." });
  } finally {
    setUploading(false);
  }
}

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/upload', formData);
        finalImageUrl = uploadRes.data.imageUrl;
      }

      await api.put(`/articles/${currentSlug}`, {
        title,
        content,
        imageUrl: finalImageUrl,
        tags,
        status
      });

      showToast({ type: 'success', message: 'Article mis à jour !' });
      navigate(`/articles/${currentSlug}`);
    } catch (err) {
      showToast({ type: 'error', message: "Erreur de sauvegarde" });
    } finally {
      setSubmitting(false);
    }
  }

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    setTags(value.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0));
  };

  if (loading) return <div className="loading">Chargement de l'éditeur...</div>;

  return (
    <div className="new-article-v2">
      <header className="editor-header">
        <div className="header-container">
          <Link to={`/articles/${currentSlug}`} className="back-link">← Annuler</Link>
          <div className="view-switcher">
            <button aria-label="Mode Édition" type="button" onClick={() => setViewMode('edit')} className={viewMode === 'edit' ? 'active' : ''}>Édition</button>
            <button aria-label="Mode Aperçu" type="button" onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>Aperçu</button>
          </div>
          <div className="final-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </select>
            <button aria-label="Mettre à jour" onClick={handleSubmit} className="btn-publish" disabled={submitting || uploading}>
              {submitting ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </div>
      </header>

      <main className="editor-content-area">
        {viewMode === 'edit' ? (
          <div className="edit-stack">
            <section className="meta-section">
              <div className="image-uploader">
                <label>Image de couverture</label>
                <div className="upload-row">
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    if (file) setImagePreview(URL.createObjectURL(file));
                  }} />
                  <button aria-label='Uploader une image' type="button" onClick={handleManualUpload} disabled={!imageFile || uploading}>Valider</button>
                </div>
                {imagePreview && <img src={imagePreview} className="mini-preview" alt="preview" />}
              </div>
              <div className="tag-box">
                <label>Tags</label>
                <input aria-label="Tags" value={rawTags} onChange={(e) => handleTagsChange(e.target.value)} />
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