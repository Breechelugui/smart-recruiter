from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from database import get_db
from models import (
    User, Submission, Assessment, Answer, Question, Feedback,
    SubmissionStatus, UserRole, QuestionType, Notification
)
from schemas import (
    SubmissionCreate, Submission as SubmissionSchema, SubmissionWithDetails,
    SubmissionUpdate, AnswerCreate, Answer as AnswerSchema,
    FeedbackCreate, Feedback as FeedbackSchema
)
from services.email_service import email_service
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionSchema, status_code=status.HTTP_201_CREATED)
def start_submission(
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INTERVIEWEE))
):
    """Start a new submission (Interviewee only)"""
    # Verify assessment exists
    assessment = db.query(Assessment).filter(Assessment.id == submission_data.assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Check if submission already exists
    existing = db.query(Submission).filter(
        Submission.assessment_id == submission_data.assessment_id,
        Submission.interviewee_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission already exists for this assessment"
        )
    
    # Calculate max score
    max_score = sum(q.points for q in assessment.questions)
    
    # Create submission
    submission = Submission(
        assessment_id=submission_data.assessment_id,
        interviewee_id=current_user.id,
        status=SubmissionStatus.IN_PROGRESS,
        started_at=datetime.now(timezone.utc),
        max_score=max_score
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission


@router.get("", response_model=List[SubmissionWithDetails])
def get_submissions(
    assessment_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get submissions based on user role"""
    from sqlalchemy.orm import joinedload
    
    query = db.query(Submission).options(
        joinedload(Submission.answers).joinedload(Answer.question),
        joinedload(Submission.assessment).joinedload(Assessment.questions),
        joinedload(Submission.interviewee)
    )
    
    if current_user.role == UserRole.RECRUITER:
        # Get submissions for assessments created by this recruiter
        query = query.join(Assessment).filter(Assessment.creator_id == current_user.id)
    else:
        # Get submissions for this interviewee
        query = query.filter(Submission.interviewee_id == current_user.id)
    
    if assessment_id:
        query = query.filter(Submission.assessment_id == assessment_id)
    
    submissions = query.offset(skip).limit(limit).all()
    
    return submissions


@router.get("/{submission_id}", response_model=SubmissionWithDetails)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific submission"""
    from sqlalchemy.orm import joinedload
    
    submission = db.query(Submission).options(
        joinedload(Submission.answers).joinedload(Answer.question),
        joinedload(Submission.assessment).joinedload(Assessment.questions),
        joinedload(Submission.interviewee)
    ).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.RECRUITER:
        if submission.assessment.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this submission"
            )
    else:
        if submission.interviewee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this submission"
            )
    
    return submission


@router.post("/{submission_id}/answers", response_model=AnswerSchema, status_code=status.HTTP_201_CREATED)
def save_answer(
    submission_id: int,
    answer_data: AnswerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INTERVIEWEE))
):
    """Save or update an answer (Interviewee only)"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.interviewee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this submission"
        )
    
    if submission.status == SubmissionStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a submitted assessment"
        )
    
    # Check if answer already exists
    existing_answer = db.query(Answer).filter(
        Answer.submission_id == submission_id,
        Answer.question_id == answer_data.question_id
    ).first()
    
    if existing_answer:
        # Update existing answer
        existing_answer.answer_text = answer_data.answer_text
        existing_answer.code_solution = answer_data.code_solution
        existing_answer.bdd_text = answer_data.bdd_text
        existing_answer.pseudocode = answer_data.pseudocode
        existing_answer.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(existing_answer)
        return existing_answer
    
    # Create new answer
    answer = Answer(
        submission_id=submission_id,
        question_id=answer_data.question_id,
        answer_text=answer_data.answer_text,
        code_solution=answer_data.code_solution,
        bdd_text=answer_data.bdd_text,
        pseudocode=answer_data.pseudocode
    )
    
    db.add(answer)
    db.commit()
    db.refresh(answer)
    
    return answer


@router.post("/{submission_id}/save", response_model=SubmissionSchema)
def save_answers(
    submission_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INTERVIEWEE))
):
    """Save answers for a submission (Interviewee only)"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.interviewee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to save this assessment"
        )
    
    if submission.status == SubmissionStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot save answers for a submitted assessment"
        )
    
    # Clear existing answers and save new ones
    db.query(Answer).filter(Answer.submission_id == submission_id).delete()
    
    for question_id, answer_text in payload.get("answers", {}).items():
        answer = Answer(
            submission_id=submission_id,
            question_id=int(question_id),
            answer_text=answer_text
        )
        db.add(answer)
    
    db.commit()
    db.refresh(submission)
    return submission


@router.post("/{submission_id}/submit", response_model=SubmissionSchema)
def submit_assessment(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INTERVIEWEE))
):
    """Submit an assessment (Interviewee only)"""
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )
        
        if submission.interviewee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to submit this assessment"
            )
        
        if submission.status == SubmissionStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment already submitted"
            )
        
        # Calculate time taken
        if submission.started_at:
            now = datetime.now(timezone.utc)
            started = submission.started_at.replace(tzinfo=timezone.utc) if submission.started_at.tzinfo is None else submission.started_at
            time_taken = int((now - started).total_seconds())
            submission.time_taken = time_taken
        
        # Auto-grade multiple choice questions
        total_score = 0.0
        for answer in submission.answers:
            question = answer.question
            if question.question_type == QuestionType.MULTIPLE_CHOICE:
                if answer.answer_text == question.correct_answer:
                    answer.is_correct = True
                    answer.points_earned = question.points
                    total_score += question.points
                else:
                    answer.is_correct = False
                    answer.points_earned = 0
        
        submission.score = total_score
        submission.status = SubmissionStatus.SUBMITTED
        submission.submitted_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(submission)
        
        return submission
    except Exception as e:
        print("Submit error:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{submission_id}/grade", response_model=SubmissionSchema)
def grade_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Grade a submission (Recruiter only)"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to grade this submission"
        )
    
    if submission.status != SubmissionStatus.SUBMITTED and submission.status != SubmissionStatus.GRADED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only grade submitted assessments"
        )
    
    # Calculate total score from all answers
    total_score = sum(answer.points_earned for answer in submission.answers)
    
    submission.score = total_score
    submission.status = SubmissionStatus.GRADED
    submission.graded_at = datetime.utcnow()
    
    # Create notification for interviewee
    notification = Notification(
        user_id=submission.interviewee_id,
        title="Assessment Graded",
        message=f"Your assessment '{submission.assessment.title}' has been graded. Score: {total_score}/{submission.max_score}",
        notification_type="grade_released",
        related_id=submission.assessment_id
    )
    db.add(notification)
    
    db.commit()
    db.refresh(submission)
    
    # Send grade notification email
    try:
        email_service.send_result_notification(
            submission.interviewee.email,
            submission.assessment.title,
            int(total_score),
            "Graded"
        )
    except Exception as e:
        print(f"Failed to send grade email: {e}")
    
    return submission


@router.post("/{submission_id}/feedback", response_model=FeedbackSchema, status_code=status.HTTP_201_CREATED)
def add_feedback(
    submission_id: int,
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Add feedback to a submission (Recruiter only)"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission.assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to provide feedback for this submission"
        )
    
    # Verify answer exists if answer_id is provided
    if feedback_data.answer_id:
        answer = db.query(Answer).filter(Answer.id == feedback_data.answer_id).first()
        if not answer or answer.submission_id != submission_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Answer not found"
            )
    
    feedback = Feedback(
        submission_id=submission_id,
        answer_id=feedback_data.answer_id,
        recruiter_id=current_user.id,
        feedback_text=feedback_data.feedback_text
    )
    
    db.add(feedback)
    
    # Create notification for interviewee
    notification = Notification(
        user_id=submission.interviewee_id,
        title="New Feedback",
        message=f"You have received feedback on your assessment '{submission.assessment.title}'",
        notification_type="feedback",
        related_id=submission.assessment_id
    )
    db.add(notification)
    
    db.commit()
    db.refresh(feedback)
    
    # Send feedback email
    try:
        email_service.send_feedback_notification(
            submission.interviewee.email,
            submission.interviewee.full_name or submission.interviewee.username,
            submission.assessment.title,
            feedback_data.feedback_text,
            current_user.full_name or current_user.username
        )
    except Exception as e:
        print(f"Failed to send feedback email: {e}")
    
    return feedback


@router.put("/answers/{answer_id}/grade", response_model=AnswerSchema)
def grade_answer(
    answer_id: int,
    points_earned: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Grade a specific answer (Recruiter only)"""
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Answer not found"
        )
    
    submission = answer.submission
    if submission.assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to grade this answer"
        )
    
    # Validate points
    if points_earned < 0 or points_earned > answer.question.points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Points must be between 0 and {answer.question.points}"
        )
    
    answer.points_earned = points_earned
    answer.is_correct = points_earned == answer.question.points
    
    db.commit()
    db.refresh(answer)
    
    return answer
