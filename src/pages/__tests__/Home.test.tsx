import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../Home';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import type { Movie } from '../../types/movie';

vi.mock('../../hooks/useMovieSearch', () => ({
  useMovieSearch: vi.fn(),
}));

const mockedUseMovieSearch = vi.mocked(useMovieSearch);

const movie: Movie = {
  id: 1,
  title: 'Search Result',
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7,
};

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockedUseMovieSearch.mockReset();
});

describe('Home', () => {
  it('shows a loading skeleton while searching', () => {
    mockedUseMovieSearch.mockReturnValue({
      movies: [],
      loading: true,
      error: null,
      page: 1,
      totalPages: 1,
    });

    renderHome();

    expect(screen.getByRole('status', { name: /loading movies/i })).toBeInTheDocument();
  });

  it('shows an error message', () => {
    mockedUseMovieSearch.mockReturnValue({
      movies: [],
      loading: false,
      error: 'Boom',
      page: 1,
      totalPages: 1,
    });

    renderHome();

    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
  });

  it('renders results and pagination once loaded', () => {
    mockedUseMovieSearch.mockReturnValue({
      movies: [movie],
      loading: false,
      error: null,
      page: 1,
      totalPages: 3,
    });

    renderHome();

    expect(screen.getByText('Search Result')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /loading movies/i })).not.toBeInTheDocument();
  });
});
