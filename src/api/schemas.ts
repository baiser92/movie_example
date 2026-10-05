import { z } from 'zod';

// Search, trending, popular, now playing and discover all return this same paginated shape.
export const movieListResponseSchema = z.object({
  page: z.number(),
  total_pages: z.number(),
  results: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      poster_path: z.string().nullable(),
      release_date: z.string(),
      vote_average: z.number(),
    }),
  ),
});

export const movieSearchResponseSchema = movieListResponseSchema;

export const genreListResponseSchema = z.object({
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
});

export const movieDetailResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  tagline: z.string(),
  runtime: z.number().nullable(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  credits: z
    .object({
      cast: z.array(z.object({ id: z.number(), name: z.string(), character: z.string() })),
    })
    .optional(),
});
