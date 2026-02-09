#!/usr/bin/env python3
"""
Production migration script to add allow_multiple_answers field to questions table
This script handles the production environment safely
"""
import os
import sys
from database import engine, Base
from sqlalchemy import text

def run_production_migration():
    """Run migration in production environment"""
    try:
        print("🔧 Running production migration for allow_multiple_answers field...")
        
        with engine.connect() as conn:
            # Check if we're in production by checking database URL
            database_url = os.getenv('DATABASE_URL', '')
            is_production = 'render' in database_url or 'railway' in database_url or 'heroku' in database_url
            
            print(f"📍 Environment: {'Production' if is_production else 'Development'}")
            
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name = 'allow_multiple_answers'
            """))
            
            column_exists = result.fetchone() is not None
            
            if not column_exists:
                print("📝 Adding allow_multiple_answers column to questions table...")
                
                # Use different syntax based on database type
                if 'postgresql' in database_url:
                    conn.execute(text("""
                        ALTER TABLE questions 
                        ADD COLUMN allow_multiple_answers BOOLEAN DEFAULT FALSE
                    """))
                else:
                    # SQLite fallback
                    conn.execute(text("""
                        ALTER TABLE questions 
                        ADD COLUMN allow_multiple_answers BOOLEAN DEFAULT 0
                    """))
                
                conn.commit()
                print("✅ Column added successfully!")
                
                # Verify the column
                result = conn.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'questions' 
                    AND column_name = 'allow_multiple_answers'
                """))
                
                column_info = result.fetchone()
                if column_info:
                    print(f"📋 Column verified: {column_info[0]} ({column_info[1]})")
                
            else:
                print("ℹ️ Column allow_multiple_answers already exists")
                
            # Update existing questions to have default value
            if not column_exists:
                print("🔄 Updating existing questions with default values...")
                conn.execute(text("""
                    UPDATE questions 
                    SET allow_multiple_answers = FALSE 
                    WHERE allow_multiple_answers IS NULL
                """))
                conn.commit()
                print("✅ Existing questions updated!")
                
        print("🎉 Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_production_migration()
    sys.exit(0 if success else 1)
