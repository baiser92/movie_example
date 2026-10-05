import { proxyTmdb } from '../_lib/tmdbProxy';

export function GET(request: Request): Promise<Response> {
  return proxyTmdb(request, process.env.TMDB_ACCESS_TOKEN);
}
