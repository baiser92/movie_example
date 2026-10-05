import { describe, it, expect } from 'vitest';
import { buildBrowseSearch, parseBrowseParams, NO_FILTERS } from '../browseParams';

const parse = (search: string) => parseBrowseParams(new URLSearchParams(search));

describe('parseBrowseParams', () => {
  it('returns defaults for an empty URL', () => {
    expect(parse('')).toEqual({ list: 'trending', filters: NO_FILTERS, page: 1 });
  });

  it('reads a full discover URL', () => {
    expect(
      parse('list=discover&genre=28&year=2020&rating=7&sort=vote_average.desc&page=3'),
    ).toEqual({
      list: 'discover',
      filters: { genre: 28, year: 2020, rating: 7, sort: 'vote_average.desc' },
      page: 3,
    });
  });

  it.each([
    ['list=bogus', 'list', 'trending'],
    ['sort=bogus', 'sort', 'popularity.desc'],
  ])('falls back to the default for %s', (search, key, expected) => {
    const result = parse(search);
    expect(key === 'list' ? result.list : result.filters.sort).toBe(expected);
  });

  it.each(['genre=abc', 'genre=0', 'genre=-1', 'genre=1.5', 'genre='])(
    'ignores an invalid genre (%s)',
    (search) => {
      expect(parse(search).filters.genre).toBeNull();
    },
  );

  it.each(['year=1899', 'year=3000', 'year=abc', 'rating=0', 'rating=10', 'rating=x'])(
    'ignores out-of-range filters (%s)',
    (search) => {
      const { year, rating } = parse(search).filters;
      expect(year).toBeNull();
      expect(rating).toBeNull();
    },
  );

  it.each(['abc', '0', '-3', '1.5'])('falls back to page 1 for page=%s', (value) => {
    expect(parse(`page=${value}`).page).toBe(1);
  });
});

describe('buildBrowseSearch', () => {
  it('writes nothing for the default view', () => {
    expect(buildBrowseSearch({ list: 'trending', filters: NO_FILTERS, page: 1 }).toString()).toBe(
      '',
    );
  });

  it('writes the list and page only', () => {
    expect(buildBrowseSearch({ list: 'popular', filters: NO_FILTERS, page: 2 }).toString()).toBe(
      'list=popular&page=2',
    );
  });

  it('writes filters only for the discover tab', () => {
    const filters = { genre: 28, year: 2020, rating: 7, sort: 'vote_average.desc' as const };

    expect(buildBrowseSearch({ list: 'discover', filters, page: 1 }).toString()).toBe(
      'list=discover&genre=28&year=2020&rating=7&sort=vote_average.desc',
    );
    expect(buildBrowseSearch({ list: 'popular', filters, page: 1 }).toString()).toBe(
      'list=popular',
    );
  });

  it('round-trips through the parser', () => {
    const params = {
      list: 'discover' as const,
      filters: { genre: 18, year: null, rating: 8, sort: 'primary_release_date.desc' as const },
      page: 4,
    };

    expect(parseBrowseParams(buildBrowseSearch(params))).toEqual(params);
  });
});
