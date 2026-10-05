import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../Home';
import { createQueryWrapper } from '../../test/queryWrapper';
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
    { wrapper: createQueryWrapper() },
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

describe('Home URL state', () => {
  const loaded = { movies: [movie], loading: false, error: null, page: 1, totalPages: 5 };

  function renderAt(url: string) {
    return render(
      <MemoryRouter initialEntries={[url]}>
        <Home />
        <LocationDisplay />
      </MemoryRouter>,
      { wrapper: createQueryWrapper() },
    );
  }

  function LocationDisplay() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname + location.search}</output>;
  }

  it('reads query and page from the URL', () => {
    mockedUseMovieSearch.mockReturnValue(loaded);

    renderAt('/?q=matrix&page=2');

    expect(screen.getByRole('textbox', { name: /search movies/i })).toHaveValue('matrix');
    expect(mockedUseMovieSearch).toHaveBeenLastCalledWith('matrix', 2);
  });

  it.each(['abc', '0', '-3', '1.5'])('falls back to page 1 for ?page=%s', (value) => {
    mockedUseMovieSearch.mockReturnValue(loaded);

    renderAt(`/?q=matrix&page=${value}`);

    expect(mockedUseMovieSearch).toHaveBeenLastCalledWith('matrix', 1);
  });

  it('writes the query to the URL and drops the page when typing', async () => {
    mockedUseMovieSearch.mockReturnValue(loaded);
    const user = userEvent.setup();

    renderAt('/?q=ma&page=3');
    await user.type(screen.getByRole('textbox', { name: /search movies/i }), 'x');

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/?q=max'));
  });

  it('removes q from the URL when the input is cleared', async () => {
    mockedUseMovieSearch.mockReturnValue(loaded);
    const user = userEvent.setup();

    renderAt('/?q=a');
    await user.clear(screen.getByRole('textbox', { name: /search movies/i }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/));
  });

  it('pushes page changes to the URL, removing page for page 1', async () => {
    mockedUseMovieSearch.mockReturnValue({ ...loaded, page: 2 });
    const user = userEvent.setup();

    renderAt('/?q=matrix&page=2');

    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/?q=matrix&page=3'),
    );

    await user.click(screen.getByRole('button', { name: /prev/i }));
    await user.click(screen.getByRole('button', { name: /prev/i }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/\?q=matrix$/));
  });

  it('debounces the query passed to the search hook', async () => {
    vi.useFakeTimers();
    try {
      mockedUseMovieSearch.mockReturnValue(loaded);

      renderAt('/');
      const input = screen.getByRole('textbox', { name: /search movies/i });
      fireEvent.change(input, { target: { value: 'ba' } });
      fireEvent.change(input, { target: { value: 'bat' } });
      expect(mockedUseMovieSearch).not.toHaveBeenCalledWith('bat', 1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });
      expect(mockedUseMovieSearch).toHaveBeenLastCalledWith('bat', 1);
    } finally {
      vi.useRealTimers();
    }
  });
});
