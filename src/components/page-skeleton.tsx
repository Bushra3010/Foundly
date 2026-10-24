/** Placeholder shown the moment a page is opened, so a click never feels ignored. */
export function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status" aria-label="Loading">
      <span className="sk-title" />
      <span className="sk-line" />
      <span className="sk-card" />
      <span className="sk-row" />
      <span className="sk-row" />
    </div>
  );
}
