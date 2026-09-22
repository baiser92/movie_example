import { useEffect, useState } from "react";
import { searchMovies } from "../api/tmdb";
import { Movie } from "../types/movie";

type SearchState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
};

const DEBOUNCE_MS = 350;

export function useMovieSearch(query: string): SearchState {
  const [state, setState] = useState<SearchState>({
    movies: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setState({ movies: [], loading: false, error: null });
      return;
    }

    const controller = new AbortController();

    setState((current) => ({
      ...current,
      loading: true,
      error: null
    }));

    const timeoutId = window.setTimeout(async () => {
      try {
        const movies = await searchMovies(normalizedQuery, controller.signal);
        setState({ movies, loading: false, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({
          movies: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Something went wrong."
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  return state;
}
