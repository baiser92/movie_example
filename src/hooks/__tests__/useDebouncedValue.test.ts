import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDebouncedValue } from '../useDebouncedValue';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 350));
    expect(result.current).toBe('a');
  });

  it('only publishes the last value after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 350), {
      initialProps: { value: 'b' },
    });

    rerender({ value: 'ba' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ value: 'bat' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('b');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe('bat');
  });
});
