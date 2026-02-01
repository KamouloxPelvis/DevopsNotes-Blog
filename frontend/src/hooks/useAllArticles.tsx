import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Article } from '../types/articles';
import NProgress from 'nprogress';

export const useAllArticles = (page = 1, limit = 4) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        NProgress.start();
        
        const response = await api.get(`/articles?page=${page}&limit=${limit}`);
        console.log("Data API:", response.data); 

        if (response.data && Array.isArray(response.data.items)) {
            setArticles(response.data.items); 
            setTotalPages(response.data.pages || 1); 
        } else if (Array.isArray(response.data)) {
            setArticles(response.data);
            setTotalPages(1);
        }

      } catch (err: any) {
        setError(err.message || 'Erreur chargement articles');
      } finally {
        setLoading(false);
        NProgress.done();
      }
    };

    fetchArticles();
  }, [page, limit]); // Le hook se relance quand la page change

  return { articles, totalPages, loading, error };
};