from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import UserRole, AssessmentStatus, QuestionType, InvitationStatus, SubmissionStatus


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    is_active: bool
    profile_picture: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class ProfilePictureResponse(BaseModel):
    profile_picture: str
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


# Question Schemas
class QuestionBase(BaseModel):
    question_type: QuestionType
    title: str
    description: Optional[str] = None
    points: int = 10
    order: int = 0
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    codewars_kata_id: Optional[str] = None
    test_cases: Optional[dict] = None
    starter_code: Optional[str] = None


class QuestionCreate(QuestionBase):
    pass


class Question(QuestionBase):
    id: int
    assessment_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Assessment Schemas
class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: Optional[int] = None
    scheduled_start_time: Optional[datetime] = None
    is_trial: bool = False


class AssessmentCreate(AssessmentBase):
    questions: Optional[List[QuestionCreate]] = []


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    scheduled_start_time: Optional[datetime] = None
    status: Optional[AssessmentStatus] = None


class Assessment(AssessmentBase):
    id: int
    status: AssessmentStatus
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    questions: List[Question] = []

    class Config:
        from_attributes = True


class AssessmentWithStats(Assessment):
    total_invitations: int = 0
    total_submissions: int = 0
    total_questions: int = 0
    average_score: float = 0.0


# Invitation Schemas
class InvitationBase(BaseModel):
    assessment_id: int
    interviewee_id: int
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None


class InvitationCreate(InvitationBase):
    pass


class BulkInvitationCreate(BaseModel):
    assessment_id: int
    interviewee_ids: List[int]
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None


class Invitation(InvitationBase):
    id: int
    status: InvitationStatus
    invited_at: datetime
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvitationWithDetails(Invitation):
    assessment: Assessment
    interviewee: User


# Answer Schemas
class AnswerBase(BaseModel):
    question_id: int
    answer_text: Optional[str] = None
    code_solution: Optional[str] = None
    bdd_text: Optional[str] = None
    pseudocode: Optional[str] = None


class AnswerCreate(AnswerBase):
    submission_id: int


class Answer(AnswerBase):
    id: int
    submission_id: int
    is_correct: Optional[bool] = None
    points_earned: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnswerWithQuestion(Answer):
    question: Question


# Submission Schemas
class SubmissionBase(BaseModel):
    assessment_id: int


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    status: Optional[SubmissionStatus] = None
    answers: Optional[List[AnswerCreate]] = None


class Submission(SubmissionBase):
    id: int
    interviewee_id: int
    status: SubmissionStatus
    score: float = 0.0
    max_score: float = 0.0
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    graded_at: Optional[datetime] = None
    time_taken: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Feedback Schemas
class FeedbackBase(BaseModel):
    feedback_text: str


class FeedbackCreate(FeedbackBase):
    submission_id: int
    answer_id: Optional[int] = None


class Feedback(FeedbackBase):
    id: int
    submission_id: int
    answer_id: Optional[int] = None
    recruiter_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeedbackWithRecruiter(Feedback):
    recruiter: User


# Submission Schemas
class SubmissionBase(BaseModel):
    assessment_id: int


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    status: Optional[SubmissionStatus] = None
    answers: Optional[List[AnswerCreate]] = None


class Submission(SubmissionBase):
    id: int
    interviewee_id: int
    status: SubmissionStatus
    score: float = 0.0
    max_score: float = 0.0
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    graded_at: Optional[datetime] = None
    time_taken: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubmissionWithDetails(Submission):
    assessment: Assessment
    interviewee: User
    answers: List[AnswerWithQuestion] = []
    feedbacks: List[FeedbackWithRecruiter] = []


# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: Optional[str] = None
    related_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    user_id: int


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Statistics Schemas
class AssessmentStatistics(BaseModel):
    assessment_id: int
    total_invitations: int
    total_submissions: int
    completed_submissions: int
    average_score: float
    highest_score: float
    lowest_score: float
    average_time_taken: float
    question_statistics: List[dict]


class DashboardStats(BaseModel):
    total_assessments: int
    total_invitations: int
    total_submissions: int
    pending_reviews: int
