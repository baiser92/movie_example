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
      <input
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Try: Interstellar"
        aria-label="Search movies"
      />

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
