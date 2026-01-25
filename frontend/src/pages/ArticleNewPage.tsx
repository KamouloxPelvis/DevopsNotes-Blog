import { FormEvent, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { notifyGoogleIndexing } from '../services/googleIndexingService';
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
  }, [R2_PUBLIC_URL]); // Elle ne changera que si R2_PUBLIC_URL change
  
  useEffect(() => {
    if (!currentSlug) {
      setLoading(false);  
      return
    };
  
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
  }, [currentSlug, showToast, getFullImageUrl]);
  
  // On utilise le champ 'file' pour correspondre à ton routes/upload.ts
  async function handleManualUpload() {
    if (!imageFile || uploading) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile); // 'file' match avec upload.single('file')
      formData.append('folder', 'articles');
      
      const res = await api.post('/upload', formData);
      const newImageKey = res.data.imageUrl; // Ton service R2 renvoie la Key (fileKey)
      
      setImageUrl(newImageKey); 
      setImagePreview(getFullImageUrl(newImageKey));
      setImageFile(null);
      showToast({ type: 'success', message: 'Image validée et stockée sur R2 !' });
    } catch (err) {
      showToast({ type: 'error', message: "Échec de l'upload. Vérifiez le format (WebP/JPG/PNG)." });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Pour le submit, on reste sur du JSON si l'image est déjà uploadée via handleManualUpload
      // OU on peut passer en FormData si on veut supporter l'upload direct au submit.
      // Ici, on utilise la Key déjà stockée dans imageUrl.
      
      const articleData = {
        title,
        content,
        imageUrl, // La Key R2
        tags,
        status
      };

      if (currentSlug) {
        await api.put(`/articles/${currentSlug}`, articleData);
        showToast({ type: 'success', message: 'Article mis à jour !' });
      } else {
        const res = await api.post('/articles', articleData);
        showToast({ type: 'success', message: 'Article créé !' });
        navigate(`/articles/${res.data.slug}`);
      }
    } catch (err: any) {
      showToast({ type: 'error', message: "Erreur lors de l'enregistrement" });
    } finally {
      setSubmitting(false);
    }
  }

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    setTags(value.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0));
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="new-article-v2">
      <header className="editor-header">
        <div className="header-container">
          <Link to={currentSlug ? `/articles/${currentSlug}` : "/articles"} className="back-link">← Annuler</Link>
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
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
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
                  {imageFile && (
                    <button type="button" onClick={handleManualUpload} className="btn-validate-upload" disabled={uploading}>
                      {uploading ? 'Upload...' : 'Uploader sur R2'}
                    </button>
                  )}
                </div>
                {imagePreview && <img src={imagePreview} className="mini-preview" alt="preview" />}
              </div>
              <div className="tag-box">
                <label>Tags</label>
                <input value={rawTags} onChange={(e) => handleTagsChange(e.target.value)} placeholder="tag1, tag2..." />
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