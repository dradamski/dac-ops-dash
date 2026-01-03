"""Utility functions for transforming models to schemas."""
from typing import Dict, Any, Optional
from app import models


def transform_dac_unit(unit: models.DacUnit) -> Dict[str, Any]:
    """Transform DacUnit model to schema dict."""
    return {
        "id": unit.id,
        "name": unit.name,
        "status": unit.status.value if hasattr(unit.status, 'value') else str(unit.status),
        "location": unit.location,
        "last_updated": unit.last_updated,
        "created_at": unit.created_at,
        "updated_at": unit.updated_at,
    }


def transform_sensor_reading(reading: models.SensorReading) -> Dict[str, Any]:
    """Transform SensorReading model to schema dict."""
    return {
        "id": reading.id,
        "unit_id": reading.unit_id,
        "sensor_type": reading.sensor_type.value if hasattr(reading.sensor_type, 'value') else str(reading.sensor_type),
        "value": float(reading.value),
        "unit": reading.unit,
        "timestamp": reading.timestamp,
        "created_at": reading.created_at,
    }


def transform_test_metric(metric: models.TestMetric) -> Dict[str, Any]:
    """Transform TestMetric model to schema dict."""
    return {
        "id": metric.id,
        "test_result_id": metric.test_result_id,
        "name": metric.name,
        "value": float(metric.value),
        "unit": metric.unit,
        "threshold_min": float(metric.threshold_min) if metric.threshold_min else None,
        "threshold_max": float(metric.threshold_max) if metric.threshold_max else None,
    }


def transform_test_result(result: models.TestResult) -> Dict[str, Any]:
    """Transform TestResult model to schema dict."""
    return {
        "id": result.id,
        "test_run_id": result.test_run_id,
        "passed": result.passed,
        "summary": result.summary,
        "created_at": result.created_at,
        "metrics": [transform_test_metric(m) for m in result.metrics],
    }


def transform_test_run(test_run: models.TestRun) -> Dict[str, Any]:
    """Transform TestRun model to schema dict."""
    return {
        "id": test_run.id,
        "unit_id": test_run.unit_id,
        "status": test_run.status.value if hasattr(test_run.status, 'value') else str(test_run.status),
        "started_at": test_run.started_at,
        "completed_at": test_run.completed_at,
        "error": test_run.error,
        "created_at": test_run.created_at,
        "result": transform_test_result(test_run.result) if test_run.result else None,
    }

