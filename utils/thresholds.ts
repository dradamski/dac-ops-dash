import type { SensorType, UnitStatus } from '../types/domain';

export interface SensorThresholds {
  min: number;
  max: number;
  warningMin?: number;
  warningMax?: number;
}

/**
 * Default thresholds for each sensor type
 */
const SENSOR_THRESHOLDS: Record<SensorType, SensorThresholds> = {
  co2: {
    min: 0,
    max: 1000, // ppm
    warningMin: 400,
    warningMax: 800,
  },
  temperature: {
    min: -10,
    max: 50, // Celsius
    warningMin: 0,
    warningMax: 40,
  },
  airflow: {
    min: 0,
    max: 100, // m³/s
    warningMin: 10,
    warningMax: 80,
  },
  efficiency: {
    min: 0,
    max: 100, // percentage
    warningMin: 70,
    warningMax: 95,
  },
};

/**
 * Get thresholds for a specific sensor type
 */
export function getSensorThresholds(sensorType: SensorType): SensorThresholds {
  return SENSOR_THRESHOLDS[sensorType];
}

/**
 * Check if a sensor value is within acceptable range
 */
export function isValueInRange(value: number, sensorType: SensorType): boolean {
  const thresholds = getSensorThresholds(sensorType);
  return value >= thresholds.min && value <= thresholds.max;
}

/**
 * Check if a sensor value is in warning range
 */
export function isValueInWarningRange(value: number, sensorType: SensorType): boolean {
  const thresholds = getSensorThresholds(sensorType);
  const inRange = isValueInRange(value, sensorType);
  
  if (!inRange) return false;
  
  if (thresholds.warningMin && value < thresholds.warningMin) return true;
  if (thresholds.warningMax && value > thresholds.warningMax) return true;
  
  return false;
}

/**
 * Determine unit status based on sensor readings
 */
export function determineUnitStatus(
  readings: Array<{ sensorType: SensorType; value: number }>
): UnitStatus {
  let hasCritical = false;
  let hasWarning = false;

  for (const reading of readings) {
    const inRange = isValueInRange(reading.value, reading.sensorType);
    if (!inRange) {
      hasCritical = true;
      break;
    }
    if (isValueInWarningRange(reading.value, reading.sensorType)) {
      hasWarning = true;
    }
  }

  if (hasCritical) return 'critical';
  if (hasWarning) return 'warning';
  return 'healthy';
}

/**
 * Get status color for display
 */
export function getStatusColor(status: UnitStatus): string {
  const colors: Record<UnitStatus, string> = {
    healthy: '#10b981', // green
    warning: '#f59e0b', // amber
    critical: '#ef4444', // red
  };
  return colors[status];
}

