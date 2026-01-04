"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, field_validator
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    # Required fields - no defaults to prevent hardcoded credentials
    database_url: str
    database_host: str
    database_port: int
    database_name: str
    database_user: str
    database_password: str
    cors_origins: str

    @field_validator('database_url')
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL does not contain default credentials."""
        if 'dac_password' in v or 'dac_user' in v:
            raise ValueError(
                "Default credentials detected in DATABASE_URL. "
                "Please use a secure password and update your .env file."
            )
        return v

    @field_validator('database_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password is not the default weak password."""
        if v == 'dac_password':
            raise ValueError(
                "Default password 'dac_password' is not allowed. "
                "Please set a secure password in your .env file."
            )
        if len(v) < 8:
            raise ValueError(
                "Password must be at least 8 characters long. "
                "Please set a secure password in your .env file."
            )
        return v

    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"  # Ignore extra fields from .env file
    )


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

