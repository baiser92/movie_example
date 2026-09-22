export default function MovieDetailSkeleton() {
  return (
    <div className="detail" role="status" aria-label="Loading movie details">
      <div className="detail-poster skeleton-block" />
      <div className="content">
        <div className="skeleton-block skeleton-line skeleton-line--title" />
        <div className="skeleton-block skeleton-line skeleton-line--tagline" />
        <div className="skeleton-block skeleton-line skeleton-line--meta" />
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}
