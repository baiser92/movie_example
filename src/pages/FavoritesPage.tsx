import MovieList from '../components/MovieList';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <>
      <div className="page-heading">
        <h1>Your Favorites</h1>
        {favorites.length > 0 && (
          <button type="button" className="clear-favorites" onClick={clearFavorites}>
            Clear all favorites
          </button>
        )}
      </div>
      <MovieList
        movies={favorites}
        emptyMessage="No favorites yet — star a movie to save it here."
      />
    </>
  );
}
