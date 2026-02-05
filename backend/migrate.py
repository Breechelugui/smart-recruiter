"""Add profile_picture column to users table"""

from sqlalchemy import text
from database import engine

def upgrade():
    with engine.connect() as conn:
        # Add profile_picture column if it doesn't exist
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
        """))
        conn.commit()

if __name__ == "__main__":
    upgrade()
    print("Migration completed successfully")