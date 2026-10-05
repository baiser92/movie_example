import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { BrowseParams, DiscoverFilters, ListKind } from '../lib/browseParams';
import { discoverMovies, getGenres, getMovieDetails, getMovieList, searchMovies } from './tmdb';

export const movieKeys = {
  all: ['movies'] as const,
  search: (query: string, page: number) => [...movieKeys.all, 'search', query, page] as const,
  list: (kind: Exclude<ListKind, 'discover'>, page: number) =>
    [...movieKeys.all, 'list', kind, page] as const,
  discover: (filters: DiscoverFilters, page: number) =>
    [...movieKeys.all, 'discover', filters, page] as const,
  genres: () => [...movieKeys.all, 'genres'] as const,
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

// Keep the previous page on screen only while moving within the same list (another page, or
// other filters), never when switching tabs, where it would show the wrong list.
function sameScope(previous: readonly unknown[], next: readonly unknown[]): boolean {
  return previous[1] === next[1] && (next[1] === 'discover' || previous[2] === next[2]);
}

export function browseQueryOptions({ list, filters, page }: BrowseParams, enabled = true) {
  const queryKey =
    list === 'discover' ? movieKeys.discover(filters, page) : movieKeys.list(list, page);

  return queryOptions({
    queryKey,
    queryFn: ({ signal }) =>
      list === 'discover'
        ? discoverMovies(filters, page, signal)
        : getMovieList(list, page, signal),
    enabled,
    placeholderData: (previousData, previousQuery) =>
      previousQuery && sameScope(previousQuery.queryKey, queryKey) ? previousData : undefined,
  });
}

// The genre list is effectively static, so cache it for a day.
export function genresQueryOptions() {
  return queryOptions({
    queryKey: movieKeys.genres(),
    queryFn: ({ signal }) => getGenres(signal),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
