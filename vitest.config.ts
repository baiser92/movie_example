import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Playwright specs live in e2e/ and run with `npm run test:e2e`.
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});
