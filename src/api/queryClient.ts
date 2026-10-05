import { QueryClient } from '@tanstack/react-query';
import { TmdbError } from './tmdb';

const MAX_RETRIES = 2;

// 4xx means the request itself is wrong (or the route is not allowed); retrying cannot fix it.
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof TmdbError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  });
}
