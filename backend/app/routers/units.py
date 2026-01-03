"""DAC units API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/units", tags=["units"])


@router.get("", response_model=List[schemas.DacUnit])
def get_units(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all DAC units, showing only the newest for each unique name+location."""
    # Use PostgreSQL's DISTINCT ON to get the newest unit for each name+location
    query = text("""
        SELECT DISTINCT ON (name, COALESCE(location, ''))
            id, name, status, location, last_updated, created_at, updated_at
        FROM dac_units
        ORDER BY name, COALESCE(location, ''), updated_at DESC
        LIMIT :limit OFFSET :skip
    """)
    
    result = db.execute(query, {"limit": limit, "skip": skip})
    
    # Transform to match schema
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
    
    return units


@router.get("/{unit_id}", response_model=schemas.DacUnit)
def get_unit(unit_id: UUID, db: Session = Depends(get_db)):
    """Get a single DAC unit by ID."""
    unit = db.query(models.DacUnit).filter(models.DacUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return {
        "id": unit.id,
        "name": unit.name,
        "status": unit.status.value if hasattr(unit.status, 'value') else unit.status,
        "location": unit.location,
        "last_updated": unit.last_updated,
        "created_at": unit.created_at,
        "updated_at": unit.updated_at,
    }


@router.patch("/{unit_id}/status", response_model=schemas.DacUnit)
def update_unit_status(
    unit_id: UUID,
    status: schemas.UnitStatus,
    db: Session = Depends(get_db)
):
    """Update a DAC unit's status."""
    unit = db.query(models.DacUnit).filter(models.DacUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    unit.status = models.UnitStatusEnum(status.value)
    unit.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(unit)
    return {
        "id": unit.id,
        "name": unit.name,
        "status": unit.status.value if hasattr(unit.status, 'value') else unit.status,
        "location": unit.location,
        "last_updated": unit.last_updated,
        "created_at": unit.created_at,
        "updated_at": unit.updated_at,
    }

