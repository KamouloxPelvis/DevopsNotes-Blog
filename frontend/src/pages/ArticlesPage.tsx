import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 
import { useAuth } from '../context/AuthContext';
import { useAllArticles } from '../hooks/useAllArticles';
import { Article } from '../types/articles';
import MarkdownPreview from '../components/MarkdownPreview';
import { Heart, Eye, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/ArticlesPage.css';

type CommentCountMap = Record<string, number>;
type LikeCountMap = Record<string, number>;

export function ArticlesPage() {
  // 1. ÉTAT DE LA PAGE & DONNÉES
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { articles, totalPages, loading } = useAllArticles(page);

  // États pour les interactions (Likes, Commentaires)
  const [commentCounts, setCommentCounts] = useState<CommentCountMap>({});
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [localLikeCounts, setLocalLikeCounts] = useState<LikeCountMap>({}); // Pour l'affichage instantané
  const [isLiking, setIsLiking] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const R2_PUBLIC_URL = process.env.REACT_APP_R2_PUBLIC_URL ?? "https://resources.devopsnotes.org";

  // 2. EFFETS SECONDAIRES (Likes initiaux & Commentaires)
  useEffect(() => {
    if (articles.length === 0) return;

    // A. Initialiser les likes de l'utilisateur
    if (user) {
      const initialLikes = new Set<string>();
      articles.forEach((a: Article) => {
        if (a.likedBy?.some((id: any) => id.toString() === user.id)) {
          initialLikes.add(a.slug);
        }
      });
      setLikedArticles(initialLikes);
    }

    // B. Récupérer le nombre de commentaires
    const loadCounts = async () => {
      const counts: CommentCountMap = {};
      await Promise.all(
        articles.map(async (a: Article) => {
          try {
            const res = await api.get(`/articles/${a.slug}/comments/count`);
            counts[a.slug] = res.data.count;
          } catch {
            counts[a.slug] = 0;
          }
        })
      );
      setCommentCounts(counts);
    };
    loadCounts();
  }, [articles, user]);

  // 3. LOGIQUE DES LIKES
  const handleLike = async (slug: string, currentLikes: number) => {
    if (!user) {
      alert("Connectez-vous pour aimer cet article !");
      return;
    }
    if (isLiking === slug) return;

    try {
      setIsLiking(slug);
      // Appel API
      const res = await api.post(`/articles/${slug}/like`);
      const { hasLiked, likes } = res.data;

      // Mise à jour locale immédiate (Optimistic UI)
      setLikedArticles(prev => {
        const newSet = new Set(prev);
        if (hasLiked) newSet.add(slug);
        else newSet.delete(slug);
        return newSet;
      });

      setLocalLikeCounts(prev => ({
        ...prev,
        [slug]: likes 
      }));

    } catch (error) {
      console.error('Erreur like:', error);
    } finally {
      setIsLiking(null);
    }
  };

  // 4. FILTRES (Search + Tags)
  // Note: Avec la pagination serveur, ceci ne filtre que la page courante.
  const filteredArticles = useMemo(() => {
    return articles.filter((article: Article) => {
      const matchesTag = activeTag === null || (article.tags || []).includes(activeTag);
      const term = searchTerm.toLowerCase();
      const matchesSearch = term === '' || 
        (article.title || '').toLowerCase().includes(term) ||
        (article.content || '').toLowerCase().includes(term);
      return matchesTag && matchesSearch;
    });
  }, [articles, activeTag, searchTerm]);

  // Liste de tous les tags visibles
  const allTags = useMemo(() => {
    const tags = new Set(articles.flatMap((a: Article) => a.tags || []));
    return Array.from(tags).filter(Boolean).sort();
  }, [articles]);

  // 5. COMPOSANT DE PAGINATION (Réutilisable)
  const PaginationNav = () => (
  <div className="pagination-container">
    <div className="pagination-dots-wrapper">
      <button 
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="pagination-arrow-btn"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="pagination-pages-list">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`pagination-number ${page === i + 1 ? 'active' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button 
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="pagination-arrow-btn"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

  // 6. RENDU
  return (
    <div className="articles-content fade-in-page">
      {/* HEADER & RECHERCHE */}
      <div className="articles-header-v2">
        <div className="articles-search-wrapper">
          <input
            type="text"
            className="articles-search"
            placeholder="Rechercher une pépite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="articles-actions-v2">
          <div className="nav-buttons flex gap-2">
            <Link to="/forum" className="btn btn-secondary">Forum</Link>
            {user && <Link to="/chat" className="btn btn-secondary">Chat</Link>}
          </div>
          {isAdmin && (
            <Link to="/articles/new" className="btn btn-primary admin-new-btn">
              <span className="full-text">+ Nouvel article</span>
              <span className="mobile-icon">+</span>
            </Link>
          )}
        </div>
      </div>

      {/* TAGS */}
      <div className="articles-filters-v2">
        <div className="tags-grid-v2">
          <button 
            className={`tag-pill ${activeTag === null ? 'active' : ''}`} 
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button 
              key={tag} 
              className={`tag-pill ${activeTag === tag ? 'active' : ''}`} 
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* --- PAGINATION HAUT --- */}
      {!loading && totalPages > 1 && <PaginationNav />}

      {/* GRILLE D'ARTICLES */}
      <div className="articles-grid-v2">
        {loading ? (
          /* SQUELETTES DE CHARGEMENT */
          [...Array(4)].map((_, i) => (
            <div key={i} className="article-card-v2">
              <div className="skeleton-loader" style={{ height: '200px', width: '100%' }} />
              <div style={{ padding: '1.25rem' }}>
                <div className="skeleton-loader" style={{ height: '24px', width: '80%', marginBottom: '10px' }} />
                <div className="skeleton-loader" style={{ height: '16px', width: '100%' }} />
              </div>
            </div>
          ))
        ) : (
          /* CARTES RÉELLES */
          filteredArticles.map((article: Article, index: number) => {
            const isLiked = likedArticles.has(article.slug);
            // On prend le count local si dispo, sinon celui de l'article
            const likesCount = localLikeCounts[article.slug] ?? article.likes ?? 0;
            
            // Gestion URL Image
            const imageUrl = article.imageUrl 
              ? (article.imageUrl.startsWith('http') 
                  ? article.imageUrl 
                  : `${R2_PUBLIC_URL}${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`)
              : null;

            return (
              <div key={article._id} className="article-card-v2">
                <div className="article-image-v2">
                  {imageUrl ? (
                    <img
                      src={imageUrl} 
                      alt={article.title}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="image-fallback">
                      <span className="fallback-logo">devopsnotes</span>
                    </div>
                  )}
                </div>

                <div className="article-content-v2">
                  <h3 className="article-title-v2">
                    {article.title}
                    {article.status === 'draft' && <span className="draft-badge">Brouillon</span>}
                  </h3>
                  
                  <div className="article-excerpt">
                    <MarkdownPreview 
                      content={(article.excerpt || article.content || '').slice(0, 300) + '...'}
                      className="preview-card-clean" 
                    />
                  </div>

                  <div className="article-tags-v2">
                    {(article.tags || []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>

                  <div className="article-stats-v2">
                    <button 
                      className={`stat-btn like-btn ${isLiked ? 'active' : ''}`} 
                      onClick={() => handleLike(article.slug, likesCount)}
                      disabled={isLiking === article.slug}
                      // On retire le style inline pour laisser le CSS gérer la couleur
                    >
                      <Heart 
                        size={18} 
                        fill={isLiked ? "currentColor" : "none"} 
                        strokeWidth={2.5}
                      /> 
                      <span className="stat-value">{likesCount}</span>
                    </button>

                    <div className="stat-btn">
                      <Eye size={18} strokeWidth={2.5} /> 
                      <span className="stat-value">{article.views ?? 0}</span>
                    </div>

                    <div className="stat-btn comments-count">
                      <MessageSquare size={18} strokeWidth={2.5} /> 
                      <span className="stat-value">{commentCounts[article.slug] ?? 0}</span>
                    </div>
                  </div>

                  <div className="article-footer-v2">
                    <Link to={`/articles/${article.slug}`} className="btn btn-primary">Lire l'article</Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}