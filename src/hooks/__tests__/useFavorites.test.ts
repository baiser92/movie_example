import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearFavorites, useFavorites } from '../useFavorites';
import type { Movie } from '../../types/movie';

const movie: Movie = {
  id: 1,
  title: 'Batman',
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7,
};

beforeEach(() => {
  clearFavorites();
});

describe('useFavorites', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite(movie.id)).toBe(false);
  });

  it('adds and removes a favorite on toggle', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(movie));
    expect(result.current.favorites).toEqual([movie]);
    expect(result.current.isFavorite(movie.id)).toBe(true);

    act(() => result.current.toggleFavorite(movie));
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite(movie.id)).toBe(false);
  });

  it('persists favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(movie));

    expect(JSON.parse(localStorage.getItem('movie-explorer:favorites') ?? '[]')).toEqual([movie]);
  });

  it('keeps multiple hook instances in sync', () => {
    const a = renderHook(() => useFavorites());
    const b = renderHook(() => useFavorites());

    act(() => a.result.current.toggleFavorite(movie));

    expect(b.result.current.favorites).toEqual([movie]);
  });

  it('clears all favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(movie));
    act(() => result.current.clearFavorites());

    expect(result.current.favorites).toEqual([]);
  });
});
