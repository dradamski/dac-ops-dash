import type { SensorReading, SensorType, SensorDataFilter } from '../types/domain';
import { generateMockSensorReadings } from '../utils/mockData';

/**
 * Fetch sensor readings based on filter criteria
 */
export async function fetchSensorReadings(
  filter: SensorDataFilter
): Promise<SensorReading[]> {
  try {
    // In production, this would make a real API call
    // For now, we'll use mock data
    const { unitId, sensorType, timeRange } = filter;

    if (!sensorType || !timeRange) {
      throw new Error('sensorType and timeRange are required');
    }

    if (!unitId) {
      throw new Error('unitId is required');
    }

    // Generate mock data for the specified time range
    return generateMockSensorReadings(
      sensorType,
      unitId,
      timeRange.start,
      timeRange.end,
      5 // 5-minute intervals
    );
  } catch (error) {
    // In a real app, you might want to log this error
    console.error('Error fetching sensor readings:', error);
    throw error;
  }
}

/**
 * Fetch sensor readings for multiple sensor types
 */
export async function fetchMultipleSensorReadings(
  filter: SensorDataFilter & { sensorTypes: SensorType[] }
): Promise<Record<SensorType, SensorReading[]>> {
  const { sensorTypes, ...baseFilter } = filter;
  const results: Record<SensorType, SensorReading[]> = {} as Record<
    SensorType,
    SensorReading[]
  >;

  await Promise.all(
    sensorTypes.map(async (sensorType) => {
      results[sensorType] = await fetchSensorReadings({
        ...baseFilter,
        sensorType,
      });
    })
  );

  return results;
}

/**
 * Get available sensor types for a unit
 */
export async function getAvailableSensorTypes(unitId: string): Promise<SensorType[]> {
  // In a real app, this would query the API
  // For now, return all sensor types
  return ['co2', 'temperature', 'airflow', 'efficiency'];
}

