const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.token ? { Authorization: `Bearer ${localStorage.token}` } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Error(error.message || 'Request failed');
  }

  return response.status === 204 ? null : response.json();
}
