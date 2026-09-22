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
    const { result } = renderHook(() => useMovieSearch('   '));

    expect(result.current).toEqual({ movies: [], loading: false, error: null });
    expect(mockedSearchMovies).not.toHaveBeenCalled();
  });

  it('debounces rapid keystrokes into a single request for the final query', async () => {
    mockedSearchMovies.mockResolvedValue([movie]);

    const { rerender } = renderHook(({ query }) => useMovieSearch(query), {
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
    expect(mockedSearchMovies).toHaveBeenCalledWith('batman', expect.any(AbortSignal));
  });

  it('aborts an in-flight request when the query changes again', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockedSearchMovies.mockImplementation((_query, signal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });

    const { rerender } = renderHook(({ query }) => useMovieSearch(query), {
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

  it('sets movies on a successful search', async () => {
    mockedSearchMovies.mockResolvedValue([movie]);

    const { result } = renderHook(() => useMovieSearch('batman'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(result.current).toEqual({ movies: [movie], loading: false, error: null });
  });

  it('sets an error message when the search fails', async () => {
    mockedSearchMovies.mockRejectedValue(new Error('TMDB request failed: 500'));

    const { result } = renderHook(() => useMovieSearch('batman'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    expect(result.current).toEqual({
      movies: [],
      loading: false,
      error: 'TMDB request failed: 500',
    });
  });
});
