import { useQuery } from '@tanstack/react-query';
import { detailQueryOptions } from '../api/queries';
import { MovieDetail } from '../types/movie';

type DetailState = {
  movie: MovieDetail | null;
  loading: boolean;
  error: string | null;
};

export function useMovieDetails(id: string | undefined): DetailState {
  const { data, isLoading, error } = useQuery({
    ...detailQueryOptions(id ?? ''),
    enabled: Boolean(id),
  });

  if (!id) {
    return { movie: null, loading: false, error: 'Missing movie id.' };
  }

  return {
    movie: data ?? null,
    loading: isLoading,
    error: error ? error.message || 'Something went wrong.' : null,
  };
}
