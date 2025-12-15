// src/api/articles.ts
import { Article } from '../types/articles';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface CreateArticlePayload {
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface ArticlesResponse {
  items: Article[];
  total: number;
  page: number;
  pages: number;
}

// Liste paginée d'articles
export async function getArticles(
  page = 1,
  limit = 6
): Promise<ArticlesResponse> {
  const res = await fetch(`${API_URL}/articles?page=${page}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.status}`);
  }
  const data = await res.json();
  return data as ArticlesResponse;
}

// Un article par slug
export async function getArticle(slug: string): Promise<Article> {
  const res = await fetch(`${API_URL}/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Article not found');
    }
    throw new Error(`Failed to fetch article: ${res.status}`);
  }
  return res.json();
}

// Création d'article
export async function createArticle(
  payload: CreateArticlePayload
): Promise<Article> {
  const res = await fetch(`${API_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // pas de body JSON, on laisse data = null
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      `Failed to create article: ${res.status}`;
    throw new Error(msg);
  }

  return data as Article;
}
