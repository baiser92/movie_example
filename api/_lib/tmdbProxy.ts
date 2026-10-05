const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Only the TMDB endpoints the app actually uses are reachable through the proxy.
const ALLOWED_PATHS = [/^search\/movie$/, /^movie\/\d+$/];

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export async function proxyTmdb(
  request: Request,
  token: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' });
  }

  if (!token) {
    return json({ error: 'Server is missing TMDB_ACCESS_TOKEN' }, 500);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/tmdb\//, '');

  if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
    return json({ error: 'Not found' }, 404);
  }

  let upstream: Response;

  try {
    upstream = await fetchImpl(`${TMDB_BASE_URL}/${path}${url.search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return json({ error: 'Failed to reach TMDB' }, 502);
  }

  if (!upstream.ok) {
    return json({ error: `TMDB responded with ${upstream.status}` }, upstream.status);
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': CACHE_CONTROL },
  });
}
