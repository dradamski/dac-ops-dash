import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  headerAction?: ReactNode;
}

/**
 * Reusable card component for displaying content in a contained box
 */
export function Card({ children, title, className = '', headerAction }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || headerAction) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-content">{children}</div>
      <style jsx>{`
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
          transition: box-shadow 0.2s;
        }

        .card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .card-header-action {
          display: flex;
          align-items: center;
        }

        .card-content {
          color: #374151;
        }
      `}</style>
    </div>
  );
}

