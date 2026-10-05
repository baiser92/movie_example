import { proxyTmdb } from './_lib/tmdbProxy.js';

// Reached through the rewrite in vercel.json: /api/tmdb/<path> -> /api/tmdb?path=<path>
export function GET(request: Request): Promise<Response> {
  return proxyTmdb(request, process.env.TMDB_ACCESS_TOKEN);
}
