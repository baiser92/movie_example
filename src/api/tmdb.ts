import { Movie, MovieSearchResponse } from "../types/movie";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getToken(): string {
  const metaEnv = (import.meta as ImportMeta & {
    env?: { VITE_TMDB_ACCESS_TOKEN?: string };
  }).env;


  const token =
    metaEnv?.VITE_TMDB_ACCESS_TOKEN ||
    (typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem("VITE_TMDB_ACCESS_TOKEN")
      : null) ||
    (typeof window !== "undefined" && window.sessionStorage
      ? window.sessionStorage.getItem("VITE_TMDB_ACCESS_TOKEN")
      : null);

  if (!token) {
    throw new Error(
      "Missing VITE_TMDB_ACCESS_TOKEN. Set it in a .env file (VITE_TMDB_ACCESS_TOKEN=...) or store it at runtime in localStorage/sessionStorage under 'VITE_TMDB_ACCESS_TOKEN'. Restart dev server after changing .env."
    );
  }

  return token;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const url = new URL(`${BASE_URL}/search/movie`);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("include_adult", "false");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  const data: MovieSearchResponse = await response.json();

  return data.results.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : null,
    releaseDate: movie.release_date,
    rating: movie.vote_average
  }));
}
