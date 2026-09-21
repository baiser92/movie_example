import { useEffect, useState } from "react";
import { searchMovies } from "../api/tmdb";
import { Movie } from "../types/movie";

type SearchState = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
};

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

    let active = true;

    async function loadMovies() {
      setState((current) => ({
        ...current,
        loading: true,
        error: null
      }));

      try {
        const movies = await searchMovies(normalizedQuery);

        if (active) {
          setState({ movies, loading: false, error: null });
        }
      } catch (error) {
        if (active) {
          setState({
            movies: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Something went wrong."
          });
        }
      }
    }

    loadMovies();

    return () => {
      active = false;
    };
  }, [query]);

  return state;
}
