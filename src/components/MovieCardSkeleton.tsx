export default function MovieCardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="poster skeleton-block" />
      <div className="content">
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}
