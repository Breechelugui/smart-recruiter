#!/usr/bin/env python3
"""Test email configuration"""

from services.email_service import email_service

# Test sending an email
email_service.send_invitation_email(
    to_email="test@example.com",
    assessment_title="Test Assessment",
    scheduled_start="2024-01-30 10:00"
)

print("Email test completed. Check your email (or console if not configured).")
