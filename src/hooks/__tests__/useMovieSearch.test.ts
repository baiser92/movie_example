import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMovieSearch } from '../useMovieSearch';
import { searchMovies } from '../../api/tmdb';
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
  vi.useFakeTimers();
  mockedSearchMovies.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useMovieSearch', () => {
  it('returns empty state immediately for a blank query, without calling the API', () => {
    const { result } = renderHook(() => useMovieSearch('   ', 1));

    expect(result.current).toEqual({
      movies: [],
      loading: false,
      error: null,
      page: 1,
      totalPages: 1,
    });
    expect(mockedSearchMovies).not.toHaveBeenCalled();
  });

  it('debounces rapid keystrokes into a single request for the final query', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 1, totalPages: 1 });

    const { rerender } = renderHook(({ query }) => useMovieSearch(query, 1), {
      initialProps: { query: 'b' },
    });

    act(() => {
      rerender({ query: 'ba' });
      rerender({ query: 'bat' });
      rerender({ query: 'batman' });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(mockedSearchMovies).toHaveBeenCalledTimes(1);
    expect(mockedSearchMovies).toHaveBeenCalledWith('batman', 1, expect.any(AbortSignal));
  });

  it('aborts an in-flight request when the query changes again', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockedSearchMovies.mockImplementation((_query, _page, signal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });

    const { rerender } = renderHook(({ query }) => useMovieSearch(query, 1), {
      initialProps: { query: 'batman' },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(capturedSignal?.aborted).toBe(false);

    act(() => {
      rerender({ query: 'batman returns' });
    });

    expect(capturedSignal?.aborted).toBe(true);
  });

  it('re-fetches when the page changes', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 2, totalPages: 3 });

    const { rerender } = renderHook(({ page }) => useMovieSearch('batman', page), {
      initialProps: { page: 1 },
    });

    act(() => {
      rerender({ page: 2 });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(mockedSearchMovies).toHaveBeenCalledWith('batman', 2, expect.any(AbortSignal));
  });

  it('sets movies and pagination info on a successful search', async () => {
    mockedSearchMovies.mockResolvedValue({ movies: [movie], page: 1, totalPages: 4 });

    const { result } = renderHook(() => useMovieSearch('batman', 1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(result.current).toEqual({
      movies: [movie],
      loading: false,
      error: null,
      page: 1,
      totalPages: 4,
    });
  });

  it('sets an error message when the search fails', async () => {
    mockedSearchMovies.mockRejectedValue(new Error('TMDB request failed: 500'));

    const { result } = renderHook(() => useMovieSearch('batman', 1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(result.current).toEqual({
      movies: [],
      loading: false,
      error: 'TMDB request failed: 500',
      page: 1,
      totalPages: 1,
    });
  });
});
