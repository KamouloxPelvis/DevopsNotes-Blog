import { Article } from '../types/articles';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface CreateArticlePayload {
  title: string;
  content: string;
  tags?: string[];
}

export async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${API_URL}/articles`);
  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.status}`);
  }
  return res.json();
}

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

export async function createArticle(payload: CreateArticlePayload): Promise<Article> {
  const res = await fetch(`${API_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Failed to create article: ${res.status}`);
  }

  return res.json();
}
