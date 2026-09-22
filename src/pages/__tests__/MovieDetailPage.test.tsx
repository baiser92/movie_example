import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MovieDetailPage from '../MovieDetailPage';
import { useMovieDetails } from '../../hooks/useMovieDetails';
import type { MovieDetail } from '../../types/movie';

vi.mock('../../hooks/useMovieDetails', () => ({
  useMovieDetails: vi.fn(),
}));

const mockedUseMovieDetails = vi.mocked(useMovieDetails);

const movie: MovieDetail = {
  id: 42,
  title: 'Detail Movie',
  overview: 'An overview',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 8,
  tagline: 'A tagline',
  runtime: 120,
  genres: ['Drama'],
  cast: [{ id: 1, name: 'Actor One', character: 'Role One' }],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/movie/42']}>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockedUseMovieDetails.mockReset();
});

describe('MovieDetailPage', () => {
  it('shows a loading state', () => {
    mockedUseMovieDetails.mockReturnValue({ movie: null, loading: true, error: null });

    renderPage();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows an error message', () => {
    mockedUseMovieDetails.mockReturnValue({ movie: null, loading: false, error: 'Boom' });

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
  });

  it('renders movie detail, genres and cast', () => {
    mockedUseMovieDetails.mockReturnValue({ movie, loading: false, error: null });

    renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Detail Movie');
    expect(screen.getByText('A tagline')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText(/Actor One/)).toBeInTheDocument();
    expect(screen.getByText(/120 min/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to search/ })).toHaveAttribute('href', '/');
  });
});
