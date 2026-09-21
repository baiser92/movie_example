import { Movie } from "../types/movie";

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="card">
      {movie.posterPath ? (
        <img src={movie.posterPath} alt={`${movie.title} poster`} />
      ) : (
        <div className="poster-placeholder">No poster</div>
      )}

      <div className="content">
        <h2>{movie.title}</h2>
        <p className="meta">
          {movie.releaseDate || "Release date unknown"} · ⭐{" "}
          {movie.rating.toFixed(1)}
        </p>
        <p>{movie.overview || "No overview available."}</p>
      </div>
    </article>
  );
}
