"""Test runs API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.services.test_executor import execute_test_run

router = APIRouter(prefix="/tests", tags=["tests"])


@router.get("/runs", response_model=List[schemas.TestRunWithResults])
def get_test_runs(
    unit_id: Optional[UUID] = Query(None, alias="unitId", description="Filter by unit ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get test runs, optionally filtered by unit."""
    query = db.query(models.TestRun)
    
    if unit_id:
        query = query.filter(models.TestRun.unit_id == unit_id)
    
    test_runs = query.order_by(models.TestRun.started_at.desc()).offset(skip).limit(limit).all()
    
    # Load results for each test run
    result = []
    for test_run in test_runs:
        test_run_dict: dict = {
            "id": test_run.id,
            "unit_id": test_run.unit_id,
            "status": test_run.status.value if hasattr(test_run.status, 'value') else test_run.status,
            "started_at": test_run.started_at,
            "completed_at": test_run.completed_at,
            "error": test_run.error,
            "created_at": test_run.created_at,
            "result": None
        }
        
        if test_run.result:
            test_run_dict["result"] = {
                "id": test_run.result.id,
                "test_run_id": test_run.result.test_run_id,
                "passed": test_run.result.passed,
                "summary": test_run.result.summary,
                "created_at": test_run.result.created_at,
                "metrics": [
                    {
                        "id": m.id,
                        "test_result_id": m.test_result_id,
                        "name": m.name,
                        "value": float(m.value),
                        "unit": m.unit,
                        "threshold_min": float(m.threshold_min) if m.threshold_min else None,
                        "threshold_max": float(m.threshold_max) if m.threshold_max else None
                    }
                    for m in test_run.result.metrics
                ]
            }
        
        result.append(test_run_dict)
    
    return result


@router.post("/runs", response_model=schemas.TestRun)
def create_test_run(
    test_run: schemas.TestRunCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new test run and start execution in the background."""
    # Verify unit exists
    unit = db.query(models.DacUnit).filter(models.DacUnit.id == test_run.unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    db_test_run = models.TestRun(
        unit_id=test_run.unit_id,
        status=models.TestRunStatusEnum.pending,
        started_at=datetime.utcnow()
    )
    db.add(db_test_run)
    db.commit()
    db.refresh(db_test_run)
    
    # Start test execution in the background
    # In production, this would trigger actual sensor API calls
    background_tasks.add_task(execute_test_run, db_test_run.id, test_run.unit_id, db)
    
    # Transform to match schema
    return {
        "id": db_test_run.id,
        "unit_id": db_test_run.unit_id,
        "status": db_test_run.status.value if hasattr(db_test_run.status, 'value') else db_test_run.status,
        "started_at": db_test_run.started_at,
        "completed_at": db_test_run.completed_at,
        "error": db_test_run.error,
        "created_at": db_test_run.created_at,
    }


@router.get("/runs/{run_id}", response_model=schemas.TestRunWithResults)
def get_test_run(run_id: UUID, db: Session = Depends(get_db)):
    """Get a single test run by ID."""
    test_run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    result_dict = {
        "id": test_run.id,
        "unit_id": test_run.unit_id,
        "status": test_run.status,
        "started_at": test_run.started_at,
        "completed_at": test_run.completed_at,
        "error": test_run.error,
        "created_at": test_run.created_at,
        "result": None
    }
    
    if test_run.result:
        result_dict["result"] = {
            "id": test_run.result.id,
            "test_run_id": test_run.result.test_run_id,
            "passed": test_run.result.passed,
            "summary": test_run.result.summary,
            "created_at": test_run.result.created_at,
            "metrics": [
                {
                    "id": m.id,
                    "test_result_id": m.test_result_id,
                    "name": m.name,
                    "value": float(m.value),
                    "unit": m.unit,
                    "threshold_min": float(m.threshold_min) if m.threshold_min else None,
                    "threshold_max": float(m.threshold_max) if m.threshold_max else None
                }
                for m in test_run.result.metrics
            ]
        }
    
    return result_dict


@router.patch("/runs/{run_id}/status", response_model=schemas.TestRun)
def update_test_run_status(
    run_id: UUID,
    status_update: schemas.TestRunUpdate,
    db: Session = Depends(get_db)
):
    """Update test run status."""
    test_run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    if status_update.status:
        test_run.status = status_update.status
    
    if status_update.completed_at:
        test_run.completed_at = status_update.completed_at
    elif status_update.status in [models.TestRunStatusEnum.completed, models.TestRunStatusEnum.failed]:
        test_run.completed_at = datetime.utcnow()
    
    if status_update.error:
        test_run.error = status_update.error
    
    db.commit()
    db.refresh(test_run)
    return test_run


@router.post("/runs/{run_id}/results", response_model=schemas.TestResult)
def create_test_result(
    run_id: UUID,
    result: schemas.TestResultCreate,
    db: Session = Depends(get_db)
):
    """Create test results for a completed test run."""
    test_run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    if test_run.result:
        raise HTTPException(status_code=400, detail="Test result already exists")
    
    # Create test result
    db_result = models.TestResult(
        test_run_id=run_id,
        passed=result.passed,
        summary=result.summary
    )
    db.add(db_result)
    db.flush()
    
    # Create metrics
    for metric in result.metrics:
        db_metric = models.TestMetric(
            test_result_id=db_result.id,
            name=metric.name,
            value=metric.value,
            unit=metric.unit,
            threshold_min=metric.threshold_min,
            threshold_max=metric.threshold_max
        )
        db.add(db_metric)
    
    db.commit()
    db.refresh(db_result)
    
    # Load metrics
    metrics = db.query(models.TestMetric).filter(
        models.TestMetric.test_result_id == db_result.id
    ).all()
    
    return {
        "id": db_result.id,
        "test_run_id": db_result.test_run_id,
        "passed": db_result.passed,
        "summary": db_result.summary,
        "created_at": db_result.created_at,
        "metrics": [
            {
                "id": m.id,
                "test_result_id": m.test_result_id,
                "name": m.name,
                "value": float(m.value),
                "unit": m.unit,
                "threshold_min": float(m.threshold_min) if m.threshold_min else None,
                "threshold_max": float(m.threshold_max) if m.threshold_max else None
            }
            for m in metrics
        ]
    }

