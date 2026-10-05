import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createQueryWrapper } from '../../test/queryWrapper';
import { beforeEach, vi } from 'vitest';
import MovieCard from '../MovieCard';
import { movieKeys } from '../../api/queries';
import { getMovieDetails } from '../../api/tmdb';
import { createTestQueryClient } from '../../test/queryWrapper';
import { clearFavorites } from '../../hooks/useFavorites';

vi.mock('../../api/tmdb', () => ({
  getMovieDetails: vi.fn(),
}));

const mockedGetMovieDetails = vi.mocked(getMovieDetails);

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
  mockedGetMovieDetails.mockReset();
  mockedGetMovieDetails.mockResolvedValue({} as never);
});

describe('MovieCard', () => {
  it('renders title, rating and fallback poster', () => {
    render(
      <MemoryRouter>
        <MovieCard movie={movie} />
      </MemoryRouter>,
      { wrapper: createQueryWrapper() },
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
      { wrapper: createQueryWrapper() },
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/movie/1');
  });

  it('toggles favorite state when the star button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MovieCard movie={movie} />
      </MemoryRouter>,
      { wrapper: createQueryWrapper() },
    );

    const button = screen.getByRole('button', { name: /add test movie to favorites/i });
    await user.click(button);

    expect(
      screen.getByRole('button', { name: /remove test movie from favorites/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('prefetches the movie details on hover and on focus, only hitting the API once', async () => {
    const user = userEvent.setup();
    const client = createTestQueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <MovieCard movie={movie} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const link = screen.getByRole('link');
    await user.hover(link);
    await waitFor(() =>
      expect(client.getQueryState(movieKeys.detail(movie.id))?.status).toBe('success'),
    );
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(movie.id, expect.any(AbortSignal));

    act(() => link.focus());
    expect(mockedGetMovieDetails).toHaveBeenCalledTimes(1);
  });
});
