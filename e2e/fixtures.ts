import { test as base, expect, type Page, type Request } from '@playwright/test';

type MovieFixture = { id: number; title: string };

function listBody(movies: MovieFixture[], page = 1, totalPages = 1) {
  return {
    page,
    total_pages: totalPages,
    results: movies.map(({ id, title }) => ({
      id,
      title,
      overview: `${title} overview`,
      poster_path: null,
      release_date: '2020-01-01',
      vote_average: 7.5,
    })),
  };
}

export const trending = [{ id: 1, title: 'Trending One' }];
export const popular = [{ id: 2, title: 'Popular One' }];
export const nowPlaying = [{ id: 3, title: 'Now Playing One' }];
export const discovered = [{ id: 4, title: 'Discovered One' }];
export const searched = [{ id: 5, title: 'Matrix Result' }];

const genres = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 18, name: 'Drama' },
  ],
};

export type ApiMock = {
  // Every request the app sent to the API, so tests can assert on the TMDB params.
  requests: URL[];
  last: (path: string) => URL | undefined;
};

// Stand-in for the TMDB proxy: nothing here touches the network or needs a token.
async function mockApi(page: Page): Promise<ApiMock> {
  const requests: URL[] = [];

  await page.route('**/api/tmdb/**', async (route) => {
    const request: Request = route.request();
    const url = new URL(request.url());
    requests.push(url);
    const path = url.pathname.replace('/api/tmdb/', '');
    const pageNumber = Number(url.searchParams.get('page') ?? 1);

    const json = (body: unknown) => route.fulfill({ json: body });

    if (path === 'trending/movie/week') return json(listBody(trending, pageNumber, 3));
    if (path === 'movie/popular') return json(listBody(popular));
    if (path === 'movie/now_playing') return json(listBody(nowPlaying));
    if (path === 'discover/movie') return json(listBody(discovered));
    if (path === 'search/movie') return json(listBody(searched));
    if (path === 'genre/movie/list') return json(genres);

    const detail = path.match(/^movie\/(\d+)$/);
    if (detail) {
      const movie = [...trending, ...popular, ...nowPlaying, ...discovered, ...searched].find(
        ({ id }) => id === Number(detail[1]),
      );
      return json({
        ...listBody(movie ? [movie] : []).results[0],
        tagline: 'A tagline',
        runtime: 120,
        genres: [{ id: 28, name: 'Action' }],
        credits: { cast: [] },
      });
    }

    return route.fulfill({ status: 404, json: { error: 'Not found' } });
  });

  return {
    requests,
    last: (path) => [...requests].reverse().find((url) => url.pathname.endsWith(path)),
  };
}

// auto: true installs the mock for every test, so none can reach the real API by forgetting to ask.
export const test = base.extend<{ api: ApiMock }>({
  api: [
    async ({ page }, use) => {
      await use(await mockApi(page));
    },
    { auto: true },
  ],
});

export { expect };
