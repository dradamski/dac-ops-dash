import { useState, useEffect, useCallback } from 'react';
import type { SensorReading, SensorType, SensorDataFilter } from '../types/domain';
import { fetchSensorReadings, fetchMultipleSensorReadings } from '../api/sensors';

interface UseSensorDataOptions {
  filter: SensorDataFilter;
  enabled?: boolean; // Allow disabling automatic fetching
}

interface UseSensorDataResult {
  data: SensorReading[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching sensor readings
 */
export function useSensorData(options: UseSensorDataOptions): UseSensorDataResult {
  const { filter, enabled = true } = options;
  const [data, setData] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !filter.sensorType || !filter.timeRange || !filter.unitId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const readings = await fetchSensorReadings(filter);
      setData(readings);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch sensor data');
      setError(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter.sensorType, filter.timeRange, filter.unitId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

interface UseMultipleSensorDataOptions {
  filter: Omit<SensorDataFilter, 'sensorType'> & { sensorTypes: SensorType[] };
  enabled?: boolean;
}

interface UseMultipleSensorDataResult {
  data: Record<SensorType, SensorReading[]>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching multiple sensor types at once
 */
export function useMultipleSensorData(
  options: UseMultipleSensorDataOptions
): UseMultipleSensorDataResult {
  const { filter, enabled = true } = options;
  const [data, setData] = useState<Record<SensorType, SensorReading[]>>(
    {} as Record<SensorType, SensorReading[]>
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !filter.timeRange || !filter.unitId || filter.sensorTypes.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const readings = await fetchMultipleSensorReadings({
        ...filter,
        sensorTypes: filter.sensorTypes,
      });
      setData(readings);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch sensor data');
      setError(error);
      setData({} as Record<SensorType, SensorReading[]>);
    } finally {
      setIsLoading(false);
    }
  }, [filter.timeRange, filter.unitId, filter.sensorTypes, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

