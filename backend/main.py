"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import settings
from app.routers import units, sensors, tests

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

# Include routers
app.include_router(units.router, prefix="/api")
app.include_router(sensors.router, prefix="/api")
app.include_router(tests.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "DAC Operations Dashboard API"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

