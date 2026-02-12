#!/usr/bin/env python3

import requests
import json

# Test the registration endpoint with different role values
url = "http://localhost:8000/api/auth/register"

test_cases = [
    {
        "name": "Valid INTERVIEWEE role",
        "user": {
            "email": "test.interviewee@example.com",
            "username": "test_interviewee",
            "full_name": "Test Interviewee",
            "role": "INTERVIEWEE",
            "password": "testpassword123"
        }
    },
    {
        "name": "Valid RECRUITER role", 
        "user": {
            "email": "test.recruiter@example.com",
            "username": "test_recruiter",
            "full_name": "Test Recruiter",
            "role": "RECRUITER",
            "password": "testpassword123"
        }
    },
    {
        "name": "Invalid lowercase role",
        "user": {
            "email": "test.invalid@example.com",
            "username": "test_invalid",
            "full_name": "Test Invalid",
            "role": "interviewee",  # This should fail
            "password": "testpassword123"
        }
    }
]

for test_case in test_cases:
    print(f"\n--- Testing: {test_case['name']} ---")
    try:
        response = requests.post(url, json=test_case['user'])
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
        elif response.status_code == 400:
            print("⚠️ Bad Request - This might be expected for invalid role")
        else:
            print("❌ Registration failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the backend. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
