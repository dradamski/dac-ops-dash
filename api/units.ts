import type { DacUnit } from '../types/domain';
import { generateMockDacUnits } from '../utils/mockData';

/**
 * Fetch all DAC units
 */
export async function fetchDacUnits(): Promise<DacUnit[]> {
  try {
    // In production, this would make a real API call
    // For now, we'll use mock data
    return generateMockDacUnits();
  } catch (error) {
    console.error('Error fetching DAC units:', error);
    throw error;
  }
}

/**
 * Fetch a single DAC unit by ID
 */
export async function fetchDacUnit(unitId: string): Promise<DacUnit | null> {
  try {
    const units = await fetchDacUnits();
    return units.find((unit) => unit.id === unitId) || null;
  } catch (error) {
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
    // In production, this would make a PUT/PATCH request
    const unit = await fetchDacUnit(unitId);
    if (!unit) {
      throw new Error(`Unit ${unitId} not found`);
    }

    return {
      ...unit,
      status,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error updating DAC unit ${unitId}:`, error);
    throw error;
  }
}

