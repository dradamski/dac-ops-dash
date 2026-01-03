"""DAC units API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.utils.transformers import transform_dac_unit
from app.utils.database import transaction
from app.logging_config import get_logger

logger = get_logger("routers.units")
router = APIRouter(prefix="/units", tags=["units"])


@router.get("", response_model=List[schemas.DacUnit])
def get_units(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all DAC units, showing only the newest for each unique name+location."""
    try:
        # Cap limit at reasonable maximum
        limit = min(limit, 1000)
        
        query = text("""
            SELECT DISTINCT ON (name, COALESCE(location, ''))
                id, name, status, location, last_updated, created_at, updated_at
            FROM dac_units
            ORDER BY name, COALESCE(location, ''), updated_at DESC
            LIMIT :limit OFFSET :skip
        """)
        
        result = db.execute(query, {"limit": limit, "skip": skip})
        
        units = []
        for row in result:
            units.append({
                "id": row.id,
                "name": row.name,
                "status": row.status.value if hasattr(row.status, 'value') else row.status,
                "location": row.location,
                "last_updated": row.last_updated,
                "created_at": row.created_at,
                "updated_at": row.updated_at,
            })
        
        logger.debug(f"Retrieved {len(units)} units", extra={"skip": skip, "limit": limit})
        return units
        
    except Exception as e:
        logger.error("Failed to retrieve units", extra={"error": str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve units")


@router.get("/{unit_id}", response_model=schemas.DacUnit)
def get_unit(unit_id: UUID, db: Session = Depends(get_db)):
    """Get a single DAC unit by ID."""
    try:
        unit = db.query(models.DacUnit).filter(models.DacUnit.id == unit_id).first()
        if not unit:
            logger.warning(f"Unit not found: {unit_id}")
            raise HTTPException(status_code=404, detail="Unit not found")
        
        return transform_dac_unit(unit)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve unit {unit_id}", extra={"error": str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve unit")


@router.patch("/{unit_id}/status", response_model=schemas.DacUnit)
def update_unit_status(
    unit_id: UUID,
    status: schemas.UnitStatus,
    db: Session = Depends(get_db)
):
    """Update a DAC unit's status."""
    try:
        with transaction(db):
            unit = db.query(models.DacUnit).filter(models.DacUnit.id == unit_id).first()
            if not unit:
                logger.warning(f"Unit not found for status update: {unit_id}")
                raise HTTPException(status_code=404, detail="Unit not found")
            
            old_status = unit.status
            unit.status = models.UnitStatusEnum(status.value)
            unit.last_updated = datetime.utcnow()
            
            logger.info(
                f"Updated unit status: {unit_id}",
                extra={
                    "unit_id": str(unit_id),
                    "old_status": str(old_status),
                    "new_status": status.value,
                }
            )
            
            return transform_dac_unit(unit)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to update unit status: {unit_id}",
            extra={"error": str(e), "unit_id": str(unit_id)},
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to update unit status")

