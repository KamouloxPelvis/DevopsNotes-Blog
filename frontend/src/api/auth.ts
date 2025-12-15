const API_URL = 'http://localhost:5000';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  const token = (data as { token: string }).token;
  localStorage.setItem('devopsnotes_token', token);
  return token;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('devopsnotes_token');
}

export function logout() {
  localStorage.removeItem('devopsnotes_token');
}
