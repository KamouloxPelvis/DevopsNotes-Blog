// src/components/RelatedArticles.tsx
import { Article } from "../types/articles";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

type RelatedArticlesProps = {
  currentArticle: Article;
  allArticles: Article[];
};

export function RelatedArticles({ currentArticle, allArticles }: RelatedArticlesProps) {
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
                <img src={`${API_URL}${article.imageUrl}`} alt={article.title} />
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