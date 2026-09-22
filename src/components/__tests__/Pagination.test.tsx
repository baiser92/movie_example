import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('disables Prev on the first page and Next on the last page', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByText('← Prev')).toBeDisabled();
    expect(screen.getByText('Next →')).not.toBeDisabled();

    rerender(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByText('← Prev')).not.toBeDisabled();
    expect(screen.getByText('Next →')).toBeDisabled();
  });

  it('calls onPageChange with the next/previous page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByText('Next →'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByText('← Prev'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
