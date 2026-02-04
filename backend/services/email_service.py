import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from config import get_settings

settings = get_settings()

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = settings.email_sender or "noreply@smartrecruiter.com"
        self.sender_password = settings.email_password or ""

    def send_invitation_email(self, to_email: str, assessment_title: str, scheduled_start: str = None):
        """Send invitation email to candidate"""
        subject = f"Invitation to Assessment: {assessment_title}"
        
        body = f"""
        Dear Candidate,

        You have been invited to take the assessment: {assessment_title}

        {f'Scheduled Start Time: {scheduled_start}' if scheduled_start else 'You can start this assessment at your convenience.'}

        Please log in to your Smart Recruiter dashboard to accept the invitation and begin the assessment.

        Best regards,
        Smart Recruiter Team
        """

        self._send_email(to_email, subject, body)

    def send_reminder_email(self, to_email: str, assessment_title: str, scheduled_start: str):
        """Send reminder email before assessment"""
        subject = f"Reminder: Assessment Starting Soon - {assessment_title}"
        
        body = f"""
        Dear Candidate,

        This is a reminder that your assessment "{assessment_title}" is scheduled to start at:
        {scheduled_start}

        Please ensure you have a stable internet connection and are ready to begin on time.

        Log in to your Smart Recruiter dashboard to access the assessment.

        Best regards,
        Smart Recruiter Team
        """

        self._send_email(to_email, subject, body)

    def send_result_notification(self, to_email: str, assessment_title: str, score: int, status: str):
        """Send notification when results are available"""
        subject = f"Assessment Results Available: {assessment_title}"
        
        body = f"""
        Dear Candidate,

        Your results for the assessment "{assessment_title}" are now available.

        Score: {score}
        Status: {status}

        Log in to your Smart Recruiter dashboard to view detailed feedback and results.

        Best regards,
        Smart Recruiter Team
        """

        self._send_email(to_email, subject, body)

    def _send_email(self, to_email: str, subject: str, body: str):
        """Internal method to send email"""
        if not self.sender_password:
            print(f"Email not configured. Would send to {to_email}: {subject}")
            return

        try:
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            text = msg.as_string()
            server.sendmail(self.sender_email, to_email, text)
            server.quit()
            print(f"Email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")

# Singleton instance
email_service = EmailService()
