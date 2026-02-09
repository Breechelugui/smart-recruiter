from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    RECRUITER = "recruiter"
    INTERVIEWEE = "interviewee"


class AssessmentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SUBJECTIVE = "subjective"
    CODING = "coding"


class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class SubmissionStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    profile_picture = Column(String)  # URL or path to profile picture
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    created_assessments = relationship("Assessment", back_populates="creator", foreign_keys="Assessment.creator_id")
    invitations = relationship("Invitation", back_populates="interviewee")
    submissions = relationship("Submission", back_populates="interviewee")
    feedbacks = relationship("Feedback", back_populates="recruiter")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    time_limit = Column(Integer)  # in minutes
    scheduled_start_time = Column(DateTime(timezone=True))  # When assessment should start
    status = Column(SQLEnum(AssessmentStatus), default=AssessmentStatus.DRAFT)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_trial = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))

    # Relationships
    creator = relationship("User", back_populates="created_assessments", foreign_keys=[creator_id])
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="assessment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    points = Column(Integer, default=10)
    order = Column(Integer, default=0)
    
    # For multiple choice questions
    options = Column(JSON)  # List of options
    correct_answer = Column(String)  # For multiple choice (JSON string for multiple answers)
    allow_multiple_answers = Column(Boolean, default=False)  # Whether multiple selections are allowed
    
    # For coding questions
    codewars_kata_id = Column(String)  # If fetched from Codewars
    test_cases = Column(JSON)  # For coding challenges
    starter_code = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    assessment = relationship("Assessment", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    interviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING)
    invited_at = Column(DateTime(timezone=True), server_default=func.now())
    responded_at = Column(DateTime(timezone=True))
    scheduled_start = Column(DateTime(timezone=True))
    scheduled_end = Column(DateTime(timezone=True))

    # Relationships
    assessment = relationship("Assessment", back_populates="invitations")
    interviewee = relationship("User", back_populates="invitations")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    interviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.NOT_STARTED)
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    started_at = Column(DateTime(timezone=True))
    submitted_at = Column(DateTime(timezone=True))
    graded_at = Column(DateTime(timezone=True))
    time_taken = Column(Integer)  # in seconds
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assessment = relationship("Assessment", back_populates="submissions")
    interviewee = relationship("User", back_populates="submissions")
    answers = relationship("Answer", back_populates="submission", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="submission", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    # Answer content
    answer_text = Column(Text)  # For subjective and multiple choice
    code_solution = Column(Text)  # For coding questions
    bdd_text = Column(Text)  # BDD for coding questions
    pseudocode = Column(Text)  # Pseudocode for coding questions
    
    # Grading
    is_correct = Column(Boolean)
    points_earned = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    feedbacks = relationship("Feedback", back_populates="answer", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id"))
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    submission = relationship("Submission", back_populates="feedbacks")
    answer = relationship("Answer", back_populates="feedbacks")
    recruiter = relationship("User", back_populates="feedbacks")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String)  # invitation, feedback, grade_released, etc.
    related_id = Column(Integer)  # ID of related entity (assessment, submission, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
