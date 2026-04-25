"""Force-add hashed_password column to users table (Render fix)"""

import psycopg2
import os
from urllib.parse import urlparse

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://smart_recruiter_user:your_password_here@your-render-db-host:5432/smart_recruiter",
)

parsed_url = urlparse(DATABASE_URL)

conn = psycopg2.connect(
    host=parsed_url.hostname,
    port=parsed_url.port or 5432,
    database=parsed_url.path[1:],
    user=parsed_url.username,
    password=parsed_url.password,
)

cursor = conn.cursor()

print("Checking users table columns...")
cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position;
""")
columns = [row[0] for row in cursor.fetchall()]
print(f"Existing columns: {columns}")

if "hashed_password" not in columns:
    print("❌ hashed_password column missing. Adding it now...")
    try:
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN hashed_password VARCHAR(255) NOT NULL DEFAULT 'temp_hash_please_reset';
        """)
        conn.commit()
        print("✅ hashed_password column added successfully")
    except Exception as e:
        print(f"❌ Failed to add column: {e}")
        conn.rollback()
else:
    print("✅ hashed_password column already exists")

cursor.close()
conn.close()
print("\n🎉 Fix complete!")
