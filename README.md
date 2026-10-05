# Movie Explorer — React + TypeScript

A small production-style React + TypeScript project built as a code sample for my portfolio, showing how I structure a client app end to end: typed API layer, debounced/cancellable search, tests, CI, and linting.

It connects to the TMDB API to search for movies and display posters, ratings and release dates.

[![Tests](https://github.com/baiser92/movie_example/actions/workflows/ci.yml/badge.svg)](https://github.com/baiser92/movie_example/actions/workflows/ci.yml)

**Live demo:** [movie-sample-mauve.vercel.app](https://movie-sample-mauve.vercel.app) — no setup or API key needed, just open the link.

## Screenshots

| Search                                             | Movie detail                                     |
| -------------------------------------------------- | ------------------------------------------------ |
| ![Search results grid](docs/screenshot-search.png) | ![Movie detail page](docs/screenshot-detail.png) |

## Why TMDB?

TMDB provides movie and TV metadata through an API. A free developer API key can be used for non-commercial projects with the required attribution.

## Setup

Only needed if you want to run it locally — the live demo linked above already works without any of this.

1. Create a free [TMDB account](https://www.themoviedb.org/signup), then go to **Settings → API** ([themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)) and request an API Read Access Token (the long JWT-style one, not the short v3 key).
2. Copy `.env.example` to `.env` and paste your token in:

```bash
cp .env.example .env
```

```env
TMDB_ACCESS_TOKEN=your_token_here
```

3. Install and run:

```bash
npm install
npm run dev
```

## Features

- Debounced, cancellable movie search
- Movie detail page (tagline, genres, runtime, cast) with client-side routing
- Paginated search results
- Favorites, persisted to `localStorage` and kept in sync across the app

## Architecture

- `api/` — serverless proxy that holds the TMDB token (Vercel Functions)
- `src/api/` — client-side API layer (typed, zod-validated)
- `components/` — reusable UI components
- `hooks/` — data-fetching/state logic
- `pages/` — route-level views
- `types/` — domain types
- `App.tsx` — routes and page composition

The API layer is kept separate from the UI so the data source can be replaced without changing the components.

## Trade-offs

The TMDB token never reaches the browser. The client calls `/api/tmdb/...`, a Vercel serverless function (`api/tmdb/[...path].ts`) that adds the `Authorization` header server-side, only allows the endpoints the app uses (`search/movie`, `movie/:id`), and sets cache headers. In local development, `vite.config.ts` proxies `/api/tmdb` to TMDB with the same header.

The proxy itself is public (anyone can call the allowed endpoints), so a production app would also add rate limiting, for example per IP.
