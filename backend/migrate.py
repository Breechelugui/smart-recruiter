"""Add missing columns to users table"""

from sqlalchemy import text
from database import engine

def upgrade():
    with engine.connect() as conn:
        # Add missing columns if they don't exist
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255),
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'interviewee',
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        """))
        conn.commit()

if __name__ == "__main__":
    upgrade()
    print("Migration completed successfully")