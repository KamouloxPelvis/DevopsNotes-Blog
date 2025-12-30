// frontend/src/api/forum.ts
import { ForumThread, Reply } from '../types/forum';
import { getAuthToken } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function fetchJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Fetch des posts
export function getThreads(): Promise<ForumThread[]> {
  return fetchJSON<ForumThread[]>(`${API_URL}/forum/threads`);
}

// Fetch d'un post
export function getThread(id: string): Promise<ForumThread> {
  return fetchJSON<ForumThread>(`${API_URL}/forum/threads/${id}`);
}

// Création du post
export function createThread(payload: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<ForumThread> {
  const token = getAuthToken();
  return fetchJSON<ForumThread>(`${API_URL}/forum/threads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

// ✅ FIX : Modification du post
export async function updateThread(
  id: string, 
  thread: { title: string; content: string; tags: string[] }, 
  token?: string
) {
  const res = await fetch(`${API_URL}/forum/threads/${id}`, {  // ✅ /forum/threads/
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(thread),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update thread');
  }

  return res.json();
}

// Affichage des réponses
export function getReplies(threadId: string): Promise<Reply[]> {
  return fetchJSON<Reply[]>(`${API_URL}/forum/threads/${threadId}/replies`);
}

// Création des réponses
export function createReply(threadId: string, content: string): Promise<Reply> {
  const token = getAuthToken();
  return fetchJSON<Reply>(`${API_URL}/forum/threads/${threadId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });
}
