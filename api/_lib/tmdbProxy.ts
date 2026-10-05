const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type AllowedRoute = {
  path: RegExp;
  // Query params forwarded to TMDB; anything else is dropped so callers cannot widen the request.
  params: readonly string[];
};

// Only the TMDB endpoints the app actually uses are reachable through the proxy.
const ALLOWED_ROUTES: readonly AllowedRoute[] = [
  { path: /^search\/movie$/, params: ['query', 'language', 'include_adult', 'page'] },
  { path: /^movie\/\d+$/, params: ['language', 'append_to_response'] },
  { path: /^trending\/movie\/week$/, params: ['language', 'page'] },
  { path: /^movie\/(popular|now_playing)$/, params: ['language', 'page'] },
  { path: /^genre\/movie\/list$/, params: ['language'] },
  {
    path: /^discover\/movie$/,
    params: [
      'language',
      'include_adult',
      'page',
      'sort_by',
      'with_genres',
      'primary_release_year',
      'vote_average.gte',
      'vote_count.gte',
    ],
  },
];

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
  // On Vercel the rewrite passes the target path as ?path=...; the pathname is the fallback.
  const path = url.searchParams.get('path') ?? url.pathname.replace(/^\/api\/tmdb\//, '');
  url.searchParams.delete('path');

  const route = ALLOWED_ROUTES.find((candidate) => candidate.path.test(path));

  if (!route) {
    return json({ error: 'Not found' }, 404);
  }

  const forwarded = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (route.params.includes(key)) {
      forwarded.append(key, value);
    }
  });
  const search = forwarded.size > 0 ? `?${forwarded}` : '';

  let upstream: Response;

  try {
    upstream = await fetchImpl(`${TMDB_BASE_URL}/${path}${search}`, {
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
