import type { DacUnit } from '../types/domain';

/**
 * Extract building name from location string
 * Examples: "Building A, Floor 2" -> "Building A
 */
export function extractBuildingFromLocation(location: string | undefined): string | null {
  if (!location) return null;
  const match = location.match(/^Building\s+[A-Z]/i);
  return match ? match[0] : null;
}

/**
 * Get unique list of buildings from units
 */
export function getBuildingsFromUnits(units: DacUnit[]): string[] {
  const buildings = new Set<string>();
  units.forEach((unit) => {
    const building = extractBuildingFromLocation(unit.location);
    if (building) {
      buildings.add(building);
    }
  });
  return Array.from(buildings).sort();
}

/**
 * Filter units by building
 */
export function filterUnitsByBuilding(units: DacUnit[], building: string | null): DacUnit[] {
  if (!building) return units;
  return units.filter((unit) => {
    const unitBuilding = extractBuildingFromLocation(unit.location);
    return unitBuilding === building;
  });
}

