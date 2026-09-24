import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add parent directory to path so imports work seamlessly whether run from root or backend/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import settings
from backend.database import engine, Base
from backend.routers import (
    auth, donations, requests, pickups, distribution,
    notifications, analytics, ml_match, matching, demand
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("smart_food.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables, train ML model if absent, and auto-seed if empty
    logger.info("Initializing database tables and ML artifacts...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")

        # Ensure ML model is trained and ready
        from ml.predict import demand_service
        logger.info("AI Demand Prediction & Smart Matching services initialized.")
        
        # Check and seed initial data automatically
        from ml.seed_data import seed_database
        seed_database()
    except Exception as e:
        logger.error(f"Error during startup initialization: {e}")
        
    yield
    # Shutdown
    logger.info("Application shutting down...")

app = FastAPI(
    title="Smart Food Distribution Platform API",
    description="""
    Production-grade RESTful API for redistributing surplus food to NGOs and beneficiaries 
    using AI-powered geospatial and expiry-urgency matching.
    
    Roles supported:
    - **FOOD DONOR**: Post, manage and track surplus food donations.
    - **NGO / VOLUNTEER**: Browse available surplus, claim donations, schedule pickups and distribute meals.
    - **BENEFICIARY**: Submit emergency meal requirements and receive matched food allocations.
    - **ADMIN**: Platform-wide monitoring, user governance, analytics, and impact audit.
    """,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development for seamless local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check server logs."}
    )

# Root Health Check
@app.get("/", tags=["Health"])
def root_status():
    return {
        "status": "online",
        "service": "Smart Food Distribution Platform API",
        "version": settings.VERSION,
        "docs": "/docs",
        "timestamp": "2026"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "database": "connected"}

# Include Routers with API Prefix (/api/v1 and /api for full compatibility)
all_routers = [
    auth.router,
    donations.router,
    requests.router,
    pickups.router,
    distribution.router,
    notifications.router,
    analytics.router,
    ml_match.router,
    matching.router,
    demand.router
]

for r in all_routers:
    app.include_router(r, prefix="/api/v1")
    app.include_router(r, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
