import { useEffect, useState } from 'react';
import { getMovieDetails } from '../api/tmdb';
import { MovieDetail } from '../types/movie';

type DetailState = {
  movie: MovieDetail | null;
  loading: boolean;
  error: string | null;
};

export function useMovieDetails(id: string | undefined): DetailState {
  const [state, setState] = useState<DetailState>({
    movie: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ movie: null, loading: false, error: 'Missing movie id.' });
      return;
    }

    const controller = new AbortController();
    setState({ movie: null, loading: true, error: null });

    getMovieDetails(id, controller.signal)
      .then((movie) => setState({ movie, loading: false, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setState({
          movie: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Something went wrong.',
        });
      });

    return () => controller.abort();
  }, [id]);

  return state;
}
