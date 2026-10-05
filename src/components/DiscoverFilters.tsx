import { useQuery } from '@tanstack/react-query';
import { genresQueryOptions } from '../api/queries';
import { DiscoverFilters as Filters, MIN_YEAR, SORT_OPTIONS, SortValue } from '../lib/browseParams';

type DiscoverFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const RATINGS = [5, 6, 7, 8, 9];

function optionalNumber(value: string): number | null {
  return value === '' ? null : Number(value);
}

export default function DiscoverFilters({ filters, onChange }: DiscoverFiltersProps) {
  // If the genre list fails the other filters still work, so the error is not surfaced.
  const { data: genres = [] } = useQuery(genresQueryOptions());
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear + 1 - MIN_YEAR + 1 },
    (_, i) => currentYear + 1 - i,
  );

  return (
    <form className="filters" aria-label="Discover filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        Genre
        <select
          value={filters.genre ?? ''}
          onChange={(e) => onChange({ ...filters, genre: optionalNumber(e.target.value) })}
        >
          <option value="">Any genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Year
        <select
          value={filters.year ?? ''}
          onChange={(e) => onChange({ ...filters, year: optionalNumber(e.target.value) })}
        >
          <option value="">Any year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label>
        Minimum rating
        <select
          value={filters.rating ?? ''}
          onChange={(e) => onChange({ ...filters, rating: optionalNumber(e.target.value) })}
        >
          <option value="">Any rating</option>
          {RATINGS.map((rating) => (
            <option key={rating} value={rating}>
              {rating}+
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort by
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortValue })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
