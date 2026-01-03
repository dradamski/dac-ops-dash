"""Test runs API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.services.test_executor import execute_test_run
from app.utils.transformers import transform_test_run, transform_test_result
from app.utils.database import transaction
from app.logging_config import get_logger

logger = get_logger("routers.tests")
router = APIRouter(prefix="/tests", tags=["tests"])


@router.get("/runs", response_model=List[schemas.TestRunWithResults])
def get_test_runs(
    unit_id: Optional[UUID] = Query(None, alias="unitId", description="Filter by unit ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get test runs, optionally filtered by unit."""
    try:
        # Cap limit at reasonable maximum
        limit = min(limit, 1000)
        
        query = db.query(models.TestRun)
        
        if unit_id:
            query = query.filter(models.TestRun.unit_id == unit_id)
        
        # Use eager loading to prevent N+1 queries
        test_runs = query.options(
            joinedload(models.TestRun.result).joinedload(models.TestResult.metrics)
        ).order_by(models.TestRun.started_at.desc()).offset(skip).limit(limit).all()
        
        result = [transform_test_run(test_run) for test_run in test_runs]
        
        logger.debug(
            f"Retrieved {len(result)} test runs",
            extra={"unit_id": str(unit_id) if unit_id else None, "skip": skip, "limit": limit}
        )
        
        return result
        
    except Exception as e:
        logger.error("Failed to retrieve test runs", extra={"error": str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve test runs")


@router.post("/runs", response_model=schemas.TestRun)
def create_test_run(
    test_run: schemas.TestRunCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new test run and start execution in the background."""
    try:
        with transaction(db):
            # Verify unit exists
            unit = db.query(models.DacUnit).filter(models.DacUnit.id == test_run.unit_id).first()
            if not unit:
                logger.warning(f"Unit not found for test run creation: {test_run.unit_id}")
                raise HTTPException(status_code=404, detail="Unit not found")
            
            db_test_run = models.TestRun(
                unit_id=test_run.unit_id,
                status=models.TestRunStatusEnum.pending,
                started_at=datetime.utcnow()
            )
            db.add(db_test_run)
            db.flush()  # Get ID without committing
            
            # Start test execution in the background
            background_tasks.add_task(execute_test_run, db_test_run.id, test_run.unit_id, db)
            
            logger.info(
                "Created test run",
                extra={
                    "test_run_id": str(db_test_run.id),
                    "unit_id": str(test_run.unit_id),
                }
            )
            
            return transform_test_run(db_test_run)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to create test run",
            extra={"error": str(e), "unit_id": str(test_run.unit_id)},
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to create test run")


@router.get("/runs/{run_id}", response_model=schemas.TestRunWithResults)
def get_test_run(run_id: UUID, db: Session = Depends(get_db)):
    """Get a single test run by ID."""
    try:
        # Use eager loading to prevent N+1 queries
        test_run = db.query(models.TestRun).options(
            joinedload(models.TestRun.result).joinedload(models.TestResult.metrics)
        ).filter(models.TestRun.id == run_id).first()
        
        if not test_run:
            logger.warning(f"Test run not found: {run_id}")
            raise HTTPException(status_code=404, detail="Test run not found")
        
        return transform_test_run(test_run)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve test run {run_id}", extra={"error": str(e)}, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve test run")


@router.patch("/runs/{run_id}/status", response_model=schemas.TestRun)
def update_test_run_status(
    run_id: UUID,
    status_update: schemas.TestRunUpdate,
    db: Session = Depends(get_db)
):
    """Update test run status."""
    try:
        with transaction(db):
            test_run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
            if not test_run:
                logger.warning(f"Test run not found for status update: {run_id}")
                raise HTTPException(status_code=404, detail="Test run not found")
            
            if status_update.status:
                test_run.status = status_update.status
            
            if status_update.completed_at:
                test_run.completed_at = status_update.completed_at
            elif status_update.status in [models.TestRunStatusEnum.completed, models.TestRunStatusEnum.failed]:
                test_run.completed_at = datetime.utcnow()
            
            if status_update.error:
                test_run.error = status_update.error
            
            logger.info(
                f"Updated test run status: {run_id}",
                extra={
                    "test_run_id": str(run_id),
                    "status": status_update.status.value if status_update.status else None,
                }
            )
            
            return transform_test_run(test_run)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to update test run status: {run_id}",
            extra={"error": str(e), "test_run_id": str(run_id)},
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to update test run status")


@router.post("/runs/{run_id}/results", response_model=schemas.TestResult)
def create_test_result(
    run_id: UUID,
    result: schemas.TestResultCreate,
    db: Session = Depends(get_db)
):
    """Create test results for a completed test run."""
    try:
        with transaction(db):
            test_run = db.query(models.TestRun).filter(models.TestRun.id == run_id).first()
            if not test_run:
                logger.warning(f"Test run not found for result creation: {run_id}")
                raise HTTPException(status_code=404, detail="Test run not found")
            
            if test_run.result:
                logger.warning(f"Test result already exists for run: {run_id}")
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
            
            logger.info(
                "Created test result",
                extra={
                    "test_run_id": str(run_id),
                    "result_id": str(db_result.id),
                    "passed": result.passed,
                }
            )
            
            # Reload with metrics
            return transform_test_result(db_result)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to create test result for run {run_id}",
            extra={"error": str(e), "test_run_id": str(run_id)},
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Failed to create test result")

