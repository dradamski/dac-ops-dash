import type { DacUnit } from '../../types/domain';
import { getBuildingsFromUnits } from '../../utils/buildings';

interface BuildingFilterProps {
  units: DacUnit[];
  selectedBuilding: string | null;
  onSelect: (building: string | null) => void;
  disabled?: boolean;
}

/**
 * Dropdown filter for selecting a building
 */
export function BuildingFilter({
  units,
  selectedBuilding,
  onSelect,
  disabled = false,
}: BuildingFilterProps) {
  const buildings = getBuildingsFromUnits(units);

  return (
    <div className="building-filter">
      <label htmlFor="building-select" className="filter-label">
        Building
      </label>
      <select
        id="building-select"
        value={selectedBuilding || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        disabled={disabled}
        className="filter-input"
      >
        <option value="">All Buildings</option>
        {buildings.map((building) => (
          <option key={building} value={building}>
            {building}
          </option>
        ))}
      </select>
      <style jsx>{`
        .building-filter {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background-color: white;
          color: #111827;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-input:hover:not(:disabled) {
          border-color: #9ca3af;
        }

        .filter-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-input:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

