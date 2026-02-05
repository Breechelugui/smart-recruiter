import sendgrid
from sendgrid.helpers.mail import Mail
from typing import List
from config import get_settings

settings = get_settings()

class EmailService:
    def __init__(self):
        self.sender_email = settings.email_sender or "noreply@smartrecruiter.com"
        self.sendgrid_api_key = settings.sendgrid_api_key
        self.sg = sendgrid.SendGridAPIClient(api_key=self.sendgrid_api_key) if self.sendgrid_api_key else None
        self.frontend_url = settings.frontend_url

    def send_invitation_email(self, to_email: str, assessment_title: str, scheduled_start: str = None):
        """Send invitation email to candidate"""
        subject = f"Invitation to Assessment: {assessment_title}"
        
        body = f"""
        Dear Candidate,

        You have been invited to take the assessment: {assessment_title}

        {f'Scheduled Start Time: {scheduled_start}' if scheduled_start else 'You can start this assessment at your convenience.'}

        Please log in to your Smart Recruiter dashboard to accept the invitation and begin the assessment.

        Visit: {self.frontend_url}/login

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

        Log in to your Smart Recruiter dashboard to access the assessment: {self.frontend_url}/login

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

        Log in to your Smart Recruiter dashboard to view detailed feedback and results: {self.frontend_url}/login

        Best regards,
        Smart Recruiter Team
        """

        self._send_email(to_email, subject, body)

    def send_feedback_notification(self, to_email: str, candidate_name: str, assessment_title: str, feedback_text: str, recruiter_name: str):
        """Send notification to candidate when recruiter provides feedback"""
        subject = f"New Feedback: {assessment_title}"
        
        body = f"""
        Dear {candidate_name},

        You have received new feedback on your assessment: {assessment_title}

        Feedback from {recruiter_name}:
        {feedback_text}

        Log in to your Smart Recruiter dashboard to view the complete feedback: {self.frontend_url}/login

        Best regards,
        Smart Recruiter Team
        """

        self._send_email(to_email, subject, body)

    def _send_email(self, to_email: str, subject: str, body: str):
        """Internal method to send email using SendGrid"""
        if not self.sg:
            print(f"⚠️  SENDGRID NOT CONFIGURED: Missing SENDGRID_API_KEY in .env")
            print(f"📧 Would send to {to_email}: {subject}")
            print(f"📝 Body preview: {body[:100]}...")
            return

        try:
            print(f"📧 Sending email via SendGrid to {to_email}...")
            
            mail = Mail(
                from_email=self.sender_email,
                to_emails=to_email,
                subject=subject,
                plain_text_content=body
            )
            
            response = self.sg.send(mail)
            print(f"✅ Email sent successfully to {to_email}. Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            print(f"🔧 Check SENDGRID_API_KEY in .env file")

# Singleton instance
email_service = EmailService()
