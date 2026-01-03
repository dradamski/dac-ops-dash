import type { DacUnit } from '../types/domain';
import { get, patch } from './client';
import { generateMockDacUnits } from '../utils/mockData';

/**
 * Fetch all DAC units
 */
export async function fetchDacUnits(): Promise<DacUnit[]> {
  try {
    const units = await get<DacUnit[]>('/units');
    // Transform backend response to match frontend types
    return units.map((unit) => ({
      ...unit,
      id: String(unit.id),
      lastUpdated: unit.last_updated || undefined,
    }));
  } catch (error) {
    // Fallback to mock data if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, using mock data:', error);
      return generateMockDacUnits();
    }
    console.error('Error fetching DAC units:', error);
    throw error;
  }
}

/**
 * Fetch a single DAC unit by ID
 */
export async function fetchDacUnit(unitId: string): Promise<DacUnit | null> {
  try {
    const unit = await get<DacUnit>(`/units/${unitId}`);
    return {
      ...unit,
      id: String(unit.id),
      lastUpdated: unit.last_updated || undefined,
    };
  } catch (error) {
    // Fallback to mock data if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, using mock data:', error);
      const units = generateMockDacUnits();
      return units.find((unit) => unit.id === unitId) || null;
    }
    console.error(`Error fetching DAC unit ${unitId}:`, error);
    throw error;
  }
}

/**
 * Update a DAC unit's status
 */
export async function updateDacUnitStatus(
  unitId: string,
  status: DacUnit['status']
): Promise<DacUnit> {
  try {
    const unit = await patch<DacUnit>(`/units/${unitId}/status`, { status });
    return {
      ...unit,
      id: String(unit.id),
      lastUpdated: unit.last_updated || undefined,
    };
  } catch (error) {
    console.error(`Error updating DAC unit ${unitId}:`, error);
    throw error;
  }
}

