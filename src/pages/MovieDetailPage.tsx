import { Link, useParams } from 'react-router-dom';
import { useMovieDetails } from '../hooks/useMovieDetails';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { movie, loading, error } = useMovieDetails(id);

  return (
    <>
      <Link to="/" className="back-link">
        ← Back to search
      </Link>

      {loading && <p>Loading...</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {movie && (
        <article className="detail">
          {movie.posterPath ? (
            <img src={movie.posterPath} alt={`${movie.title} poster`} />
          ) : (
            <div className="poster-placeholder">No poster</div>
          )}

          <div className="content">
            <h1>{movie.title}</h1>
            {movie.tagline && <p className="tagline">{movie.tagline}</p>}
            <p className="meta">
              {movie.releaseDate || 'Release date unknown'} · ⭐ {movie.rating.toFixed(1)}
              {movie.runtime ? ` · ${movie.runtime} min` : ''}
            </p>
            {movie.genres.length > 0 && <p className="genres">{movie.genres.join(', ')}</p>}
            <p>{movie.overview || 'No overview available.'}</p>

            {movie.cast.length > 0 && (
              <>
                <h2>Cast</h2>
                <ul className="cast">
                  {movie.cast.map((member) => (
                    <li key={member.id}>
                      <strong>{member.name}</strong>
                      {member.character ? ` as ${member.character}` : ''}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </article>
      )}
    </>
  );
}
