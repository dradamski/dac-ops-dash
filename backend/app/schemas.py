"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
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
    name: str
    status: UnitStatus
    location: Optional[str] = None


class DacUnitCreate(DacUnitBase):
    pass


class DacUnitUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[UnitStatus] = None
    location: Optional[str] = None


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
    unit: str
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
    error: Optional[str] = None


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
    name: str
    value: float
    unit: str
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
    summary: str


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

