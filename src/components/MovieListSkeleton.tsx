import MovieCardSkeleton from './MovieCardSkeleton';

type MovieListSkeletonProps = {
  count?: number;
};

export default function MovieListSkeleton({ count = 6 }: MovieListSkeletonProps) {
  return (
    <section className="grid" role="status" aria-label="Loading movies">
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </section>
  );
}
