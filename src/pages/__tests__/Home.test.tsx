import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../Home';
import { createQueryWrapper } from '../../test/queryWrapper';
import { useMovieBrowse } from '../../hooks/useMovieBrowse';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import type { Movie } from '../../types/movie';

vi.mock('../../hooks/useMovieSearch', () => ({
  useMovieSearch: vi.fn(),
}));

vi.mock('../../hooks/useMovieBrowse', () => ({
  useMovieBrowse: vi.fn(),
}));

const mockedUseMovieSearch = vi.mocked(useMovieSearch);
const mockedUseMovieBrowse = vi.mocked(useMovieBrowse);

const movie: Movie = {
  id: 1,
  title: 'Search Result',
  overview: '',
  posterPath: null,
  releaseDate: '2020-01-01',
  rating: 7,
};

function renderHome(url = '/?q=x') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Home />
    </MemoryRouter>,
    { wrapper: createQueryWrapper() },
  );
}

const idleSearch = { movies: [], loading: false, error: null, page: 1, totalPages: 1 };
const idleBrowse = { movies: [], loading: false, error: null, totalPages: 1 };

beforeEach(() => {
  mockedUseMovieSearch.mockReset();
  mockedUseMovieSearch.mockReturnValue(idleSearch);
  mockedUseMovieBrowse.mockReset();
  mockedUseMovieBrowse.mockReturnValue(idleBrowse);
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

describe('Home browse mode', () => {
  const browseMovie = { ...movie, id: 9, title: 'Trending Pick' };

  function LocationDisplay() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname + location.search}</output>;
  }

  function renderAt(url: string) {
    return render(
      <MemoryRouter initialEntries={[url]}>
        <Home />
        <LocationDisplay />
      </MemoryRouter>,
      { wrapper: createQueryWrapper() },
    );
  }

  beforeEach(() => {
    mockedUseMovieBrowse.mockReturnValue({ ...idleBrowse, movies: [browseMovie], totalPages: 3 });
  });

  it('shows the trending tab by default, with no filters', () => {
    renderAt('/');

    expect(screen.getByText('Trending Pick')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trending' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('form', { name: /discover filters/i })).not.toBeInTheDocument();
    expect(mockedUseMovieBrowse).toHaveBeenLastCalledWith(
      expect.objectContaining({ list: 'trending', page: 1 }),
      true,
    );
  });

  it('pushes the selected tab to the URL and resets the page', async () => {
    const user = userEvent.setup();
    renderAt('/?page=3');

    await user.click(screen.getByRole('button', { name: 'Popular' }));

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/?list=popular'));
  });

  it('shows filters on the discover tab and writes them to the URL', async () => {
    const user = userEvent.setup();
    renderAt('/?list=discover&genre=28');

    expect(screen.getByRole('form', { name: /discover filters/i })).toBeInTheDocument();
    expect(mockedUseMovieBrowse).toHaveBeenLastCalledWith(
      expect.objectContaining({
        list: 'discover',
        filters: expect.objectContaining({ genre: 28 }),
      }),
      true,
    );

    await user.selectOptions(screen.getByLabelText('Minimum rating'), '7');

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/?list=discover&genre=28&rating=7'),
    );
  });

  it('hides tabs and filters, and disables browsing, while searching', () => {
    mockedUseMovieSearch.mockReturnValue({ ...idleSearch, movies: [movie] });

    renderAt('/?list=discover&q=matrix');

    expect(screen.queryByRole('navigation', { name: /browse movies/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('form', { name: /discover filters/i })).not.toBeInTheDocument();
    expect(screen.getByText('Search Result')).toBeInTheDocument();
    expect(mockedUseMovieBrowse).toHaveBeenLastCalledWith(expect.any(Object), false);
  });

  it('keeps the tab in the URL when typing and clearing a search', async () => {
    const user = userEvent.setup();
    renderAt('/?list=popular&page=2');

    await user.type(screen.getByRole('textbox', { name: /search movies/i }), 'a');
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/?list=popular&q=a'),
    );

    await user.clear(screen.getByRole('textbox', { name: /search movies/i }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/?list=popular'));
  });

  it('shows a skeleton, not an empty message, while the first keystroke is debounced', () => {
    vi.useFakeTimers();
    try {
      renderAt('/');
      fireEvent.change(screen.getByRole('textbox', { name: /search movies/i }), {
        target: { value: 'b' },
      });

      expect(screen.getByRole('status', { name: /loading movies/i })).toBeInTheDocument();
      expect(screen.queryByText(/no movies found/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
