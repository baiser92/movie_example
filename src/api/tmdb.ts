import { z } from 'zod';
import { DiscoverFilters } from '../lib/browseParams';
import { Genre, Movie, MovieDetail, MovieSearchResult } from '../types/movie';
import {
  genreListResponseSchema,
  movieDetailResponseSchema,
  movieListResponseSchema,
} from './schemas';

// Requests go through our own serverless proxy (api/tmdb), which holds the TMDB token.
const BASE_URL = '/api/tmdb';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export class TmdbError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`TMDB request failed: ${status}`);
    this.name = 'TmdbError';
    this.status = status;
  }
}

async function tmdbFetch<T>(url: URL, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new TmdbError(response.status);
  }

  const json = await response.json();
  const result = schema.safeParse(json);

  if (!result.success) {
    throw new Error(`TMDB response did not match the expected shape: ${result.error.message}`);
  }

  return result.data;
}

type MovieListResponse = z.infer<typeof movieListResponseSchema>;

function toMovie(movie: MovieListResponse['results'][number]): Movie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
    releaseDate: movie.release_date,
    rating: movie.vote_average,
  };
}

async function fetchMovieList(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<MovieSearchResult> {
  const url = new URL(`${BASE_URL}/${path}`, window.location.origin);
  url.searchParams.set('language', 'en-US');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const data = await tmdbFetch(url, movieListResponseSchema, signal);

  return { movies: data.results.map(toMovie), page: data.page, totalPages: data.total_pages };
}

export async function searchMovies(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchResult> {
  return fetchMovieList(
    'search/movie',
    { query, include_adult: 'false', page: String(page) },
    signal,
  );
}

const LIST_PATHS = {
  trending: 'trending/movie/week',
  popular: 'movie/popular',
  now_playing: 'movie/now_playing',
} as const;

export function getMovieList(
  kind: keyof typeof LIST_PATHS,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchResult> {
  return fetchMovieList(LIST_PATHS[kind], { page: String(page) }, signal);
}

// Sorting by rating alone surfaces obscure titles with a handful of votes, so require a floor.
const MIN_VOTES_WHEN_SORTING_BY_RATING = '200';

export function discoverMovies(
  filters: DiscoverFilters,
  page = 1,
  signal?: AbortSignal,
): Promise<MovieSearchResult> {
  const params: Record<string, string> = {
    include_adult: 'false',
    page: String(page),
    sort_by: filters.sort,
  };

  if (filters.genre !== null) params.with_genres = String(filters.genre);
  if (filters.year !== null) params.primary_release_year = String(filters.year);
  if (filters.rating !== null) params['vote_average.gte'] = String(filters.rating);
  if (filters.sort === 'vote_average.desc') {
    params['vote_count.gte'] = MIN_VOTES_WHEN_SORTING_BY_RATING;
  }

  return fetchMovieList('discover/movie', params, signal);
}

export async function getGenres(signal?: AbortSignal): Promise<Genre[]> {
  const url = new URL(`${BASE_URL}/genre/movie/list`, window.location.origin);
  url.searchParams.set('language', 'en-US');

  const data = await tmdbFetch(url, genreListResponseSchema, signal);

  return data.genres;
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
