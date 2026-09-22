import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { Movie } from '../types/movie';

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(movie.id);

  return (
    <article className="card">
      <button
        type="button"
        className="favorite-toggle"
        aria-label={
          favorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`
        }
        aria-pressed={favorite}
        onClick={() => toggleFavorite(movie)}
      >
        {favorite ? '★' : '☆'}
      </button>

      <Link to={`/movie/${movie.id}`} className="card-link">
        {movie.posterPath ? (
          <img src={movie.posterPath} alt={`${movie.title} poster`} />
        ) : (
          <div className="poster-placeholder">No poster</div>
        )}

        <div className="content">
          <h2>{movie.title}</h2>
          <p className="meta">
            {movie.releaseDate || 'Release date unknown'} · ⭐ {movie.rating.toFixed(1)}
          </p>
          <p>{movie.overview || 'No overview available.'}</p>
        </div>
      </Link>
    </article>
  );
}
