import type { SensorReading, SensorType, SensorDataFilter } from '../types/domain';
import { get } from './client';
import { generateMockSensorReadings } from '../utils/mockData';

/**
 * Fetch sensor readings based on filter criteria
 */
export async function fetchSensorReadings(
  filter: SensorDataFilter
): Promise<SensorReading[]> {
  try {
    const { unitId, sensorType, timeRange } = filter;

    if (!sensorType || !timeRange) {
      throw new Error('sensorType and timeRange are required');
    }

    if (!unitId) {
      throw new Error('unitId is required');
    }

    // Format dates for API
    const startTime = timeRange.start.toISOString();
    const endTime = timeRange.end.toISOString();

    const readings = await get<any[]>(
      `/sensors/readings?unitId=${unitId}&sensorType=${sensorType}&startTime=${startTime}&endTime=${endTime}`
    );

    // Transform backend response to match frontend types
    return readings.map((reading) => ({
      timestamp: reading.timestamp,
      sensorType: reading.sensor_type,
      value: reading.value,
      unit: reading.unit,
      unitId: String(reading.unit_id),
    }));
  } catch (error) {
    // Fallback to mock data if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, using mock data:', error);
      return generateMockSensorReadings(
        filter.sensorType!,
        filter.unitId!,
        filter.timeRange!.start,
        filter.timeRange!.end,
        5
      );
    }
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
  try {
    const sensorTypes = await get<SensorType[]>(`/sensors/types/${unitId}`);
    return sensorTypes;
  } catch (error) {
    // Fallback to all sensor types if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, returning default sensor types:', error);
      return ['co2', 'temperature', 'airflow', 'efficiency'];
    }
    console.error(`Error fetching sensor types for unit ${unitId}:`, error);
    throw error;
  }
}

