import { labels } from '../presentation';

export function Badge({ status }) {
  return <span className={`badge ${status}`}>{labels[status]}</span>;
}

export function Notice({ children }) {
  return (
    <div className="notice" role="alert">
      {children}
    </div>
  );
}
