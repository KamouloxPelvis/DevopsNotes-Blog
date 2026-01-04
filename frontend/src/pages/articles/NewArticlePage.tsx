import { FormEvent, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios'; 
import { useToast } from '../../context/ToastContext';
import TextToolbar from '../../components/TextToolbar';
import MarkdownPreview from '../../components/MarkdownPreview';
import '../../styles/NewArticlePage.css';

export default function NewArticle() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- ÉTATS DU FORMULAIRE ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Stocke le chemin relatif du serveur (/uploads/...)
  const [tags, setTags] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // --- ÉTATS D'INTERFACE ---
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const API_ROOT = 'http://localhost:5000';

  /**
   * 1. LOGIQUE D'UPLOAD MANUEL (Bouton Valider)
   */
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
      setImageFile(null); // On vide le fichier local car il est maintenant sur le serveur
      showToast({ type: 'success', message: 'Image envoyée avec succès !' });
    } catch (err) {
      showToast({ type: 'error', message: "Échec de l'upload vers le serveur." });
    } finally {
      setUploading(false);
    }
  }

  /**
   * 2. SOUMISSION FINALE (Création de l'article)
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showToast({ type: 'error', message: "Le titre est obligatoire." });
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      
      // Sécurité : si un fichier est sélectionné mais que l'utilisateur n'a pas cliqué sur "Valider"
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/upload', formData);
        finalImageUrl = uploadRes.data.imageUrl;
      }

      // Requête POST pour créer l'article
      const res = await api.post('/articles', {
        title,
        content,
        imageUrl: finalImageUrl,
        tags,
        status
      });

      showToast({ type: 'success', message: 'Article créé avec succès !' });
      // Redirection vers l'article créé (en utilisant le slug renvoyé par le serveur)
      navigate(`/articles/${res.data.slug}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erreur lors de la création.";
      showToast({ type: 'error', message: msg });
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
            <button 
              type="button" 
              onClick={() => setViewMode('edit')} 
              className={viewMode === 'edit' ? 'active' : ''}
            >
              Édition
            </button>
            <button 
              type="button" 
              onClick={() => setViewMode('preview')} 
              className={viewMode === 'preview' ? 'active' : ''}
            >
              Aperçu
            </button>
          </div>
          <div className="final-actions">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Brouillon</option>
              <option value="published">Publier</option>
            </select>
            <button 
              onClick={handleSubmit} 
              className="btn-publish" 
              disabled={submitting || uploading}
            >
              {submitting ? 'Création...' : 'Créer l\'article'}
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
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={handleManualUpload} 
                    disabled={!imageFile || uploading}
                  >
                    {uploading ? 'Envoi...' : 'Valider'}
                  </button>
                </div>
                {imagePreview && (
                  <div className="preview-container">
                    <img src={imagePreview} className="mini-preview" alt="preview" />
                    {imageFile && <span className="warning-badge">À valider</span>}
                    {imageUrl && !imageFile && <span className="upload-badge">✅ Prêt</span>}
                  </div>
                )}
              </div>
              <div className="tag-box">
                <label>Tags (séparés par des virgules)</label>
                <input 
                  value={rawTags} 
                  onChange={(e) => handleTagsChange(e.target.value)} 
                  placeholder="ex: docker, ci-cd, react"
                />
              </div>
            </section>

            <input 
              className="main-title-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Titre de l'article technique..." 
            />
            
            <div className="toolbar-sticky">
              <TextToolbar content={content} setContent={setContent} textAreaRef={textAreaRef} />
            </div>

            <textarea 
              ref={textAreaRef} 
              className="main-textarea" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Écrivez votre contenu en Markdown ici..."
            />
          </div>
        ) : (
          <article className="full-preview">
            {imagePreview && <img src={imagePreview} className="cover-img" alt="cover" />}
            <h1 className="preview-title">{title || "Titre de l'aperçu"}</h1>
            <div className="preview-body">
              <MarkdownPreview content={content} />
            </div>
          </article>
        )}
      </main>
    </div>
  );
}