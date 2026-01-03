import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout wrapper with navigation
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/sensors', label: 'Sensors', icon: '📈' },
    { path: '/tests', label: 'Tests', icon: '🧪' },
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>DAC Operations</h2>
          </div>
          <ul className="nav-links">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .nav-links {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .nav-link.active {
          background-color: #eff6ff;
          color: #3b82f6;
        }

        .nav-icon {
          font-size: 1.125rem;
        }

        .main-content {
          flex: 1;
          background-color: #f9fafb;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-links {
            width: 100%;
            justify-content: space-around;
          }

          .nav-link {
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

