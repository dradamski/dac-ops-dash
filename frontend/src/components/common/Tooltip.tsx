import { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

/**
 * Tooltip component that shows additional information on hover
 */
export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionStyles = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '0.5rem',
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '0.5rem',
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '0.5rem',
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '0.5rem',
    },
  };

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} style={positionStyles[position]}>
          {content}
        </div>
      )}
      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }

        .tooltip {
          position: absolute;
          background-color: #1f2937;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .tooltip::after {
          content: '';
          position: absolute;
          border: 4px solid transparent;
        }

        .tooltip-top::after {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-top-color: #1f2937;
        }

        .tooltip-bottom::after {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: #1f2937;
        }

        .tooltip-left::after {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-left-color: #1f2937;
        }

        .tooltip-right::after {
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-right-color: #1f2937;
        }
      `}</style>
    </div>
  );
}

