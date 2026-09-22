import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import FavoritesPage from '../FavoritesPage';
import { clearFavorites, toggleFavorite } from '../../hooks/useFavorites';
import type { Movie } from '../../types/movie';

const movie: Movie = {
  id: 1,
  title: 'Favorited Movie',
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7,
};

beforeEach(() => {
  clearFavorites();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  );
}

describe('FavoritesPage', () => {
  it('shows an empty state message when there are no favorites', () => {
    renderPage();
    expect(screen.getByText(/No favorites yet/)).toBeInTheDocument();
  });

  it('lists favorited movies and clears them all', async () => {
    toggleFavorite(movie);
    const user = userEvent.setup();

    renderPage();
    expect(screen.getByText('Favorited Movie')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear all favorites/i }));

    expect(screen.getByText(/No favorites yet/)).toBeInTheDocument();
  });
});
