from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
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
    # Run migration first
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

# Add new columns for multiple answer questions
try:
    import psycopg2
    from psycopg2 import OperationalError
    
    try:
        conn = psycopg2.connect(settings.database_url)
        cursor = conn.cursor()
        
        # Add correct_answers column to questions table
        try:
            cursor.execute('ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answers JSONB;')
            conn.commit()
            logger.info("Added correct_answers column to questions table")
        except Exception as e:
            logger.info(f"correct_answers column issue: {e}")
        
        # Add selected_answers column to answers table
        try:
            cursor.execute('ALTER TABLE answers ADD COLUMN IF NOT EXISTS selected_answers JSONB;')
            conn.commit()
            logger.info("Added selected_answers column to answers table")
        except Exception as e:
            logger.info(f"selected_answers column issue: {e}")
        
        # Fix existing lowercase 'interviewee' values in users table
        try:
            cursor.execute("UPDATE users SET role = 'INTERVIEWEE' WHERE role = 'interviewee';")
            cursor.execute("UPDATE users SET role = 'RECRUITER' WHERE role = 'recruiter';")
            conn.commit()
            logger.info("Fixed lowercase role values in users table")
        except Exception as e:
            logger.info(f"Role values issue: {e}")
        
        conn.close()
        logger.info("Database schema update completed")
    except OperationalError as e:
        logger.warning(f"Could not connect to database for schema update: {e}")
    except Exception as e:
        logger.error(f"Database schema update failed: {e}")
        
except ImportError as e:
    logger.warning(f"psycopg2 not available for schema update: {e}")
except Exception as e:
    logger.error(f"Unexpected error during schema update: {e}")

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
    allow_origins=[
        settings.frontend_url, 
        "http://localhost:5173",
        "https://own-app-ten.vercel.app", 
        "https://own-cijus23il-brians-projects-cd82ed89.vercel.app", 
        "http://localhost:5174", 
        "http://localhost:3000", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:5174", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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


# Global exception handler to ensure CORS headers are always set
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


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
