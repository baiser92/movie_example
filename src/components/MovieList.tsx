import { Movie } from '../types/movie';
import MovieCard from './MovieCard';

type MovieListProps = {
  movies: Movie[];
  emptyMessage?: string;
};

export default function MovieList({ movies, emptyMessage = 'No movies found.' }: MovieListProps) {
  if (!movies.length) {
    return <p className="empty">{emptyMessage}</p>;
  }

  return (
    <section className="grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </section>
  );
}
