import { useQuery } from '@tanstack/react-query';
import { browseQueryOptions } from '../api/queries';
import { BrowseParams } from '../lib/browseParams';
import { Movie } from '../types/movie';

type BrowseState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  totalPages: number;
};

const EMPTY: Movie[] = [];

export function useMovieBrowse(params: BrowseParams, enabled = true): BrowseState {
  const { data, isLoading, error } = useQuery(browseQueryOptions(params, enabled));

  return {
    movies: data?.movies ?? EMPTY,
    loading: enabled && isLoading,
    error: error ? error.message || 'Something went wrong.' : null,
    totalPages: data?.totalPages ?? 1,
  };
}
