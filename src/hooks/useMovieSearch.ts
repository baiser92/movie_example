import { useQuery } from '@tanstack/react-query';
import { searchQueryOptions } from '../api/queries';
import { Movie } from '../types/movie';

type SearchState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
};

const EMPTY: Movie[] = [];

export function useMovieSearch(query: string, page: number): SearchState {
  const normalizedQuery = query.trim();
  const { data, isLoading, error } = useQuery(searchQueryOptions(normalizedQuery, page));

  // keepPreviousData would otherwise leave stale results on screen after clearing the input.
  if (!normalizedQuery) {
    return { movies: EMPTY, loading: false, error: null, page: 1, totalPages: 1 };
  }

  return {
    movies: data?.movies ?? EMPTY,
    loading: isLoading,
    error: error ? error.message || 'Something went wrong.' : null,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
  };
}
