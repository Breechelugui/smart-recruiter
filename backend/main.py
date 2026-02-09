from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from config import get_settings
from routers import auth, assessments, invitations, submissions, notifications, codewars, users, analytics
from services.notification_scheduler import start_scheduler, stop_scheduler
import asyncio
import logging
import os

settings = get_settings()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
try:
    # Ensure database schema is up to date first
    from startup_fix import ensure_database_schema
    if ensure_database_schema():
        logger.info("Database schema verified")
    else:
        logger.warning("Database schema verification failed, continuing...")
    
    # Run regular migration
    from migrate import upgrade
    upgrade()
    logger.info("Database migration completed")
except Exception as e:
    logger.error(f"Migration failed: {e}")

Base.metadata.create_all(bind=engine)

# Seed database with assessments
try:
    from seed_katas import seed
    seed()
    logger.info("Database seeding completed")
except Exception as e:
    logger.error(f"Seeding failed: {e}")
    
    # If seeding fails due to missing column, try to fix it
    if "allow_multiple_answers" in str(e):
        logger.info("Attempting to fix missing database column...")
        try:
            from fix_production_db import fix_production_database
            if fix_production_database():
                logger.info("Database fixed, retrying seeding...")
                from seed_katas import seed
                seed()
                logger.info("Database seeding completed after fix")
            else:
                logger.error("Failed to fix database")
        except Exception as fix_error:
            logger.error(f"Database fix failed: {fix_error}")
    else:
        logger.error(f"Seeding failed with different error: {e}")

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI(
    title="Smart Recruiter API",
    description="API for Smart Recruiter - Technical Interview Assessment Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173","https://own-app-ten.vercel.app", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from uploads directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(assessments.router)
app.include_router(invitations.router)
app.include_router(submissions.router)
app.include_router(notifications.router)
app.include_router(codewars.router)
app.include_router(users.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Recruiter API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """Start the notification scheduler when the app starts"""
    logger.info("Starting Smart Recruiter API...")
    try:
        await start_scheduler()
        logger.info("Notification scheduler started successfully")
    except Exception as e:
        logger.error(f"Failed to start notification scheduler: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Stop the notification scheduler when the app shuts down"""
    logger.info("Shutting down Smart Recruiter API...")
    try:
        await stop_scheduler()
        logger.info("Notification scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Failed to stop notification scheduler: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
