import psycopg2
import os
from urllib.parse import urlparse

# Get the Render database URL from environment variable or use the production URL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://smart_recruiter_user:your_password_here@your-render-db-host:5432/smart_recruiter')

# Parse the database URL
parsed_url = urlparse(DATABASE_URL)

# Connect to the database
conn = psycopg2.connect(
    host=parsed_url.hostname,
    port=parsed_url.port or 5432,
    database=parsed_url.path[1:],  # Remove the leading '/'
    user=parsed_url.username,
    password=parsed_url.password
)

cursor = conn.cursor()

print("Adding correct_answers column to questions table...")
try:
    cursor.execute('ALTER TABLE questions ADD COLUMN correct_answers JSONB;')
    conn.commit()
    print('✅ correct_answers column added successfully')
except psycopg2.errors.DuplicateColumn:
    print('✅ correct_answers column already exists')
except Exception as e:
    print(f'❌ Error adding correct_answers: {e}')
    conn.rollback()

print("\nAdding selected_answers column to answers table...")
try:
    cursor.execute('ALTER TABLE answers ADD COLUMN selected_answers JSONB;')
    conn.commit()
    print('✅ selected_answers column added successfully')
except psycopg2.errors.DuplicateColumn:
    print('✅ selected_answers column already exists')
except Exception as e:
    print(f'❌ Error adding selected_answers: {e}')
    conn.rollback()

# Verify columns exist
print("\nVerifying columns exist...")
cursor.execute("""
SELECT column_name 
FROM information_schema.columns 
WHERE table_name IN ('questions', 'answers') 
AND column_name IN ('correct_answers', 'selected_answers')
""")
results = cursor.fetchall()
for row in results:
    print(f"✅ Found column: {row[0]}")

conn.close()
print("\n🎉 Database schema update complete!")
