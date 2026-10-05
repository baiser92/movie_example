import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useMovieSearch } from '../useMovieSearch';
import { searchMovies } from '../../api/tmdb';
import { createQueryWrapper } from '../../test/queryWrapper';
import type { Movie } from '../../types/movie';

vi.mock('../../api/tmdb', () => ({
  searchMovies: vi.fn(),
}));

const mockedSearchMovies = vi.mocked(searchMovies);

const movie: Movie = {
  id: 1,
  title: 'Batman',
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7,
};

beforeEach(() => {
  mockedSearchMovies.mockReset();
});

describe('useMovieSearch', () => {
  it('returns empty state for a blank query, without calling the API', () => {
    const { result } = renderHook(() => useMovieSearch('   ', 1), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current).toEqual({
      movies: [],
      loading: false,
      error: null,
      page: 1,
      totalPages: 1,
    });
    expect(mockedSearchMovies).not.toHaveBeenCalled();
  });

  it('reports loading, then movies and pagination info on success', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 1, totalPages: 4 });

    const { result } = renderHook(() => useMovieSearch('batman', 1), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({
      movies: [movie],
      loading: false,
      error: null,
      page: 1,
      totalPages: 4,
    });
    expect(mockedSearchMovies).toHaveBeenCalledWith('batman', 1, expect.any(AbortSignal));
  });

  it('trims the query before searching', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 1, totalPages: 1 });

    const { result } = renderHook(() => useMovieSearch('  batman  ', 1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.movies).toEqual([movie]));
    expect(mockedSearchMovies).toHaveBeenCalledWith('batman', 1, expect.any(AbortSignal));
  });

  it('serves a repeated search from the cache with a single request', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 1, totalPages: 1 });
    const wrapper = createQueryWrapper();

    const first = renderHook(() => useMovieSearch('batman', 1), { wrapper });
    await waitFor(() => expect(first.result.current.movies).toEqual([movie]));
    first.unmount();

    const second = renderHook(() => useMovieSearch('batman', 1), { wrapper });
    expect(second.result.current.movies).toEqual([movie]);
    expect(second.result.current.loading).toBe(false);
    expect(mockedSearchMovies).toHaveBeenCalledTimes(1);
  });

  it('keeps the previous page on screen while the next page loads', async () => {
    const page2Movie = { ...movie, id: 2, title: 'Batman Returns' };
    mockedSearchMovies.mockResolvedValueOnce({ movies: [movie], page: 1, totalPages: 2 });

    const { result, rerender } = renderHook(({ page }) => useMovieSearch('batman', page), {
      initialProps: { page: 1 },
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.movies).toEqual([movie]));

    let resolvePage2: (value: Awaited<ReturnType<typeof searchMovies>>) => void = () => {};
    mockedSearchMovies.mockReturnValueOnce(new Promise((resolve) => (resolvePage2 = resolve)));
    rerender({ page: 2 });

    // No skeleton flash: previous results stay while page 2 is in flight.
    expect(result.current.loading).toBe(false);
    expect(result.current.movies).toEqual([movie]);

    resolvePage2({ movies: [page2Movie], page: 2, totalPages: 2 });
    await waitFor(() => expect(result.current.movies).toEqual([page2Movie]));
  });

  it('clears results when the query is emptied', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 1, totalPages: 1 });

    const { result, rerender } = renderHook(({ query }) => useMovieSearch(query, 1), {
      initialProps: { query: 'batman' },
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.movies).toEqual([movie]));

    rerender({ query: '' });
    expect(result.current.movies).toEqual([]);
  });

  it('exposes the error message when the search fails', async () => {
    mockedSearchMovies.mockRejectedValue(new Error('TMDB request failed: 500'));

    const { result } = renderHook(() => useMovieSearch('batman', 1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe('TMDB request failed: 500'));
    expect(result.current.loading).toBe(false);
    expect(result.current.movies).toEqual([]);
  });
});
