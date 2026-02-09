#!/usr/bin/env python3
"""Test CodeWars API integration"""

from services.codewars_service import codewars_service

# Test fetching a specific kata
print("Testing CodeWars API...")
kata = codewars_service.get_kata_by_id("5266876b8f4bf2da9b000362")
if kata:
    print(f" Successfully fetched kata: {kata.get('name')}")
    print(f"   Description: {kata.get('description', '')[:100]}...")
else:
    print(" Failed to fetch kata")

# Test searching katas
print("\nSearching for katas...")
katas = codewars_service.search_katas("array")
print(f"Found {len(katas)} katas")
for kata in katas[:3]:
    print(f"  - {kata.get('name')} (Difficulty: {kata.get('rank', {}).get('name', 'Unknown')})")
