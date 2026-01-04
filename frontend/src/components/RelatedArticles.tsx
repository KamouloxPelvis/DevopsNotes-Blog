import { Article } from "../types/articles";
import { Link } from "react-router-dom";

type RelatedArticlesProps = {
  currentArticle: Article;
  allArticles: Article[];
};

export function RelatedArticles({ currentArticle, allArticles }: RelatedArticlesProps) {
  // On définit la racine du serveur pour les images (http://localhost:5000)
  const API_ROOT = 'http://localhost:5000';

  const currentTags = currentArticle.tags || [];
  if (currentTags.length === 0) return null;

  const related = allArticles
    .filter((article) => article.slug !== currentArticle.slug)
    .map((article) => {
      const articleTags = article.tags || [];
      const commonTags = articleTags.filter((tag) => currentTags.includes(tag));
      return { ...article, relevance: commonTags.length };
    })
    .filter((article) => article.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="related-articles-section">
      <h3 className="related-section-title">Articles liés</h3>
      <div className="related-grid-v3">
        {related.map((article) => (
          <Link to={`/articles/${article.slug}`} key={article.slug} className="related-vignette">
            <div className="related-vignette-img">
              {article.imageUrl ? (
                <img 
                  // Correction de l'URL pour pointer vers le dossier static
                  src={article.imageUrl.startsWith('http') 
                    ? article.imageUrl 
                    : `${API_ROOT}${article.imageUrl}`} 
                  alt={article.title} 
                />
              ) : (
                <div className="img-placeholder">DevOps</div>
              )}
            </div>
            <div className="related-vignette-body">
              <h4>{article.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}