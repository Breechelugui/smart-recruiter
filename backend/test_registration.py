#!/usr/bin/env python3

import requests
import json

# Test the registration endpoint
url = "http://localhost:8000/api/auth/register"

test_user = {
    "email": "test@example.com",
    "username": "testuser123",
    "full_name": "Test User",
    "role": "INTERVIEWEE",
    "password": "testpassword123"
}

try:
    print("Testing registration endpoint...")
    response = requests.post(url, json=test_user)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
    else:
        print("❌ Registration failed!")
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to the backend. Make sure it's running on localhost:8000")
except Exception as e:
    print(f"❌ Error: {str(e)}")
