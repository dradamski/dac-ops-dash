import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SensorType, TimeRange } from '../types/domain';

interface FilterState {
  selectedUnitId: string | null;
  selectedSensorType: SensorType | null;
  timeRange: TimeRange | null;
}

interface FilterContextValue extends FilterState {
  setSelectedUnitId: (unitId: string | null) => void;
  setSelectedSensorType: (sensorType: SensorType | null) => void;
  setTimeRange: (timeRange: TimeRange | null) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  defaultUnitId?: string | null;
  defaultSensorType?: SensorType | null;
  defaultTimeRange?: TimeRange | null;
}

/**
 * Default time range: last 24 hours
 */
function getDefaultTimeRange(): TimeRange {
  const end = new Date();
  const start = new Date();
  start.setHours(start.getHours() - 24);
  return { start, end };
}

/**
 * Provider component for filter context
 */
export function FilterProvider({
  children,
  defaultUnitId = null,
  defaultSensorType = null,
  defaultTimeRange = getDefaultTimeRange(),
}: FilterProviderProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(defaultUnitId);
  const [selectedSensorType, setSelectedSensorType] = useState<SensorType | null>(
    defaultSensorType
  );
  const [timeRange, setTimeRange] = useState<TimeRange | null>(defaultTimeRange);

  const resetFilters = useCallback(() => {
    setSelectedUnitId(defaultUnitId);
    setSelectedSensorType(defaultSensorType);
    setTimeRange(defaultTimeRange || getDefaultTimeRange());
  }, [defaultUnitId, defaultSensorType, defaultTimeRange]);

  const value: FilterContextValue = {
    selectedUnitId,
    selectedSensorType,
    timeRange,
    setSelectedUnitId,
    setSelectedSensorType,
    setTimeRange,
    resetFilters,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

/**
 * Hook to access filter context
 * @throws Error if used outside FilterProvider
 */
export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

