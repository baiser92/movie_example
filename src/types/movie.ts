import { z } from 'zod';
import { movieDetailResponseSchema, movieSearchResponseSchema } from '../api/schemas';

export type Movie = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  rating: number;
};

export type MovieSearchResult = {
  movies: Movie[];
  page: number;
  totalPages: number;
};

export type MovieSearchResponse = z.infer<typeof movieSearchResponseSchema>;

export type CastMember = {
  id: number;
  name: string;
  character: string;
};

export type MovieDetail = Movie & {
  tagline: string;
  runtime: number | null;
  genres: string[];
  cast: CastMember[];
};

export type MovieDetailResponse = z.infer<typeof movieDetailResponseSchema>;
