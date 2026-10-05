import { test, expect } from './fixtures';

test('opens a movie detail page and goes back', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Trending One/ }).click();
  await expect(page).toHaveURL(/\/movie\/1$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Trending One' })).toBeVisible();
  await expect(page.getByText('A tagline')).toBeVisible();

  await page.getByRole('link', { name: /back to search/i }).click();
  await expect(page.getByRole('heading', { name: 'Trending One' })).toBeVisible();
});

test('favorites persist across a reload', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Trending One to favorites' }).click();
  await expect(page.getByRole('link', { name: /Favorites \(1\)/ })).toBeVisible();

  await page.goto('/favorites');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Trending One' })).toBeVisible();
});
