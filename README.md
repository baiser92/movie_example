# Movie Explorer — React + TypeScript

A small production-style React + TypeScript project created as a code sample for 

It connects to the TMDB API to search for movies and display posters, ratings and release dates.

[![Tests](https://github.com/baiser92/movie_example/actions/workflows/ci.yml/badge.svg)](https://github.com/baiser92/movie_example/actions/workflows/ci.yml)

## Why TMDB?

TMDB provides movie and TV metadata through an API. A free developer API key can be used for non-commercial projects with the required attribution.

## Setup

1. Create a TMDB account and request an API key / API Read Access Token.
2. Create a `.env` file:

```env
VITE_TMDB_ACCESS_TOKEN=your_token_here
```

3. Install and run:

```bash
npm install
npm run dev
```

## Architecture

- `api/` — external API communication
- `components/` — reusable UI components
- `hooks/` — data-fetching/state logic
- `types/` — domain types
- `App.tsx` — page composition

The API layer is kept separate from the UI so the data source can be replaced without changing the components.
