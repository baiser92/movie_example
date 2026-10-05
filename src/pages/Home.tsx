import { useSearchParams } from 'react-router-dom';
import MovieList from '../components/MovieList';
import MovieListSkeleton from '../components/MovieListSkeleton';
import Pagination from '../components/Pagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useMovieSearch } from '../hooks/useMovieSearch';

const DEBOUNCE_MS = 350;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const page = parsePage(searchParams.get('page'));
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  const { movies, loading, error, totalPages } = useMovieSearch(debouncedQuery, page);

  // Typing replaces the history entry so Back does not step through every keystroke.
  function handleQueryChange(value: string) {
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  // Paging pushes an entry so Back returns to the previous page of results.
  function handlePageChange(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) {
      next.set('page', String(nextPage));
    } else {
      next.delete('page');
    }
    setSearchParams(next);
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

      {loading && <MovieListSkeleton />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <>
          <MovieList movies={movies} />
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </>
  );
}
