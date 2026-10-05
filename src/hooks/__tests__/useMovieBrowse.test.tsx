import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useMovieBrowse } from '../useMovieBrowse';
import { discoverMovies, getMovieList } from '../../api/tmdb';
import { createQueryWrapper } from '../../test/queryWrapper';
import { BrowseParams, NO_FILTERS } from '../../lib/browseParams';
import type { Movie } from '../../types/movie';

vi.mock('../../api/tmdb', () => ({
  getMovieList: vi.fn(),
  discoverMovies: vi.fn(),
}));

const mockedGetMovieList = vi.mocked(getMovieList);
const mockedDiscoverMovies = vi.mocked(discoverMovies);

const movie = (id: number, title: string): Movie => ({
  id,
  title,
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7,
});

const params = (overrides: Partial<BrowseParams> = {}): BrowseParams => ({
  list: 'trending',
  filters: NO_FILTERS,
  page: 1,
  ...overrides,
});

beforeEach(() => {
  mockedGetMovieList.mockReset();
  mockedDiscoverMovies.mockReset();
});

describe('useMovieBrowse', () => {
  it('loads a list tab', async () => {
    mockedGetMovieList.mockResolvedValue({ movies: [movie(1, 'A')], page: 1, totalPages: 5 });

    const { result } = renderHook(() => useMovieBrowse(params()), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({
      movies: [movie(1, 'A')],
      loading: false,
      error: null,
      totalPages: 5,
    });
    expect(mockedGetMovieList).toHaveBeenCalledWith('trending', 1, expect.any(AbortSignal));
  });

  it('uses discover with the filters for the discover tab', async () => {
    const filters = { genre: 28, year: null, rating: 7, sort: 'popularity.desc' as const };
    mockedDiscoverMovies.mockResolvedValue({ movies: [movie(2, 'B')], page: 2, totalPages: 3 });

    const { result } = renderHook(
      () => useMovieBrowse(params({ list: 'discover', filters, page: 2 })),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.movies).toEqual([movie(2, 'B')]));
    expect(mockedDiscoverMovies).toHaveBeenCalledWith(filters, 2, expect.any(AbortSignal));
    expect(mockedGetMovieList).not.toHaveBeenCalled();
  });

  it('does not fetch or report loading while disabled', () => {
    const { result } = renderHook(() => useMovieBrowse(params(), false), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(false);
    expect(mockedGetMovieList).not.toHaveBeenCalled();
  });

  it('keeps the previous page on screen while the next page of the same list loads', async () => {
    mockedGetMovieList.mockResolvedValueOnce({ movies: [movie(1, 'A')], page: 1, totalPages: 2 });
    const { result, rerender } = renderHook(({ page }) => useMovieBrowse(params({ page })), {
      initialProps: { page: 1 },
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.movies).toEqual([movie(1, 'A')]));

    mockedGetMovieList.mockReturnValueOnce(new Promise(() => {}));
    rerender({ page: 2 });

    expect(result.current.loading).toBe(false);
    expect(result.current.movies).toEqual([movie(1, 'A')]);
  });

  it('shows the skeleton instead of the old list when switching tabs', async () => {
    mockedGetMovieList.mockResolvedValueOnce({ movies: [movie(1, 'A')], page: 1, totalPages: 1 });
    const { result, rerender } = renderHook(({ list }) => useMovieBrowse(params({ list })), {
      initialProps: { list: 'trending' as BrowseParams['list'] },
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.movies).toEqual([movie(1, 'A')]));

    mockedGetMovieList.mockReturnValueOnce(new Promise(() => {}));
    rerender({ list: 'popular' });

    expect(result.current.loading).toBe(true);
    expect(result.current.movies).toEqual([]);
  });

  it('keeps the previous results while discover filters change', async () => {
    mockedDiscoverMovies.mockResolvedValueOnce({ movies: [movie(1, 'A')], page: 1, totalPages: 1 });
    const discover = (genre: number | null) =>
      params({ list: 'discover', filters: { ...NO_FILTERS, genre } });
    const { result, rerender } = renderHook(({ genre }) => useMovieBrowse(discover(genre)), {
      initialProps: { genre: null as number | null },
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.movies).toEqual([movie(1, 'A')]));

    mockedDiscoverMovies.mockReturnValueOnce(new Promise(() => {}));
    rerender({ genre: 28 });

    expect(result.current.loading).toBe(false);
    expect(result.current.movies).toEqual([movie(1, 'A')]);
  });

  it('exposes the error message', async () => {
    mockedGetMovieList.mockRejectedValue(new Error('TMDB request failed: 500'));

    const { result } = renderHook(() => useMovieBrowse(params()), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe('TMDB request failed: 500'));
  });
});
