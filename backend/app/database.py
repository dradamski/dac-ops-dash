"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://dac_user:dac_password@localhost:5432/dac_ops_db"
    )
    database_host: str = os.getenv("DATABASE_HOST", "localhost")
    database_port: int = int(os.getenv("DATABASE_PORT", "5432"))
    database_name: str = os.getenv("DATABASE_NAME", "dac_ops_db")
    database_user: str = os.getenv("DATABASE_USER", "dac_user")
    database_password: str = os.getenv("DATABASE_PASSWORD", "dac_password")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")

    class Config:
        env_file = ".env"


settings = Settings()

# Create database engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

