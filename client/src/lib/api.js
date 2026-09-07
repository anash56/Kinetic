const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Error(error.message || 'Request failed');
  }

  return response.status === 204 ? null : response.json();
}
