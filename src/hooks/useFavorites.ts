import { useSyncExternalStore } from 'react';
import { Movie } from '../types/movie';

const STORAGE_KEY = 'movie-explorer:favorites';

type Listener = () => void;

const listeners = new Set<Listener>();
let favorites: Movie[] = load();

function load(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Movie[]) : [];
  } catch {
    return [];
  }
}

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage errors (private browsing, quota, disabled storage).
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return favorites;
}

export function toggleFavorite(movie: Movie) {
  favorites = favorites.some((favorite) => favorite.id === movie.id)
    ? favorites.filter((favorite) => favorite.id !== movie.id)
    : [...favorites, movie];
  notify();
}

export function clearFavorites() {
  favorites = [];
  notify();
}

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, getSnapshot);

  return {
    favorites: list,
    isFavorite: (id: number) => list.some((favorite) => favorite.id === id),
    toggleFavorite,
    clearFavorites,
  };
}
