import { useState } from 'react';
import MovieList from '../components/MovieList';
import { useMovieSearch } from '../hooks/useMovieSearch';

export default function Home() {
  const [query, setQuery] = useState('');
  const { movies, loading, error } = useMovieSearch(query, 1);

  return (
    <>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try: Interstellar"
        aria-label="Search movies"
      />

      {loading && <p>Searching...</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && <MovieList movies={movies} />}
    </>
  );
}
