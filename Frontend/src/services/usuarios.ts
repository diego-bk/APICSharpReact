const BASE_URL = 'https://localhost:7009';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText || 'Request failed');
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export async function getUsuarios() {
  return request('/api/usuarios');
}

export async function getUsuario(id: number) {
  return request(`/api/usuarios/${id}`);
}

export async function createUsuario(payload: any) {
  return request('/api/usuarios', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateUsuario(id: number, payload: any) {
  return request(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteUsuario(id: number) {
  return request(`/api/usuarios/${id}`, { method: 'DELETE' });
}
