const API_ORIGIN = 'https://kinetic-kgeo.onrender.com';

export default async function proxy(request) {
  const url = new URL(request.url);
  const isApi = url.pathname.startsWith('/api/') || url.pathname === '/api';
  if (!isApi) return undefined;

  const headers = new Headers(request.headers);
  headers.delete('host');

  let response;
  try {
    response = await fetch(`${API_ORIGIN}${url.pathname}${url.search}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.arrayBuffer(),
      redirect: 'manual',
    });
  } catch {
    return Response.json({ message: 'Backend unavailable.' }, { status: 502 });
  }

  const body = await response.arrayBuffer();
  const outHeaders = new Headers();

  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== 'content-length' && lower !== 'content-encoding') {
      outHeaders.set(key, value);
    }
  });

  return response.status === 204 || response.status === 304
    ? new Response(null, { status: response.status, headers: outHeaders })
    : new Response(body, { status: response.status, headers: outHeaders });
}