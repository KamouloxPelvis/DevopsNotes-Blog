import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { useToast } from '../context/ToastContext';
import TiptapEditor from '../components/Editor'; // Ton nouvel éditeur
import '../styles/ArticleNewPage.css';

export default function NewArticle() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // --- ÉTATS DU FORMULAIRE ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Maintenant du HTML via TipTap
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // --- ÉTATS D'INTERFACE ---
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  async function handleManualUpload() {
  if (!imageFile || uploading) return;
  try {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const res = await api.post('/articles/upload', formData);
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
    if (!title.trim()) {
      showToast({ type: 'error', message: "Le titre est obligatoire." });
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/upload', formData);
        finalImageUrl = uploadRes.data.imageUrl;
      }

      const res = await api.post('/articles', {
        title,
        content, // HTML envoyé au backend
        imageUrl: finalImageUrl,
        tags,
        status
      });

      showToast({ type: 'success', message: 'Article créé !' });
      navigate(`/articles/${res.data.slug}`);
    } catch (err: any) {
      showToast({ type: 'error', message: "Erreur lors de la création." });
    } finally {
      setSubmitting(false);
    }
  }

  const handleTagsChange = (value: string) => {
    setRawTags(value);
    setTags(value.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0));
  };

  return (
    <div className="new-article-v2">
      <header className="editor-header">
        <div className="header-container">
          <Link to="/articles" className="back-link">← Annuler</Link>
          <div className="view-switcher">
            <button aria-label="Mode Édition" type="button" onClick={() => setViewMode('edit')} className={viewMode === 'edit' ? 'active' : ''}>Édition</button>
            <button aria-label="Mode Aperçu" type="button" onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>Aperçu</button>
          </div>
          <div className="final-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </select>
            <button aria-label="Créer l'article" onClick={handleSubmit} className="btn-publish" disabled={submitting || uploading}>
              {submitting ? 'Création...' : "Créer l'article"}
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
                  <button type="button" onClick={handleManualUpload} disabled={!imageFile || uploading}>Valider</button>
                </div>
                {imagePreview && <img src={imagePreview} className="mini-preview" alt="preview" />}
              </div>
              <div className="tag-box">
                <label>Tags</label>
                <input value={rawTags} onChange={(e) => handleTagsChange(e.target.value)} placeholder="docker, react..." />
              </div>
            </section>

            <input className="main-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'article..." />
            
            <TiptapEditor value={content} onChange={setContent} />
          </div>
        ) : (
          <article className="full-preview">
            {imagePreview && <img src={imagePreview} className="cover-img" alt="cover" />}
            <h1 className="preview-title">{title || "Titre de l'aperçu"}</h1>
            <div className="preview-body" dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        )}
      </main>
    </div>
  );
}