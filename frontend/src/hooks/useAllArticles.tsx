// src/hooks/useAllArticles.tsx
import { useEffect, useState } from 'react';
import { Article } from '../types/articles';
import { getArticles, ArticlesResponse } from '../api/articles';

export function useAllArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getArticles(1, 100) // récupère "tous" les articles pour les liés
      .then((data: ArticlesResponse) => {
        setArticles(data.items);
      })
      .catch((err: any) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { articles, loading, error };
}
