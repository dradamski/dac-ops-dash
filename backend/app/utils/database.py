"""Database utility functions for transaction management."""
from contextlib import contextmanager
from sqlalchemy.orm import Session
from app.logging_config import get_logger

logger = get_logger("database")


@contextmanager
def transaction(db: Session):
    """Context manager for database transactions with automatic rollback on error."""
    try:
        yield db
        db.commit()
        logger.debug("Transaction committed successfully")
    except Exception as e:
        db.rollback()
        logger.error(
            "Transaction rolled back due to error",
            extra={"error": str(e), "error_type": type(e).__name__}
        )
        raise

