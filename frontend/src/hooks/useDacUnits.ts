import { useState, useEffect, useCallback } from 'react';
import type { DacUnit, UnitStatus } from '../types/domain';
import { fetchDacUnits, fetchDacUnit, updateDacUnitStatus } from '../api/units';

interface UseDacUnitsResult {
  units: DacUnit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching all DAC units
 */
export function useDacUnits(): UseDacUnitsResult {
  const [units, setUnits] = useState<DacUnit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDacUnits();
      setUnits(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch DAC units');
      setError(error);
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    units,
    isLoading,
    error,
    refetch: fetchData,
  };
}

interface UseDacUnitResult {
  unit: DacUnit | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateStatus: (status: UnitStatus) => Promise<void>;
}

/**
 * Hook for fetching a single DAC unit
 */
export function useDacUnit(unitId: string | null): UseDacUnitResult {
  const [unit, setUnit] = useState<DacUnit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!unitId) {
      setUnit(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDacUnit(unitId);
      setUnit(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch DAC unit');
      setError(error);
      setUnit(null);
    } finally {
      setIsLoading(false);
    }
  }, [unitId]);

  const updateStatus = useCallback(
    async (status: UnitStatus) => {
      if (!unitId) return;

      try {
        const updatedUnit = await updateDacUnitStatus(unitId, status);
        setUnit(updatedUnit);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update unit status');
        setError(error);
      }
    },
    [unitId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    unit,
    isLoading,
    error,
    refetch: fetchData,
    updateStatus,
  };
}

