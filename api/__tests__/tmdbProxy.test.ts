import { describe, it, expect, vi } from 'vitest';
import { proxyTmdb } from '../_lib/tmdbProxy';

function makeRequest(path: string, method = 'GET') {
  return new Request(`https://example.com/api/tmdb/${path}`, { method });
}

function upstreamOk(body: unknown = { ok: true }) {
  return vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status: 200 })));
}

describe('proxyTmdb', () => {
  it('forwards an allowed request to TMDB with the bearer token and query string', async () => {
    const fetchMock = upstreamOk({ results: [] });

    const response = await proxyTmdb(
      makeRequest('search/movie?query=matrix&page=2'),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?query=matrix&page=2',
      { headers: { Authorization: 'Bearer secret' } },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ results: [] });
  });

  it('reads the target path from the ?path= param set by the Vercel rewrite', async () => {
    const fetchMock = upstreamOk();

    const response = await proxyTmdb(
      new Request('https://example.com/api/tmdb?path=search/movie&query=matrix'),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?query=matrix',
      expect.any(Object),
    );
  });

  it('rejects a rewrite request without a path', async () => {
    const fetchMock = upstreamOk();

    const response = await proxyTmdb(
      new Request('https://example.com/api/tmdb?path='),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows movie detail requests', async () => {
    const fetchMock = upstreamOk();

    const response = await proxyTmdb(
      makeRequest('movie/42?append_to_response=credits'),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/42?append_to_response=credits',
      expect.any(Object),
    );
  });

  it('sets cache headers on successful responses', async () => {
    const response = await proxyTmdb(
      makeRequest('movie/42'),
      'secret',
      upstreamOk() as unknown as typeof fetch,
    );

    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
  });

  it.each(['account', 'movie/abc', 'movie/42/credits', 'search/tv', '../account'])(
    'rejects paths that are not on the allowlist (%s) without calling TMDB',
    async (path) => {
      const fetchMock = upstreamOk();

      const response = await proxyTmdb(
        makeRequest(path),
        'secret',
        fetchMock as unknown as typeof fetch,
      );

      expect(response.status).toBe(404);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('rejects non-GET methods', async () => {
    const fetchMock = upstreamOk();

    const response = await proxyTmdb(
      makeRequest('search/movie?query=x', 'POST'),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 500 when the server token is not configured', async () => {
    const fetchMock = upstreamOk();

    const response = await proxyTmdb(
      makeRequest('search/movie?query=x'),
      undefined,
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propagates the upstream status without leaking the upstream body', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response('secret details', { status: 401 })));

    const response = await proxyTmdb(
      makeRequest('search/movie?query=x'),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain('secret details');
    expect(response.headers.get('Cache-Control')).toBeNull();
  });

  it('returns 502 when TMDB is unreachable', async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('network down')));

    const response = await proxyTmdb(
      makeRequest('search/movie?query=x'),
      'secret',
      fetchMock as unknown as typeof fetch,
    );

    expect(response.status).toBe(502);
  });
});
