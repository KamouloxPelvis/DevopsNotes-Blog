import { jwtDecode } from 'jwt-decode';

/** Décoder le JWT pour récupérer id / role */
type JwtPayload = {
  id?: string;
  role?: string;
  email?: string;
  exp?: number;
};

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


export function getCurrentUser(): JwtPayload | null {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch {
    return null;
  }
}
