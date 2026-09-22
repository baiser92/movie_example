import { Movie } from '../types/movie';
import MovieCard from './MovieCard';

type MovieListProps = {
  movies: Movie[];
};

export default function MovieList({ movies }: MovieListProps) {
  if (!movies.length) {
    return <p className="empty">No movies found.</p>;
  }

  return (
    <section className="grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </section>
  );
}
