import {
  MovieDetail,
  MovieDetailResponse,
  MovieSearchResponse,
  MovieSearchResult,
} from '../types/movie';

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

async function tmdbFetch<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchResult> {
  const url = new URL(`${BASE_URL}/search/movie`);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('page', String(page));

  const data = await tmdbFetch<MovieSearchResponse>(url, signal);

  return {
    movies: data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
    })),
    page: data.page,
    totalPages: data.total_pages,
  };
}

export async function getMovieDetails(
  id: string | number,
  signal?: AbortSignal,
): Promise<MovieDetail> {
  const url = new URL(`${BASE_URL}/movie/${id}`);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('append_to_response', 'credits');

  const movie = await tmdbFetch<MovieDetailResponse>(url, signal);

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
    releaseDate: movie.release_date,
    rating: movie.vote_average,
    tagline: movie.tagline,
    runtime: movie.runtime,
    genres: movie.genres.map((genre) => genre.name),
    cast: (movie.credits?.cast ?? []).slice(0, 6).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character,
    })),
  };
}
