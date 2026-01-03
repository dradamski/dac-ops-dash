"""Script to seed the database with sample data."""
import sys
from datetime import datetime, timedelta
from uuid import uuid4
from app.database import SessionLocal, engine
from app.models import Base, DacUnit, SensorReading, SensorTypeEnum, UnitStatusEnum
from sqlalchemy.orm import Session

# Create tables
Base.metadata.create_all(bind=engine)


def seed_database(db: Session):
    """Seed database with sample data."""
    # Create DAC units
    units = [
        DacUnit(
            id=uuid4(),
            name="DAC Unit Alpha",
            status=UnitStatusEnum.healthy,
            location="Building A, Floor 2",
            last_updated=datetime.utcnow(),
        ),
        DacUnit(
            id=uuid4(),
            name="DAC Unit Beta",
            status=UnitStatusEnum.warning,
            location="Building A, Floor 3",
            last_updated=datetime.utcnow() - timedelta(hours=1),
        ),
        DacUnit(
            id=uuid4(),
            name="DAC Unit Gamma",
            status=UnitStatusEnum.healthy,
            location="Building B, Floor 1",
            last_updated=datetime.utcnow() - timedelta(minutes=30),
        ),
        DacUnit(
            id=uuid4(),
            name="DAC Unit Delta",
            status=UnitStatusEnum.critical,
            location="Building B, Floor 2",
            last_updated=datetime.utcnow() - timedelta(hours=2),
        ),
    ]
    
    import random
    import math
    
    # Add units to database
    for unit in units:
        db.add(unit)
    db.flush()  # Flush to get IDs without committing
    
    # Generate sensor readings for the last 24 hours
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=24)
    current_time = start_time
    
    sensor_configs = {
        SensorTypeEnum.co2: {"base": 420, "variation": 50, "unit": "ppm"},
        SensorTypeEnum.temperature: {"base": 25, "variation": 5, "unit": "°C"},
        SensorTypeEnum.airflow: {"base": 45, "variation": 10, "unit": "m³/s"},
        SensorTypeEnum.efficiency: {"base": 85, "variation": 8, "unit": "%"},
    }
    
    readings = []
    interval = timedelta(minutes=5)
    
    while current_time <= end_time:
        for unit in units:
            for sensor_type, config in sensor_configs.items():
                # Add realistic variation
                trend = math.sin((current_time - start_time).total_seconds() / 3600) * 0.3
                random_variation = (random.random() - 0.5) * config["variation"]
                value = config["base"] + trend * config["variation"] + random_variation
                value = max(0, value)
                
                reading = SensorReading(
                    id=uuid4(),
                    unit_id=unit.id,
                    sensor_type=sensor_type,
                    value=value,
                    unit=config["unit"],  # This is the measurement unit (ppm, °C, etc.)
                    timestamp=current_time,
                )
                readings.append(reading)
        
        current_time += interval
    
    # Add all readings
    db.add_all(readings)
    db.commit()
    
    print(f"Seeded database with {len(units)} units and {len(readings)} sensor readings")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

