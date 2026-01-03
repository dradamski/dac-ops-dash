"""Sensor readings API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.utils.transformers import transform_sensor_reading
from app.utils.database import transaction
from app.logging_config import get_logger

logger = get_logger("routers.sensors")
router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("/readings", response_model=List[schemas.SensorReading])
def get_sensor_readings(
    unit_id: UUID = Query(..., alias="unitId", description="DAC unit ID"),
    sensor_type: schemas.SensorType = Query(..., alias="sensorType", description="Sensor type"),
    start_time: datetime = Query(..., alias="startTime", description="Start time (ISO format)"),
    end_time: datetime = Query(..., alias="endTime", description="End time (ISO format)"),
    db: Session = Depends(get_db)
):
    """Get sensor readings with filters."""
    try:
        # Verify unit exists
        unit = db.query(models.DacUnit).filter(models.DacUnit.id == unit_id).first()
        if not unit:
            logger.warning(f"Unit not found for sensor readings: {unit_id}")
            raise HTTPException(status_code=404, detail="Unit not found")
        
        # Query sensor readings
        sensor_type_enum = models.SensorTypeEnum(sensor_type.value if hasattr(sensor_type, 'value') else sensor_type)
        readings = db.query(models.SensorReading).filter(
            models.SensorReading.unit_id == unit_id,
            models.SensorReading.sensor_type == sensor_type_enum,
            models.SensorReading.timestamp >= start_time,
            models.SensorReading.timestamp <= end_time
        ).order_by(models.SensorReading.timestamp).all()
        
        result = [transform_sensor_reading(reading) for reading in readings]
        
        logger.debug(
            f"Retrieved {len(result)} sensor readings",
            extra={
                "unit_id": str(unit_id),
                "sensor_type": sensor_type.value,
                "count": len(result),
            }
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve sensor readings",
            extra={
                "error": str(e),
                "unit_id": str(unit_id),
                "sensor_type": sensor_type.value if hasattr(sensor_type, 'value') else str(sensor_type),
            },
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor readings")


@router.get("/types/{unit_id}", response_model=List[str])
def get_available_sensor_types(unit_id: UUID, db: Session = Depends(get_db)):
    """Get available sensor types for a unit."""
    try:
        # Verify unit exists
        unit = db.query(models.DacUnit).filter(models.DacUnit.id == unit_id).first()
        if not unit:
            logger.warning(f"Unit not found for sensor types: {unit_id}")
            raise HTTPException(status_code=404, detail="Unit not found")
        
        # Get distinct sensor types for this unit
        sensor_types = db.query(models.SensorReading.sensor_type).filter(
            models.SensorReading.unit_id == unit_id
        ).distinct().all()
        
        # Extract enum values
        result = []
        for st in sensor_types:
            sensor_type = st[0]
            if hasattr(sensor_type, 'value'):
                result.append(sensor_type.value)
            else:
                result.append(str(sensor_type))
        
        # Return default if no readings found
        if not result:
            result = ["co2", "temperature", "airflow", "efficiency"]
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to retrieve sensor types for unit {unit_id}",
            extra={"error": str(e), "unit_id": str(unit_id)},
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor types")


@router.post("/readings", response_model=schemas.SensorReading)
def create_sensor_reading(
    reading: schemas.SensorReadingCreate,
    db: Session = Depends(get_db)
):
    """Create a new sensor reading."""
    try:
        with transaction(db):
            # Verify unit exists
            unit = db.query(models.DacUnit).filter(models.DacUnit.id == reading.unit_id).first()
            if not unit:
                logger.warning(f"Unit not found for sensor reading creation: {reading.unit_id}")
                raise HTTPException(status_code=404, detail="Unit not found")
            
            db_reading = models.SensorReading(
                unit_id=reading.unit_id,
                sensor_type=reading.sensor_type,
                value=reading.value,
                unit=reading.unit,
                timestamp=reading.timestamp
            )
            db.add(db_reading)
            
            logger.info(
                "Created sensor reading",
                extra={
                    "unit_id": str(reading.unit_id),
                    "sensor_type": reading.sensor_type.value if hasattr(reading.sensor_type, 'value') else str(reading.sensor_type),
                }
            )
            
            return transform_sensor_reading(db_reading)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to create sensor reading",
            extra={"error": str(e), "unit_id": str(reading.unit_id)},
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to create sensor reading")

