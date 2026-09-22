import MovieList from '../components/MovieList';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <>
      {favorites.length > 0 && (
        <button type="button" className="clear-favorites" onClick={clearFavorites}>
          Clear all favorites
        </button>
      )}
      <MovieList
        movies={favorites}
        emptyMessage="No favorites yet — star a movie to save it here."
      />
    </>
  );
}
