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

export interface Cita {
  citaId?: number;
  mascotaId: number;
  veterinarioId: number;
  fechaHora: string;
  estado: string;
  mascota?: {
    mascotaId: number;
    nombre: string;
    cliente?: {
      nombreCompleto: string;
    };
  };
  veterinario?: {
    veterinarioId: number;
    nombreCompleto: string;
  };
}

export const getCitas = async (): Promise<Cita[]> => {
  return request('/api/citas');
};

export const getCita = async (id: number): Promise<Cita> => {
  return request(`/api/citas/${id}`);
};

export const createCita = async (cita: Cita): Promise<Cita> => {
  return request('/api/citas', {
    method: 'POST',
    body: JSON.stringify(cita),
  });
};

export const updateCita = async (id: number, cita: Cita): Promise<void> => {
  await request(`/api/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cita),
  });
};

export const deleteCita = async (id: number): Promise<void> => {
  await request(`/api/citas/${id}`, {
    method: 'DELETE',
  });
};
