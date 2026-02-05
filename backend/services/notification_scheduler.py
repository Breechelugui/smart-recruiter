import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import Invitation, Assessment, User, Notification
from services.email_service import email_service
from config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get settings instance
settings = get_settings()

class NotificationScheduler:
    def __init__(self):
        self.is_running = False
        self.task = None

    async def start(self):
        """Start the notification scheduler"""
        if self.is_running:
            logger.info("Notification scheduler is already running")
            return
        
        self.is_running = True
        self.task = asyncio.create_task(self._scheduler_loop())
        logger.info("Notification scheduler started")
 
    async def stop(self):
        """Stop the notification scheduler"""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Notification scheduler stopped")

    async def _scheduler_loop(self):
        """Main scheduler loop"""
        while self.is_running:
            try:
                await self._check_and_send_notifications()
                # Check every 5 minutes
                await asyncio.sleep(300)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying

    async def _check_and_send_notifications(self):
        """Check for upcoming assessments and send notifications"""
        from database import SessionLocal
        
        db = SessionLocal()
        try:
            # Get upcoming assessments in the next 24 hours
            now = datetime.utcnow()
            tomorrow = now + timedelta(hours=24)
            
            # Find invitations for assessments starting soon
            upcoming_invitations = db.query(Invitation).join(Assessment).filter(
                and_(
                    Invitation.status == 'accepted',
                    Assessment.published_at <= now,
                    Assessment.published_at >= now - timedelta(days=7),  # Assessments published in last week
                    # Add scheduled_start_time field to Assessment model if needed
                )
            ).all()
            
            for invitation in upcoming_invitations:
                await self._send_assessment_reminders(db, invitation)
                
        except Exception as e:
            logger.error(f"Error checking notifications: {e}")
        finally:
            db.close()

    async def _send_assessment_reminders(self, db: Session, invitation: Invitation):
        """Send reminders for an assessment"""
        try:
            # Get assessment details
            assessment = db.query(Assessment).filter(
                Assessment.id == invitation.assessment_id
            ).first()
            
            if not assessment:
                return
            
            # Get candidate details
            candidate = db.query(User).filter(
                User.id == invitation.interviewee_id
            ).first()
            
            if not candidate:
                return
            
            # Check if we should send a reminder based on assessment timing
            now = datetime.now(timezone.utc)
            
            # Send reminder 24 hours before (if assessment has a scheduled start time)
            if hasattr(assessment, 'scheduled_start_time') and assessment.scheduled_start_time:
                time_until_assessment = assessment.scheduled_start_time - now
                
                # Send 24-hour reminder
                if timedelta(hours=23) <= time_until_assessment <= timedelta(hours=25):
                    await self._send_reminder_email(
                        candidate=candidate,
                        assessment=assessment,
                        reminder_type="24_hours",
                        time_until=assessment.scheduled_start_time
                    )
                
                # Send 1-hour reminder
                elif timedelta(minutes=50) <= time_until_assessment <= timedelta(minutes=70):
                    await self._send_reminder_email(
                        candidate=candidate,
                        assessment=assessment,
                        reminder_type="1_hour",
                        time_until=assessment.scheduled_start_time
                    )
            
            # If no scheduled start time, send reminder based on invitation acceptance
            else:
                # Send reminder 1 day after acceptance if not started
                days_since_acceptance = (now - invitation.responded_at).days if invitation.responded_at else 0
                if days_since_acceptance == 1:
                    await self._send_reminder_email(
                        candidate=candidate,
                        assessment=assessment,
                        reminder_type="reminder",
                        time_until=None
                    )
                    
        except Exception as e:
            logger.error(f"Error sending reminders for invitation {invitation.id}: {e}")

    async def _send_reminder_email(self, candidate: User, assessment: Assessment, 
                                 reminder_type: str, time_until: Optional[datetime]):
        """Send reminder email to candidate"""
        try:
            if reminder_type == "24_hours":
                subject = f"Reminder: Assessment Tomorrow - {assessment.title}"
                time_text = f"Your assessment '{assessment.title}' is scheduled for tomorrow at {time_until.strftime('%I:%M %p')}"
            elif reminder_type == "1_hour":
                subject = f"URGENT: Assessment in 1 Hour - {assessment.title}"
                time_text = f"Your assessment '{assessment.title}' starts in 1 hour at {time_until.strftime('%I:%M %P')}"
            else:
                subject = f"Reminder: Complete Your Assessment - {assessment.title}"
                time_text = f"Don't forget to complete your assessment '{assessment.title}'"
            
            # Create HTML email content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Assessment Reminder</title>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f8f9fa;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }}
                    .btn {{
                        display: inline-block;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        margin: 20px 0;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 14px;
                    }}
                    .urgent {{
                        background-color: #fee2e2;
                        border-left: 4px solid #ef4444;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>⏰ Assessment Reminder</h1>
                    <p>Don't miss your upcoming assessment</p>
                </div>
                
                <div class="content">
                    <h2>Hello {candidate.full_name or candidate.username},</h2>
                    
                    <p>{time_text}</p>
                    
                    <div class="urgent">
                        <strong>Assessment Details:</strong><br>
                        📝 <strong>Title:</strong> {assessment.title}<br>
                        ⏱️ <strong>Time Limit:</strong> {assessment.time_limit or 'Not specified'} minutes<br>
                        📋 <strong>Questions:</strong> {len(assessment.questions) if assessment.questions else 'Multiple'} questions
                    </div>
                    
                    <p><strong>What you need to know:</strong></p>
                    <ul>
                        <li>Ensure you have a stable internet connection</li>
                        <li>Find a quiet environment for the assessment</li>
                        <li>Have any necessary tools ready (calculator, etc.)</li>
                        <li>The assessment timer will start automatically when you begin</li>
                    </ul>
                    
                    <a href="{settings.frontend_url}/interviewee/active-test/{invitation.id}" class="btn">
                        Start Assessment
                    </a>
                    
                    <div class="footer">
                        <p>Best regards,<br>
                        The Smart Recruiter Team</p>
                        <p><small>This is an automated message. Please do not reply to this email.</small></p>
                    </div>
                </div>
            </body>
            </html>
            """

            text_content = f"""
Hello {candidate.full_name or candidate.username},

{time_text}

Assessment Details:
- Title: {assessment.title}
- Time Limit: {assessment.time_limit or 'Not specified'} minutes
- Questions: {len(assessment.questions) if assessment.questions else 'Multiple'} questions

What you need to know:
- Ensure you have a stable internet connection
- Find a quiet environment for the assessment
- Have any necessary tools ready (calculator, etc.)
- The assessment timer will start automatically when you begin

Start your assessment here:
{settings.frontend_url}/interviewee/active-test/{invitation.id}

Best regards,
Smart Recruiter Team
            """

            # Send email
            email_service._send_email(
                to_email=candidate.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            logger.info(f"Sent {reminder_type} reminder to {candidate.email} for assessment {assessment.title}")
            
        except Exception as e:
            logger.error(f"Failed to send reminder email: {e}")

    def create_assessment_reminder_notification(self, db: Session, user_id: int, 
                                              assessment_title: str, reminder_type: str):
        """Create in-app notification for assessment reminder"""
        try:
            notification = Notification(
                user_id=user_id,
                title=f"Assessment Reminder - {assessment_title}",
                message=self._get_reminder_message(reminder_type, assessment_title),
                notification_type="assessment_reminder",
                related_id=None
            )
            db.add(notification)
            db.commit()
            logger.info(f"Created in-app reminder notification for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to create reminder notification: {e}")

    def _get_reminder_message(self, reminder_type: str, assessment_title: str) -> str:
        """Get reminder message based on type"""
        messages = {
            "24_hours": f"Your assessment '{assessment_title}' is scheduled for tomorrow. Please prepare accordingly.",
            "1_hour": f"URGENT: Your assessment '{assessment_title}' starts in 1 hour. Please be ready.",
            "reminder": f"Reminder: Don't forget to complete your assessment '{assessment_title}'."
        }
        return messages.get(reminder_type, f"Reminder for assessment: {assessment_title}")

# Global scheduler instance
notification_scheduler = NotificationScheduler()

async def start_scheduler():
    """Start the notification scheduler"""
    await notification_scheduler.start()

async def stop_scheduler():
    """Stop the notification scheduler"""
    await notification_scheduler.stop()

def get_scheduler():
    """Get the scheduler instance"""
    return notification_scheduler
