import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDacUnits } from '../hooks/useDacUnits';
import { useFilters } from '../context/FilterContext';
import { SystemStatusCard } from '../components/overview/SystemStatusCard';
import { UnitStatusGrid } from '../components/overview/UnitStatusGrid';
import { AlertBanner } from '../components/overview/AlertBanner';
import { BuildingFilter } from '../components/common/BuildingFilter';
import { Card } from '../components/common/Card';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { filterUnitsByBuilding } from '../utils/buildings';
import type { UnitStatus, DacUnit } from '../types/domain';

/**
 * Dashboard page showing system overview and unit status
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { units, isLoading, error, refetch } = useDacUnits();
  const { selectedBuilding, setSelectedBuilding } = useFilters();

  const handleUnitClick = (unit: DacUnit) => {
    navigate(`/tests?unitId=${unit.id}`);
  };

  // Filter units by building
  const filteredUnits = useMemo(() => {
    return filterUnitsByBuilding(units, selectedBuilding);
  }, [units, selectedBuilding]);

  // Calculate status counts based on filtered units
  const statusCounts = useMemo(() => {
    const counts: Record<UnitStatus, number> = {
      healthy: 0,
      warning: 0,
      critical: 0,
    };

    filteredUnits.forEach((unit) => {
      counts[unit.status]++;
    });

    return counts;
  }, [filteredUnits]);

  // Get critical units for alert
  const criticalUnits = useMemo(() => {
    return filteredUnits.filter((unit) => unit.status === 'critical');
  }, [filteredUnits]);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>DAC Operations Dashboard</h1>
        <p className="page-subtitle">System overview and unit status</p>
      </div>

      {criticalUnits.length > 0 && (
        <AlertBanner
          message={`${criticalUnits.length} unit${criticalUnits.length !== 1 ? 's' : ''} in critical status. Immediate attention required.`}
          severity="critical"
          action={
            criticalUnits.length > 0
              ? {
                label: 'View Units',
                onClick: () => {
                  // Scroll to units section
                  document.getElementById('units-section')?.scrollIntoView({ behavior: 'smooth' });
                },
              }
              : undefined
          }
        />
      )}

      <div className="filters-section">
        <Card title="Filters">
          <div className="filters-content">
            <BuildingFilter
              units={units}
              selectedBuilding={selectedBuilding}
              onSelect={setSelectedBuilding}
            />
          </div>
        </Card>
      </div>

      <div className="status-cards">
        <SystemStatusCard status="healthy" count={statusCounts.healthy} />
        <SystemStatusCard status="warning" count={statusCounts.warning} />
        <SystemStatusCard status="critical" count={statusCounts.critical} />
      </div>

      <div id="units-section" className="units-section">
        <Card title="DAC Units">
          <UnitStatusGrid units={filteredUnits} onUnitClick={handleUnitClick} />
        </Card>
      </div>

      <style jsx>{`
        .dashboard-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .filters-section {
          margin-bottom: 2rem;
        }

        .filters-content {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .status-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .units-section {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}

