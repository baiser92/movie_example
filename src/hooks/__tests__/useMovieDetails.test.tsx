import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useMovieDetails } from '../useMovieDetails';
import { getMovieDetails } from '../../api/tmdb';
import { createQueryWrapper } from '../../test/queryWrapper';
import type { MovieDetail } from '../../types/movie';

vi.mock('../../api/tmdb', () => ({
  getMovieDetails: vi.fn(),
}));

const mockedGetMovieDetails = vi.mocked(getMovieDetails);

const movie: MovieDetail = {
  id: 42,
  title: 'Detail Movie',
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 8,
  tagline: '',
  runtime: 100,
  genres: [],
  cast: [],
};

beforeEach(() => {
  mockedGetMovieDetails.mockReset();
});

describe('useMovieDetails', () => {
  it('reports an error without calling the API when the id is missing', () => {
    const { result } = renderHook(() => useMovieDetails(undefined), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current).toEqual({ movie: null, loading: false, error: 'Missing movie id.' });
    expect(mockedGetMovieDetails).not.toHaveBeenCalled();
  });

  it('loads the movie', async () => {
    mockedGetMovieDetails.mockResolvedValue(movie);

    const { result } = renderHook(() => useMovieDetails('42'), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.movie).toEqual(movie));
    expect(result.current).toEqual({ movie, loading: false, error: null });
    expect(mockedGetMovieDetails).toHaveBeenCalledWith('42', expect.any(AbortSignal));
  });

  it('exposes the error message on failure', async () => {
    mockedGetMovieDetails.mockRejectedValue(new Error('TMDB request failed: 404'));

    const { result } = renderHook(() => useMovieDetails('42'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe('TMDB request failed: 404'));
    expect(result.current.movie).toBeNull();
  });
});
