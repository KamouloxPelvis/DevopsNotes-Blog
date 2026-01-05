  import { FormEvent, useEffect, useState, useRef } from 'react';
  import { useNavigate, useParams, Link } from 'react-router-dom';
  import api from '../../api/axios'; 
  import { useToast } from '../../context/ToastContext';
  import TextToolbar from '../../components/TextToolbar';
  import MarkdownPreview from '../../components/MarkdownPreview';
  import '../../styles/NewArticlePage.css';

  export default function EditArticle() {
    const { slug: currentSlug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    // --- ÉTATS ---
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState(''); 
    const [tags, setTags] = useState<string[]>([]);
    const [rawTags, setRawTags] = useState('');
    const [submitting, setSubmitting] = useState(false); // AJOUTÉ : Correction erreur terminal
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [loading, setLoading] = useState(true);

    const API_ROOT = process.env.REACT_APP_ROOT ?? 'http://localhost:5000';

    useEffect(() => {
      if (!currentSlug) return;
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/articles/${currentSlug}`);
          const data = res.data;
          setTitle(data.title);
          setContent(data.content);
          setStatus(data.status);
          const dbPath = data.imageUrl || '';
          setImageUrl(dbPath);
          if (dbPath) {
            setImagePreview(dbPath.startsWith('http') ? dbPath : `${API_ROOT}${dbPath}`);
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
    }, [currentSlug, showToast, API_ROOT]);

    // Upload manuel via bouton "Valider"
    async function handleManualUpload() {
      if (!imageFile || uploading) return;
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await api.post('/upload', formData);
        const relativePath = res.data.imageUrl;
        setImageUrl(relativePath); 
        setImagePreview(`${API_ROOT}${relativePath}`);
        setImageFile(null);
        showToast({ type: 'success', message: 'Nouvelle image validée !' });
      } catch (err) {
        showToast({ type: 'error', message: "Échec de l'upload" });
      } finally {
        setUploading(false);
      }
    }

    // Soumission finale
    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
      setSubmitting(true);
      try {
        let finalImageUrl = imageUrl;
        
        // Sécurité : si un fichier est sélectionné mais pas encore "Validé" manuellement
        if (imageFile) {
          const formData = new FormData();
          formData.append('file', imageFile);
          const uploadRes = await api.post('/upload', formData);
          finalImageUrl = uploadRes.data.imageUrl;
        }

        await api.put(`/articles/${currentSlug}`, {
          title,
          content,
          imageUrl: finalImageUrl, // Correction : on n'envoie plus ""
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

    if (loading) return <div className="loading">Chargement...</div>;

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
                    <button type="button" onClick={handleManualUpload} disabled={!imageFile || uploading}>Valider</button>
                  </div>
                  {imagePreview && (
                    <div className="preview-container">
                      <img src={imagePreview} className="mini-preview" alt="preview" />
                      {imageFile && <span className="warning-badge">Upload nécessaire</span>}
                      {imageUrl && !imageFile && <span className="upload-badge">✅ Synchronisé</span>}
                    </div>
                  )}
                </div>
                <div className="tag-box"><label>Tags</label><input value={rawTags} onChange={(e) => handleTagsChange(e.target.value)} /></div>
              </section>
              <input className="main-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'article" />
              <TextToolbar content={content} setContent={setContent} textAreaRef={textAreaRef} />
              <textarea ref={textAreaRef} className="main-textarea" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          ) : (
            <article className="full-preview">
              {imagePreview && <img src={imagePreview} className="cover-img" alt="cover" />}
              <h1>{title}</h1>
              <MarkdownPreview content={content} />
            </article>
          )}
        </main>
      </div>
    );
  }