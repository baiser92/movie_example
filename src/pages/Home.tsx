import { useSearchParams } from 'react-router-dom';
import BrowseTabs from '../components/BrowseTabs';
import DiscoverFilters from '../components/DiscoverFilters';
import MovieList from '../components/MovieList';
import MovieListSkeleton from '../components/MovieListSkeleton';
import Pagination from '../components/Pagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useMovieBrowse } from '../hooks/useMovieBrowse';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { BrowseParams, buildBrowseSearch, parseBrowseParams } from '../lib/browseParams';

const DEBOUNCE_MS = 350;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const browse = parseBrowseParams(searchParams);
  const { page } = browse;
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
  // Search and the browse tabs/filters are mutually exclusive: /search/movie accepts no filters.
  const searching = query.trim() !== '';
  const waitingForDebounce = searching && debouncedQuery.trim() === '';
  const search = useMovieSearch(debouncedQuery, page);
  const browsing = useMovieBrowse(browse, !searching);
  const { movies, loading, error, totalPages } = searching ? search : browsing;

  // Typing replaces the history entry so Back does not step through every keystroke. The tab and
  // filters stay in the URL so clearing the input returns to where the user was.
  function handleQueryChange(value: string) {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (value) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
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

  // Switching tab is navigation (push); tweaking a filter refines the same view (replace).
  function handleBrowseChange(change: Partial<BrowseParams>, replace: boolean) {
    setSearchParams(buildBrowseSearch({ ...browse, ...change, page: 1 }), { replace });
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

      {!searching && (
        <>
          <BrowseTabs
            active={browse.list}
            onChange={(list) => handleBrowseChange({ list }, false)}
          />
          {browse.list === 'discover' && (
            <DiscoverFilters
              filters={browse.filters}
              onChange={(filters) => handleBrowseChange({ filters }, true)}
            />
          )}
        </>
      )}

      {(loading || waitingForDebounce) && <MovieListSkeleton />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!loading && !waitingForDebounce && !error && (
        <>
          <MovieList movies={movies} />
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </>
  );
}
