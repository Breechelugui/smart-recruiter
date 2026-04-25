"""Add missing columns to users table"""

from sqlalchemy import text, inspect
from database import engine, Base


def upgrade():
    # First create all tables if they don't exist
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        # Check if users table exists
        inspector = inspect(engine)
        if "users" not in inspector.get_table_names():
            print("Users table does not exist, tables created from models")
            return

        # Add missing columns if they don't exist
        conn.execute(
            text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255) NOT NULL DEFAULT 'invalid_hash_placeholder',
            ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255),
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'interviewee',
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        """)
        )
        conn.commit()

        # Normalize legacy role values
        conn.execute(
            text("""
            UPDATE users
            SET role = 'INTERVIEWEE'
            WHERE role IN ('interviewee', 'user', 'candidate', 'field_agent');
        """)
        )
        conn.execute(
            text("""
            UPDATE users
            SET role = 'RECRUITER'
            WHERE role = 'recruiter';
        """)
        )
        conn.commit()


if __name__ == "__main__":
    upgrade()
    print("Migration completed successfully")
