import api from './axios'; // Instance configurée avec withCredentials: true
import { ForumThread, Reply } from '../types/forum';

// --- RECUPERATION (GET) ---

export async function getThreads(): Promise<ForumThread[]> {
  const response = await api.get<ForumThread[]>('/forum/threads');
  return response.data;
}

export async function getThread(id: string): Promise<ForumThread> {
  const response = await api.get<ForumThread>(`/forum/threads/${id}`);
  return response.data;
}

export async function getReplies(threadId: string): Promise<Reply[]> {
  const response = await api.get<Reply[]>(`/forum/threads/${threadId}/replies`);
  return response.data;
}

// --- ECRITURE (POST / PUT / DELETE) ---

export async function createThread(payload: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<ForumThread> {
  // Axios envoie automatiquement le cookie 'token' grâce à withCredentials: true
  const response = await api.post<ForumThread>('/forum/threads', payload);
  return response.data;
}

export async function updateThread(
  id: string, 
  payload: { title: string; content: string; tags: string[] }
): Promise<ForumThread> {
  const response = await api.put<ForumThread>(`/forum/threads/${id}`, payload);
  return response.data;
}

export async function deleteThread(id: string): Promise<void> {
  await api.delete(`/forum/threads/${id}`);
}

export async function createReply(threadId: string, content: string): Promise<Reply> {
  const response = await api.post<Reply>(`/forum/threads/${threadId}/replies`, { content });
  return response.data;
}