import { Movie, MovieSearchResponse } from '../types/movie';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      'Missing VITE_TMDB_ACCESS_TOKEN. Set it in a .env file (VITE_TMDB_ACCESS_TOKEN=...) and restart the dev server.',
    );
  }

  return token;
}

export async function searchMovies(query: string, signal?: AbortSignal): Promise<Movie[]> {
  const url = new URL(`${BASE_URL}/search/movie`);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('include_adult', 'false');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  const data: MovieSearchResponse = await response.json();

  return data.results.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
    releaseDate: movie.release_date,
    rating: movie.vote_average,
  }));
}
