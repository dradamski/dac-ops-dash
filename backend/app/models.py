"""SQLAlchemy ORM models."""
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base
import enum


class UnitStatusEnum(str, enum.Enum):
    """DAC unit status enum."""
    healthy = "healthy"
    warning = "warning"
    critical = "critical"


class SensorTypeEnum(str, enum.Enum):
    """Sensor type enum."""
    co2 = "co2"
    temperature = "temperature"
    airflow = "airflow"
    efficiency = "efficiency"


class TestRunStatusEnum(str, enum.Enum):
    """Test run status enum."""
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class DacUnit(Base):
    """DAC unit model."""
    __tablename__ = "dac_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    status = Column(SQLEnum(UnitStatusEnum), nullable=False, default=UnitStatusEnum.healthy)
    location = Column(String(255), nullable=True)
    last_updated = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sensor_readings = relationship("SensorReading", back_populates="dac_unit", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="unit", cascade="all, delete-orphan")


class SensorReading(Base):
    """Sensor reading model."""
    __tablename__ = "sensor_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("dac_units.id"), nullable=False)
    sensor_type = Column(SQLEnum(SensorTypeEnum), nullable=False)
    value = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(50), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    dac_unit = relationship("DacUnit", back_populates="sensor_readings")


class TestRun(Base):
    """Test run model."""
    __tablename__ = "test_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("dac_units.id"), nullable=False)
    status = Column(SQLEnum(TestRunStatusEnum), nullable=False, default=TestRunStatusEnum.pending)
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    unit = relationship("DacUnit", back_populates="test_runs")
    result = relationship("TestResult", back_populates="test_run", uselist=False, cascade="all, delete-orphan")


class TestResult(Base):
    """Test result model."""
    __tablename__ = "test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id = Column(UUID(as_uuid=True), ForeignKey("test_runs.id"), nullable=False, unique=True)
    passed = Column(Boolean, nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    test_run = relationship("TestRun", back_populates="result")
    metrics = relationship("TestMetric", back_populates="test_result", cascade="all, delete-orphan")


class TestMetric(Base):
    """Test metric model."""
    __tablename__ = "test_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_result_id = Column(UUID(as_uuid=True), ForeignKey("test_results.id"), nullable=False)
    name = Column(String(255), nullable=False)
    value = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(50), nullable=False)
    threshold_min = Column(Numeric(10, 2), nullable=True)
    threshold_max = Column(Numeric(10, 2), nullable=True)

    # Relationships
    test_result = relationship("TestResult", back_populates="metrics")

