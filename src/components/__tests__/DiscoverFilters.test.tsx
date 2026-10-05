import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import DiscoverFilters from '../DiscoverFilters';
import { getGenres } from '../../api/tmdb';
import { NO_FILTERS } from '../../lib/browseParams';
import { createQueryWrapper } from '../../test/queryWrapper';

vi.mock('../../api/tmdb', () => ({ getGenres: vi.fn() }));

const mockedGetGenres = vi.mocked(getGenres);

describe('DiscoverFilters', () => {
  it('loads genres into the select and reports a genre change', async () => {
    mockedGetGenres.mockResolvedValue([{ id: 28, name: 'Action' }]);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<DiscoverFilters filters={NO_FILTERS} onChange={onChange} />, {
      wrapper: createQueryWrapper(),
    });
    await screen.findByRole('option', { name: 'Action' });
    await user.selectOptions(screen.getByLabelText('Genre'), 'Action');

    expect(onChange).toHaveBeenCalledWith({ ...NO_FILTERS, genre: 28 });
  });

  it('reports year, rating and sort changes, and clearing back to null', async () => {
    mockedGetGenres.mockResolvedValue([]);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<DiscoverFilters filters={{ ...NO_FILTERS, year: 2020 }} onChange={onChange} />, {
      wrapper: createQueryWrapper(),
    });

    await user.selectOptions(screen.getByLabelText('Year'), '');
    expect(onChange).toHaveBeenLastCalledWith({ ...NO_FILTERS, year: null });

    await user.selectOptions(screen.getByLabelText('Minimum rating'), '8');
    expect(onChange).toHaveBeenLastCalledWith({ ...NO_FILTERS, year: 2020, rating: 8 });

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Highest rated');
    expect(onChange).toHaveBeenLastCalledWith({
      ...NO_FILTERS,
      year: 2020,
      sort: 'vote_average.desc',
    });
  });

  it('still renders the other filters when the genre request fails', async () => {
    mockedGetGenres.mockRejectedValue(new Error('boom'));

    render(<DiscoverFilters filters={NO_FILTERS} onChange={vi.fn()} />, {
      wrapper: createQueryWrapper(),
    });

    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Any genre' })).toBeInTheDocument();
  });
});
