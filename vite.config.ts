import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Empty prefix: read TMDB_ACCESS_TOKEN (no VITE_ prefix) so it never reaches the client bundle.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // Dev-only stand-in for the api/tmdb serverless function.
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, '/3'),
          headers: { Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}` },
        },
      },
    },
  };
});
