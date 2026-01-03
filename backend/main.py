"""FastAPI application entry point."""
import time
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import settings, get_db
from app.routers import units, sensors, tests
from app.logging_config import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger("main")

app = FastAPI(
    title="DAC Operations Dashboard API",
    description="API for Direct Air Capture Operations Dashboard",
    version="1.0.0"
)

# Configure CORS
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests and responses."""
    start_time = time.time()
    
    # Log request
    logger.info(
        "request_received",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params),
            "client_host": request.client.host if request.client else None,
        }
    )
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log successful response
        logger.info(
            "request_completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time_ms": round(process_time * 1000, 2),
            }
        )
        
        # Add process time header
        response.headers["X-Process-Time"] = str(process_time)
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "request_failed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "error_type": type(e).__name__,
                "process_time_ms": round(process_time * 1000, 2),
            },
            exc_info=True
        )
        raise


# Include routers
app.include_router(units.router, prefix="/api")
app.include_router(sensors.router, prefix="/api")
app.include_router(tests.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "DAC Operations Dashboard API"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database connectivity verification."""
    try:
        # Check database connectivity
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error("Database health check failed", extra={"error": str(e)}, exc_info=True)
        db_status = "disconnected"
    
    if db_status == "connected":
        return {"status": "healthy", "database": "connected"}
    else:
        return {"status": "unhealthy", "database": "disconnected"}, 503


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info("Application starting up")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Application shutting down")

