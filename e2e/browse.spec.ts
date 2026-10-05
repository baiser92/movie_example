import { test, expect } from './fixtures';

test('home loads the trending list by default', async ({ page, api }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Trending One' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Trending', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(api.last('trending/movie/week')?.searchParams.get('page')).toBe('1');
});

test('switching tabs updates the URL and Back returns to the previous tab', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Popular' }).click();
  await expect(page).toHaveURL(/\?list=popular$/);
  await expect(page.getByRole('heading', { name: 'Popular One' })).toBeVisible();

  await page.getByRole('button', { name: 'Now playing' }).click();
  await expect(page.getByRole('heading', { name: 'Now Playing One' })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\?list=popular$/);
  await expect(page.getByRole('heading', { name: 'Popular One' })).toBeVisible();
});

test('discover filters go to the URL and to the TMDB request', async ({ page, api }) => {
  await page.goto('/?list=discover');
  await expect(page.getByRole('heading', { name: 'Discovered One' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Action' })).toBeAttached();

  await page.getByLabel('Genre').selectOption({ label: 'Action' });
  await page.getByLabel('Minimum rating').selectOption('7');

  await expect(page).toHaveURL(/list=discover&genre=28&rating=7$/);
  await expect.poll(() => api.last('discover/movie')?.searchParams.get('with_genres')).toBe('28');
  expect(api.last('discover/movie')?.searchParams.get('vote_average.gte')).toBe('7');
});

test('a shared discover URL restores the filters', async ({ page }) => {
  await page.goto('/?list=discover&genre=18&year=2020&sort=vote_average.desc');

  await expect(page.getByLabel('Genre')).toHaveValue('18');
  await expect(page.getByLabel('Year')).toHaveValue('2020');
  await expect(page.getByLabel('Sort by')).toHaveValue('vote_average.desc');
});

test('searching hides the tabs and clearing returns to the previous tab', async ({ page }) => {
  await page.goto('/?list=popular');

  await page.getByRole('textbox', { name: 'Search movies' }).fill('matrix');
  await expect(page.getByRole('heading', { name: 'Matrix Result' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Browse movies' })).toBeHidden();
  await expect(page).toHaveURL(/list=popular&q=matrix$/);

  await page.getByRole('textbox', { name: 'Search movies' }).clear();
  await expect(page.getByRole('heading', { name: 'Popular One' })).toBeVisible();
  await expect(page).toHaveURL(/\?list=popular$/);
});

test('paging pushes history and Back returns to the previous page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /next/i }).click();
  await expect(page).toHaveURL(/\?page=2$/);
  await expect(page.getByText('Page 2 of 3')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Page 1 of 3')).toBeVisible();
});
