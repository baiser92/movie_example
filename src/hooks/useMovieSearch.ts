import { useEffect, useState } from 'react';
import { searchMovies } from '../api/tmdb';
import { Movie } from '../types/movie';

type SearchState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
};

const DEBOUNCE_MS = 350;

const INITIAL_STATE: SearchState = {
  movies: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
};

export function useMovieSearch(query: string, page: number): SearchState {
  const [state, setState] = useState<SearchState>(INITIAL_STATE);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setState(INITIAL_STATE);
      return;
    }

    const controller = new AbortController();

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await searchMovies(normalizedQuery, page, controller.signal);
        setState({
          movies: result.movies,
          loading: false,
          error: null,
          page: result.page,
          totalPages: result.totalPages,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          movies: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Something went wrong.',
          page: 1,
          totalPages: 1,
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, page]);

  return state;
}
