export const LIST_KINDS = ['trending', 'popular', 'now_playing', 'discover'] as const;
export type ListKind = (typeof LIST_KINDS)[number];

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const DEFAULT_LIST: ListKind = 'trending';
export const DEFAULT_SORT: SortValue = 'popularity.desc';
export const MIN_YEAR = 1900;

export type DiscoverFilters = {
  genre: number | null;
  year: number | null;
  rating: number | null;
  sort: SortValue;
};

export type BrowseParams = {
  list: ListKind;
  filters: DiscoverFilters;
  page: number;
};

export const NO_FILTERS: DiscoverFilters = {
  genre: null,
  year: null,
  rating: null,
  sort: DEFAULT_SORT,
};

function parseInteger(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === '') {
    return null;
  }
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export function parsePage(value: string | null): number {
  return parseInteger(value, 1, Number.MAX_SAFE_INTEGER) ?? 1;
}

// Invalid values fall back to the default instead of failing, so a hand-edited URL never breaks the page.
export function parseBrowseParams(params: URLSearchParams): BrowseParams {
  const list = params.get('list');
  const sort = params.get('sort');

  return {
    list: LIST_KINDS.find((kind) => kind === list) ?? DEFAULT_LIST,
    filters: {
      genre: parseInteger(params.get('genre'), 1, Number.MAX_SAFE_INTEGER),
      year: parseInteger(params.get('year'), MIN_YEAR, new Date().getFullYear() + 1),
      rating: parseInteger(params.get('rating'), 1, 9),
      sort: SORT_OPTIONS.find((option) => option.value === sort)?.value ?? DEFAULT_SORT,
    },
    page: parsePage(params.get('page')),
  };
}

// Writes only non-default values, so the default view keeps a clean "/" URL.
export function buildBrowseSearch({ list, filters, page }: BrowseParams): URLSearchParams {
  const params = new URLSearchParams();

  if (list !== DEFAULT_LIST) {
    params.set('list', list);
  }
  if (list === 'discover') {
    if (filters.genre !== null) params.set('genre', String(filters.genre));
    if (filters.year !== null) params.set('year', String(filters.year));
    if (filters.rating !== null) params.set('rating', String(filters.rating));
    if (filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);
  }
  if (page > 1) {
    params.set('page', String(page));
  }

  return params;
}
