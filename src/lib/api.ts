const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9052/api';

async function request<T = any>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed');
  }
  return data as T;
}

export const Api = {
  signup: (payload: Record<string, unknown>) =>
    request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload: Record<string, unknown>) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  listUsers: (token: string) =>
    request('/users', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getUser: (token: string, id: string) =>
    request(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateUser: (token: string, id: string, payload: Record<string, unknown>) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` }
    }),
  uploadProfileImage: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/uploads/profile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Upload failed');
    }
    return data as { path: string };
  }
};
