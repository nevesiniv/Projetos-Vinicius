import './Skeleton.css';

function Skeleton({ type = 'text', width, height, count = 1 }) {
  const skeletons = Array(count).fill(null);

  if (type === 'entry-card') {
    return (
      <div className="skeleton-entry-card">
        <div className="skeleton-header">
          <div className="skeleton skeleton-date"></div>
          <div className="skeleton-actions">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-icon"></div>
          </div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line short"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`skeleton skeleton-${type}`}
          style={{
            width: width || undefined,
            height: height || undefined,
          }}
        />
      ))}
    </>
  );
}

function EntrySkeleton({ count = 3 }) {
  return (
    <div className="entries-skeleton">
      {Array(count).fill(null).map((_, index) => (
        <Skeleton key={index} type="entry-card" />
      ))}
    </div>
  );
}

export { Skeleton, EntrySkeleton };
export default Skeleton;
