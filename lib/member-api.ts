const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');
const TOKEN_KEY = 'qev_member_token';

export function getMemberToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setMemberToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Authenticated fetch against the v1 API with the member bearer token. */
export async function memberFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getMemberToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${API_BASE}/api/v1${path}`, { ...init, headers });
}
