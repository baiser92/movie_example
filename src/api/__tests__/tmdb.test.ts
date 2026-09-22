import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getMovieDetails, searchMovies } from '../tmdb';

beforeEach(() => {
  vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', 'fake-token');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('searchMovies', () => {
  it('sends the auth token, the page, and returns mapped movies with pagination info', async () => {
    const mockResponse = {
      page: 1,
      total_pages: 5,
      results: [
        {
          id: 100,
          title: 'Mocked',
          overview: '...',
          poster_path: '/abc.jpg',
          release_date: '2020-01-01',
          vote_average: 8.5,
        },
      ],
    };

    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchMovies('x', 1);

    expect(result.movies).toHaveLength(1);
    expect(result.movies[0].id).toBe(100);
    expect(result.movies[0].posterPath).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(5);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({ search: expect.stringContaining('page=1') }),
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-token' },
      }),
    );
  });

  it('throws a descriptive error when the token is missing', async () => {
    vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', '');

    await expect(searchMovies('x', 1)).rejects.toThrow(/VITE_TMDB_ACCESS_TOKEN/);
  });

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, status: 401 }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchMovies('x', 1)).rejects.toThrow('TMDB request failed: 401');
  });

  it('throws when the response does not match the expected shape', async () => {
    const malformedResponse = {
      page: 1,
      total_pages: 5,
      results: [{ id: 100, title: 'Mocked' }],
    };

    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(malformedResponse) }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchMovies('x', 1)).rejects.toThrow(/did not match the expected shape/);
  });
});

describe('getMovieDetails', () => {
  it('returns mapped movie detail with genres and cast', async () => {
    const mockResponse = {
      id: 42,
      title: 'Mocked Detail',
      overview: '...',
      poster_path: '/abc.jpg',
      release_date: '2020-01-01',
      vote_average: 8.5,
      tagline: 'A tagline',
      runtime: 120,
      genres: [{ id: 1, name: 'Drama' }],
      credits: {
        cast: [{ id: 1, name: 'Actor One', character: 'Role One' }],
      },
    };

    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    const movie = await getMovieDetails(42);

    expect(movie.id).toBe(42);
    expect(movie.genres).toEqual(['Drama']);
    expect(movie.cast).toEqual([{ id: 1, name: 'Actor One', character: 'Role One' }]);
    expect(movie.runtime).toBe(120);
  });

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, status: 404 }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovieDetails(42)).rejects.toThrow('TMDB request failed: 404');
  });
});
