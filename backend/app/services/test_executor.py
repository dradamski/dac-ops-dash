"""Test execution service - simulates running tests and generating results.

This service simulates test execution by generating mock sensor data.
In production, this would be replaced with actual sensor API calls.
"""
import time
import random
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
from app.logging_config import get_logger
from app.utils.database import transaction

logger = get_logger("services.test_executor")


def execute_test_run(test_run_id: UUID, unit_id: UUID, db: Session):
    """
    Execute a test run by simulating sensor data collection.
    
    In production, this would:
    1. Call actual sensor APIs to collect real-time data
    2. Perform calculations and validations
    3. Generate test results based on actual sensor readings
    
    This function runs in a background task, so it needs to create its own DB session.
    
    Args:
        test_run_id: The ID of the test run to execute
        unit_id: The ID of the DAC unit being tested
        db: Database session (will create a new one for background task)
    """
    # Create a new database session for the background task
    background_db = SessionLocal()
    
    try:
        logger.info(
            "Starting test execution",
            extra={
                "test_run_id": str(test_run_id),
                "unit_id": str(unit_id),
            }
        )
        
        # Simulate test execution time (2-5 seconds)
        execution_time = random.uniform(2.0, 5.0)
        time.sleep(execution_time)
        
        # Update test run status to running
        with transaction(background_db):
            test_run = background_db.query(models.TestRun).filter(models.TestRun.id == test_run_id).first()
            if not test_run:
                logger.warning(f"Test run not found: {test_run_id}")
                return
            
            test_run.status = models.TestRunStatusEnum.running
            background_db.refresh(test_run)
        
        logger.debug(f"Test run {test_run_id} status updated to running")
        
        # Simulate collecting sensor data
        # In production, replace this with actual sensor API calls:
        # sensor_data = collect_sensor_data(unit_id)
        sensor_data = _simulate_sensor_data_collection()
        
        # Process the sensor data and generate test results
        # In production, replace this with actual data processing:
        # results = process_sensor_data(sensor_data)
        results = _generate_test_results(sensor_data)
        
        # Create test result record
        with transaction(background_db):
            test_run = background_db.query(models.TestRun).filter(models.TestRun.id == test_run_id).first()
            if not test_run:
                logger.warning(f"Test run not found during result creation: {test_run_id}")
                return
            
            # Create test result record
            db_result = models.TestResult(
                test_run_id=test_run_id,
                passed=results['passed'],
                summary=results['summary']
            )
            background_db.add(db_result)
            background_db.flush()
            
            # Create test metrics
            for metric in results['metrics']:
                db_metric = models.TestMetric(
                    test_result_id=db_result.id,
                    name=metric['name'],
                    value=metric['value'],
                    unit=metric['unit'],
                    threshold_min=metric.get('threshold_min'),
                    threshold_max=metric.get('threshold_max')
                )
                background_db.add(db_metric)
            
            # Update test run to completed
            test_run.status = models.TestRunStatusEnum.completed
            test_run.completed_at = datetime.utcnow()
        
        logger.info(
            "Test execution completed successfully",
            extra={
                "test_run_id": str(test_run_id),
                "unit_id": str(unit_id),
                "passed": results['passed'],
            }
        )
        
    except Exception as e:
        # If test execution fails, mark test run as failed
        logger.error(
            f"Test execution failed: {test_run_id}",
            extra={
                "test_run_id": str(test_run_id),
                "unit_id": str(unit_id),
                "error": str(e),
                "error_type": type(e).__name__,
            },
            exc_info=True
        )
        
        try:
            with transaction(background_db):
                test_run = background_db.query(models.TestRun).filter(models.TestRun.id == test_run_id).first()
                if test_run:
                    test_run.status = models.TestRunStatusEnum.failed
                    test_run.error = str(e)
                    test_run.completed_at = datetime.utcnow()
        except Exception as inner_e:
            logger.error(
                f"Failed to update test run status to failed: {test_run_id}",
                extra={"error": str(inner_e)},
                exc_info=True
            )
    finally:
        background_db.close()


def _simulate_sensor_data_collection() -> dict:
    """
    Simulate collecting sensor data from a DAC unit.
    
    In production, replace this with actual sensor API calls:
    
    Example:
        async def collect_sensor_data(unit_id: UUID) -> dict:
            co2_data = await sensor_api.get_co2_reading(unit_id)
            temp_data = await sensor_api.get_temperature(unit_id)
            airflow_data = await sensor_api.get_airflow(unit_id)
            efficiency_data = await sensor_api.get_efficiency(unit_id)
            
            return {
                'co2': co2_data,
                'temperature': temp_data,
                'airflow': airflow_data,
                'efficiency': efficiency_data
            }
    """
    return {
        'co2_capture_rate': random.uniform(70, 95),
        'energy_efficiency': random.uniform(75, 98),
        'system_pressure': random.uniform(0.8, 2.0),
    }


def _generate_test_results(sensor_data: dict) -> dict:
    """
    Generate test results from sensor data.
    
    In production, replace this with actual data processing:
    
    Example:
        def process_sensor_data(sensor_data: dict) -> dict:
            # Perform calculations
            co2_rate = calculate_capture_rate(sensor_data['co2'])
            efficiency = calculate_efficiency(sensor_data)
            pressure = validate_pressure(sensor_data['system_pressure'])
            
            # Check against thresholds
            passed = all([
                co2_rate >= 70 and co2_rate <= 100,
                efficiency >= 80 and efficiency <= 100,
                pressure >= 0.8 and pressure <= 2.0
            ])
            
            return {
                'passed': passed,
                'summary': '...',
                'metrics': [...]
            }
    """
    co2_rate = sensor_data['co2_capture_rate']
    efficiency = sensor_data['energy_efficiency']
    pressure = sensor_data['system_pressure']
    
    # Define thresholds
    co2_min, co2_max = 70, 100
    efficiency_min, efficiency_max = 80, 100
    pressure_min, pressure_max = 0.8, 2.0
    
    # Check if all metrics are within thresholds
    passed = (
        co2_min <= co2_rate <= co2_max and
        efficiency_min <= efficiency <= efficiency_max and
        pressure_min <= pressure <= pressure_max
    )
    
    metrics = [
        {
            'name': 'CO₂ Capture Rate',
            'value': round(co2_rate, 1),
            'unit': '%',
            'threshold_min': co2_min,
            'threshold_max': co2_max,
        },
        {
            'name': 'Energy Efficiency',
            'value': round(efficiency, 1),
            'unit': '%',
            'threshold_min': efficiency_min,
            'threshold_max': efficiency_max,
        },
        {
            'name': 'System Pressure',
            'value': round(pressure, 2),
            'unit': 'bar',
            'threshold_min': pressure_min,
            'threshold_max': pressure_max,
        },
    ]
    
    summary = (
        'All systems operating within normal parameters.'
        if passed
        else 'Some metrics exceeded acceptable thresholds.'
    )
    
    return {
        'passed': passed,
        'summary': summary,
        'metrics': metrics,
    }

