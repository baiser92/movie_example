import { describe, it, expect } from 'vitest';
import { createQueryClient, shouldRetry } from '../queryClient';
import { TmdbError } from '../tmdb';

describe('shouldRetry', () => {
  it('never retries 4xx errors', () => {
    expect(shouldRetry(0, new TmdbError(401))).toBe(false);
    expect(shouldRetry(0, new TmdbError(404))).toBe(false);
  });

  it('retries 5xx and unknown errors up to twice', () => {
    expect(shouldRetry(0, new TmdbError(502))).toBe(true);
    expect(shouldRetry(1, new Error('network'))).toBe(true);
    expect(shouldRetry(2, new TmdbError(502))).toBe(false);
  });
});

describe('createQueryClient', () => {
  it('uses the agreed defaults', () => {
    const options = createQueryClient().getDefaultOptions().queries;
    expect(options?.staleTime).toBe(5 * 60 * 1000);
    expect(options?.refetchOnWindowFocus).toBe(false);
    expect(options?.retry).toBe(shouldRetry);
  });
});
