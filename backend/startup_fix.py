#!/usr/bin/env python3
"""
Startup fix script to ensure database schema is up to date
"""
import os
import sys
from database import engine
from sqlalchemy import text

def ensure_database_schema():
    """Ensure database has all required columns"""
    try:
        print("🔧 Ensuring database schema is up to date...")
        
        with engine.connect() as conn:
            # Check if allow_multiple_answers column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name = 'allow_multiple_answers'
            """))
            
            column_exists = result.fetchone() is not None
            
            if not column_exists:
                print("📝 Adding allow_multiple_answers column...")
                conn.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN allow_multiple_answers BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                print("✅ Column added successfully!")
            else:
                print("ℹ️ allow_multiple_answers column already exists")
                
        print("🎉 Database schema verified!")
        return True
        
    except Exception as e:
        print(f"❌ Schema check failed: {e}")
        return False

if __name__ == "__main__":
    success = ensure_database_schema()
    sys.exit(0 if success else 1)
