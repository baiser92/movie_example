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

export type MovieSearchResponse = {
  page: number;
  total_pages: number;
  results: Array<{
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
  }>;
};

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

export type MovieDetailResponse = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  tagline: string;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  credits?: {
    cast: Array<{ id: number; name: string; character: string }>;
  };
};
