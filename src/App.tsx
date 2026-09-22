import { useState } from 'react';
import MovieList from './components/MovieList';
import { useMovieSearch } from './hooks/useMovieSearch';

export default function App() {
  const [query, setQuery] = useState('');
  const { movies, loading, error } = useMovieSearch(query);

  return (
    <main className="container">
      <header>
        <p className="eyebrow">React · TypeScript · TMDB API</p>
        <h1>Movie Explorer</h1>
        <p>Search movies and explore basic metadata from TMDB.</p>
      </header>

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

      <footer>TMDB API</footer>
    </main>
  );
}
