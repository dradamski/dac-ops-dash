"""Logging configuration for structured logging."""
import logging
import sys
from typing import Any
import json
from datetime import datetime


class StructuredFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields (from extra parameter or extra_fields attribute)
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)
        else:
            # Python's logging merges extra dict into record attributes
            # Filter out standard LogRecord attributes
            standard_attrs = {
                'name', 'msg', 'args', 'created', 'filename', 'funcName',
                'levelname', 'levelno', 'lineno', 'module', 'msecs',
                'message', 'pathname', 'process', 'processName', 'relativeCreated',
                'thread', 'threadName', 'exc_info', 'exc_text', 'stack_info'
            }
            for key, value in record.__dict__.items():
                if key not in standard_attrs and not key.startswith('_'):
                    log_data[key] = value
        
        return json.dumps(log_data)


def setup_logging(log_level: str = "INFO") -> None:
    """Configure application logging."""
    logger = logging.getLogger("app")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Console handler with structured formatter
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(StructuredFormatter())
    logger.addHandler(console_handler)
    
    # Set levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("alembic").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with structured logging.
    
    Usage:
        logger = get_logger("module.name")
        logger.info("message", extra={"key": "value"})
        logger.error("message", extra={"key": "value"}, exc_info=True)
    """
    return logging.getLogger(f"app.{name}")

