import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach } from 'vitest';
import MovieCard from '../MovieCard';
import { clearFavorites } from '../../hooks/useFavorites';

const movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'An overview',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7.25,
};

beforeEach(() => {
  clearFavorites();
});

describe('MovieCard', () => {
  it('renders title, rating and fallback poster', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={movie} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Movie');
    expect(screen.getByText(/Release date unknown|2020-01-01/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /no poster available/i })).toBeInTheDocument();
    expect(screen.getByText(/7.3/)).toBeInTheDocument();
  });

  it('links to the movie detail page', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={movie} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/movie/1');
  });

  it('toggles favorite state when the star button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MovieCard movie={movie} />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /add test movie to favorites/i });
    await user.click(button);

    expect(
      screen.getByRole('button', { name: /remove test movie from favorites/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
