import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Fresh client per test: no shared cache, production staleTime, and no retries so failures
// surface immediately.
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 5 * 60 * 1000, gcTime: Infinity } },
  });
}

export function createQueryWrapper(client: QueryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
