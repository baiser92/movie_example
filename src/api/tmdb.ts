import { z } from 'zod';
import { MovieDetail, MovieSearchResult } from '../types/movie';
import { movieDetailResponseSchema, movieSearchResponseSchema } from './schemas';

// Requests go through our own serverless proxy (api/tmdb), which holds the TMDB token.
const BASE_URL = '/api/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function tmdbFetch<T>(url: URL, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  const json = await response.json();
  const result = schema.safeParse(json);

  if (!result.success) {
    throw new Error(`TMDB response did not match the expected shape: ${result.error.message}`);
  }

  return result.data;
}

export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchResult> {
  const url = new URL(`${BASE_URL}/search/movie`, window.location.origin);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('page', String(page));

  const data = await tmdbFetch(url, movieSearchResponseSchema, signal);

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
  const url = new URL(`${BASE_URL}/movie/${id}`, window.location.origin);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('append_to_response', 'credits');

  const movie = await tmdbFetch(url, movieDetailResponseSchema, signal);

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
