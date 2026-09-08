const API_ORIGIN = 'https://kinetic-kgeo.onrender.com';

const forwardedHeaders = (req) => {
  const headers = {};
  for (const name of ['accept', 'authorization', 'content-type', 'cookie']) {
    const value = req.headers[name];
    if (value) headers[name] = value;
  }
  return headers;
};

const requestBody = (req) => {
  if (['GET', 'HEAD'].includes(req.method)) return undefined;
  if (typeof req.body === 'string') return req.body;
  return req.body === undefined ? undefined : JSON.stringify(req.body);
};

export default async function handler(req, res) {
  const incomingUrl = new URL(req.url, 'https://vercel.local');
  let backendPath = incomingUrl.pathname;
  while (backendPath.startsWith('/api/')) backendPath = backendPath.slice(4);
  if (!backendPath.startsWith('/')) backendPath = `/${backendPath}`;
  backendPath = backendPath || '/';
  const targetUrl = `${API_ORIGIN}/api${backendPath}${incomingUrl.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardedHeaders(req),
      body: requestBody(req),
    });

    const setCookie = response.headers.getSetCookie?.() ||
      (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : []);
    if (setCookie?.length) res.setHeader('set-cookie', setCookie);

    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);

    if (req.method === 'HEAD' || response.status === 204) return res.end();
    return res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(502).json({ message: 'API unavailable.' });
  }
}