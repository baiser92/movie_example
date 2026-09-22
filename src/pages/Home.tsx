import { useState } from 'react';
import MovieList from '../components/MovieList';
import Pagination from '../components/Pagination';
import { useMovieSearch } from '../hooks/useMovieSearch';

export default function Home() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { movies, loading, error, totalPages } = useMovieSearch(query, page);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">React · TypeScript · TMDB API</p>
        <h1>Find your next movie.</h1>
        <p className="subhead">
          Search movies and explore ratings, cast and release details from TMDB.
        </p>
        <div className="search-field">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="#7a7266" strokeWidth="1.6" />
            <path d="M13 13L16.5 16.5" stroke="#7a7266" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Try: Interstellar"
            aria-label="Search movies"
          />
        </div>
      </section>

      {loading && <p>Searching...</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <>
          <MovieList movies={movies} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
