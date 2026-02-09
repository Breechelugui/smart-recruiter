#!/usr/bin/env python3
"""
Direct database fix for production environment
This script will be executed to add the missing column
"""
import os
import sys
from database import engine
from sqlalchemy import text

def fix_production_database():
    """Fix production database by adding missing column"""
    try:
        print("🔧 Fixing production database...")
        
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name = 'allow_multiple_answers'
            """))
            
            column_exists = result.fetchone() is not None
            
            if not column_exists:
                print("📝 Adding missing allow_multiple_answers column...")
                conn.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN allow_multiple_answers BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                print("✅ Column added successfully!")
                
                # Update existing records
                conn.execute(text("""
                    UPDATE questions 
                    SET allow_multiple_answers = FALSE 
                    WHERE allow_multiple_answers IS NULL
                """))
                conn.commit()
                print("✅ Existing records updated!")
                
            else:
                print("ℹ️ Column already exists")
                
        print("🎉 Production database fixed!")
        return True
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        return False

if __name__ == "__main__":
    success = fix_production_database()
    sys.exit(0 if success else 1)
