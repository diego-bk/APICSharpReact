const BASE_URL = 'https://localhost:7009';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string,string> || {}),
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export interface Veterinario {
  veterinarioId?: number;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  especialidad?: string;
}

export const getVeterinarios = async (): Promise<Veterinario[]> => {
  return request('/api/veterinarios');
};

export const getVeterinario = async (id: number): Promise<Veterinario> => {
  return request(`/api/veterinarios/${id}`);
};

export const createVeterinario = async (veterinario: Veterinario): Promise<Veterinario> => {
  return request('/api/veterinarios', {
    method: 'POST',
    body: JSON.stringify(veterinario),
  });
};

export const updateVeterinario = async (id: number, veterinario: Veterinario): Promise<void> => {
  await request(`/api/veterinarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(veterinario),
  });
};

export const deleteVeterinario = async (id: number): Promise<void> => {
  await request(`/api/veterinarios/${id}`, {
    method: 'DELETE',
  });
};
