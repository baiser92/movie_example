import { vi, describe, it, expect, afterEach } from 'vitest';
import {
  TmdbError,
  discoverMovies,
  getGenres,
  getMovieDetails,
  getMovieList,
  searchMovies,
} from '../tmdb';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('searchMovies', () => {
  it('calls the proxy without credentials, sends the page, and returns mapped movies with pagination info', async () => {
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
    const [calledUrl, options] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl.pathname).toBe('/api/tmdb/search/movie');
    expect(calledUrl.searchParams.get('page')).toBe('1');
    expect(calledUrl.searchParams.get('query')).toBe('x');
    expect(options).not.toHaveProperty('headers');
  });

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, status: 401 }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchMovies('x', 1)).rejects.toThrow('TMDB request failed: 401');
    await expect(searchMovies('x', 1)).rejects.toMatchObject({
      name: 'TmdbError',
      status: 401,
    });
    await expect(searchMovies('x', 1)).rejects.toBeInstanceOf(TmdbError);
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

    const [calledUrl] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl.pathname).toBe('/api/tmdb/movie/42');
    expect(calledUrl.searchParams.get('append_to_response')).toBe('credits');
  });

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, status: 404 }),
    ) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMovieDetails(42)).rejects.toThrow('TMDB request failed: 404');
  });
});

function stubFetch(body: unknown) {
  const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(body) }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const listBody = {
  page: 2,
  total_pages: 9,
  results: [
    {
      id: 1,
      title: 'Listed',
      overview: '',
      poster_path: null,
      release_date: '2021-01-01',
      vote_average: 6,
    },
  ],
};

describe('getMovieList', () => {
  it.each([
    ['trending', '/api/tmdb/trending/movie/week'],
    ['popular', '/api/tmdb/movie/popular'],
    ['now_playing', '/api/tmdb/movie/now_playing'],
  ] as const)('requests the %s endpoint and maps the page', async (kind, pathname) => {
    const fetchMock = stubFetch(listBody);

    const result = await getMovieList(kind, 2);

    const [url] = fetchMock.mock.calls[0] as unknown as [URL];
    expect(url.pathname).toBe(pathname);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('language')).toBe('en-US');
    expect(result).toMatchObject({ page: 2, totalPages: 9 });
    expect(result.movies[0]).toMatchObject({ id: 1, title: 'Listed', posterPath: null });
  });
});

describe('discoverMovies', () => {
  it('sends only the filters that are set', async () => {
    const fetchMock = stubFetch(listBody);

    await discoverMovies({ genre: null, year: null, rating: null, sort: 'popularity.desc' }, 1);

    const [url] = fetchMock.mock.calls[0] as unknown as [URL];
    expect(url.pathname).toBe('/api/tmdb/discover/movie');
    expect(url.searchParams.get('sort_by')).toBe('popularity.desc');
    expect(url.searchParams.get('include_adult')).toBe('false');
    expect(url.searchParams.has('with_genres')).toBe(false);
    expect(url.searchParams.has('primary_release_year')).toBe(false);
    expect(url.searchParams.has('vote_average.gte')).toBe(false);
    expect(url.searchParams.has('vote_count.gte')).toBe(false);
  });

  it('maps every filter to its TMDB parameter and requires votes when sorting by rating', async () => {
    const fetchMock = stubFetch(listBody);

    await discoverMovies({ genre: 28, year: 2020, rating: 7, sort: 'vote_average.desc' }, 3);

    const [url] = fetchMock.mock.calls[0] as unknown as [URL];
    expect(url.searchParams.get('with_genres')).toBe('28');
    expect(url.searchParams.get('primary_release_year')).toBe('2020');
    expect(url.searchParams.get('vote_average.gte')).toBe('7');
    expect(url.searchParams.get('vote_count.gte')).toBe('200');
    expect(url.searchParams.get('page')).toBe('3');
  });
});

describe('getGenres', () => {
  it('returns the genre list', async () => {
    const fetchMock = stubFetch({ genres: [{ id: 28, name: 'Action' }] });

    await expect(getGenres()).resolves.toEqual([{ id: 28, name: 'Action' }]);
    const [url] = fetchMock.mock.calls[0] as unknown as [URL];
    expect(url.pathname).toBe('/api/tmdb/genre/movie/list');
  });

  it('rejects a response with an unexpected shape', async () => {
    stubFetch({ genres: 'nope' });

    await expect(getGenres()).rejects.toThrow(/expected shape/);
  });
});
