// src/components/RelatedArticles.tsx
import { Article } from "../types/articles";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

type RelatedArticlesProps = {
  currentArticle: Article;
  allArticles: Article[];
};

export function RelatedArticles({
  currentArticle,
  allArticles,
}: RelatedArticlesProps) {
  // Sécurisation : on s'assure que c'est un tableau
  const currentTags = currentArticle.tags || [];

  if (currentTags.length === 0) return null;

  const related = allArticles
    .filter((article) => article.slug !== currentArticle.slug)
    .map((article) => {
      // Sécurisation ici aussi lors du calcul de pertinence
      const articleTags = article.tags || [];
      const commonTags = articleTags.filter((tag) =>
        currentTags.includes(tag)
      );
      return { ...article, relevance: commonTags.length };
    })
    .filter((article) => article.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="related-articles">
      <h3 className="related-title">Articles liés</h3>
      <div className="related-grid">
        {related.map((article) => (
          <article key={article.slug} className="related-card">
            {article.imageUrl && (
              <img
                src={`${API_URL}${article.imageUrl}`}
                alt={article.title}
                className="related-thumb"
              />
            )}

            <div className="related-body">
              <h4 className="related-heading">
                <Link to={`/articles/${article.slug}`}>{article.title}</Link>
              </h4>

              {/* ✅ CORRECTION ICI : Fallback sur chaîne vide si content est undefined */}
              <p className="related-excerpt">
                {(article.content || "").slice(0, 100)}…
              </p>

              <div className="related-tags">
                {/* Utilisation de l'optional chaining (?.) pour éviter le crash si tags est null */}
                {article.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/articles/${article.slug}`}
                className="related-link"
              >
                Lire l'article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}