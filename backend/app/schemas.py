"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# Enums
from enum import Enum

class UnitStatus(str, Enum):
    healthy = "healthy"
    warning = "warning"
    critical = "critical"


class SensorType(str, Enum):
    co2 = "co2"
    temperature = "temperature"
    airflow = "airflow"
    efficiency = "efficiency"


class TestRunStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


# DAC Unit Schemas
class DacUnitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Unit name")
    status: UnitStatus
    location: Optional[str] = Field(None, max_length=255, description="Unit location")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate unit name does not contain dangerous characters."""
        if not v or not v.strip():
            raise ValueError("Unit name cannot be empty")
        return v.strip()


class DacUnitCreate(DacUnitBase):
    pass


class DacUnitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[UnitStatus] = None
    location: Optional[str] = Field(None, max_length=255)


class DacUnit(DacUnitBase):
    id: UUID
    last_updated: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Sensor Reading Schemas
class SensorReadingBase(BaseModel):
    sensor_type: SensorType
    value: float
    unit: str = Field(..., min_length=1, max_length=50, description="Measurement unit")
    timestamp: datetime


class SensorReadingCreate(SensorReadingBase):
    unit_id: UUID


class SensorReading(SensorReadingBase):
    id: UUID
    unit_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


# Test Run Schemas
class TestRunBase(BaseModel):
    status: TestRunStatus
    started_at: datetime


class TestRunCreate(BaseModel):
    unit_id: UUID = Field(..., alias="unitId")
    
    class Config:
        populate_by_name = True


class TestRunUpdate(BaseModel):
    status: Optional[TestRunStatus] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = Field(None, max_length=1000, description="Error message if test failed")


class TestRun(TestRunBase):
    id: UUID
    unit_id: UUID
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Test Result Schemas
class TestMetricBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Metric name")
    value: float
    unit: str = Field(..., min_length=1, max_length=50, description="Measurement unit")
    threshold_min: Optional[float] = None
    threshold_max: Optional[float] = None


class TestMetricCreate(TestMetricBase):
    pass


class TestMetric(TestMetricBase):
    id: UUID
    test_result_id: UUID

    class Config:
        from_attributes = True


class TestResultBase(BaseModel):
    passed: bool
    summary: str = Field(..., min_length=1, max_length=5000, description="Test result summary")

    @field_validator('summary')
    @classmethod
    def validate_summary(cls, v: str) -> str:
        """Validate summary does not contain XSS or dangerous patterns."""
        if not v or not v.strip():
            raise ValueError("Summary cannot be empty")
        
        # Check for potential XSS patterns
        dangerous_patterns = ['<script', 'javascript:', 'onerror=', 'onload=', 'onclick=', 'onmouseover=']
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if pattern in v_lower:
                raise ValueError(f"Invalid characters detected in summary: potential XSS")
        return v.strip()


class TestResultCreate(TestResultBase):
    metrics: List[TestMetricCreate]


class TestResult(TestResultBase):
    id: UUID
    test_run_id: UUID
    created_at: datetime
    metrics: List[TestMetric] = []

    class Config:
        from_attributes = True


# Extended Test Run with Results
class TestRunWithResults(TestRun):
    result: Optional[TestResult] = None

    class Config:
        from_attributes = True

