import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getMovieDetails, searchMovies } from './tmdb';

export const movieKeys = {
  all: ['movies'] as const,
  search: (query: string, page: number) => [...movieKeys.all, 'search', query, page] as const,
  detail: (id: string | number) => [...movieKeys.all, 'detail', String(id)] as const,
};

export function searchQueryOptions(query: string, page: number) {
  return queryOptions({
    queryKey: movieKeys.search(query, page),
    queryFn: ({ signal }) => searchMovies(query, page, signal),
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
  });
}

export function detailQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: movieKeys.detail(id),
    queryFn: ({ signal }) => getMovieDetails(id, signal),
  });
}
