import { Link, useParams } from 'react-router-dom';
import MovieDetailSkeleton from '../components/MovieDetailSkeleton';
import { useMovieDetails } from '../hooks/useMovieDetails';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { movie, loading, error } = useMovieDetails(id);

  return (
    <>
      <Link to="/" className="back-link">
        ← Back to search
      </Link>

      {loading && <MovieDetailSkeleton />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {movie && (
        <article className="detail">
          <div className="detail-poster">
            {movie.posterPath ? (
              <img src={movie.posterPath} alt={`${movie.title} poster`} />
            ) : (
              <div className="poster-placeholder" role="img" aria-label="No poster available">
                <span aria-hidden="true">{movie.title.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="content">
            <h1>{movie.title}</h1>
            {movie.tagline && <p className="tagline">{movie.tagline}</p>}
            <p className="meta">
              <span>{movie.releaseDate || 'Release date unknown'}</span>
              {movie.runtime ? <span>{movie.runtime} min</span> : null}
              <span className="rating-badge">★ {movie.rating.toFixed(1)}</span>
            </p>
            {movie.genres.length > 0 && (
              <ul className="genres">
                {movie.genres.map((genre) => (
                  <li key={genre} className="genre-pill">
                    {genre}
                  </li>
                ))}
              </ul>
            )}
            <p className="overview">{movie.overview || 'No overview available.'}</p>

            {movie.cast.length > 0 && (
              <>
                <h2>Cast</h2>
                <ul className="cast">
                  {movie.cast.map((member) => (
                    <li key={member.id}>
                      <span className="cast-avatar" aria-hidden="true">
                        {getInitials(member.name)}
                      </span>
                      <span className="cast-name">{member.name}</span>
                      {member.character && (
                        <span className="cast-character">{member.character}</span>
                      )}
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
