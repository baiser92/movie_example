import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieList from '../MovieList';

const movies = [
  { id: 1, title: 'A', overview: '', posterPath: null, releaseDate: '', rating: 5 },
  { id: 2, title: 'B', overview: '', posterPath: null, releaseDate: '', rating: 6 },
];

describe('MovieList', () => {
  it('shows empty message when no movies', () => {
    render(
      <MemoryRouter>
        <MovieList movies={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/No movies found/)).toBeInTheDocument();
  });

  it('renders a list of movies', () => {
    render(
      <MemoryRouter>
        <MovieList movies={movies} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'B' })).toBeInTheDocument();
  });
});
