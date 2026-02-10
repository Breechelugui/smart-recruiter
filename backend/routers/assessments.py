from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from database import get_db
from models import User, Assessment, Question, Submission, AssessmentStatus, UserRole
from schemas import (
    AssessmentCreate, Assessment as AssessmentSchema, AssessmentUpdate,
    AssessmentWithStats, QuestionCreate, Question as QuestionSchema,
    AssessmentStatistics
)
from auth import get_current_active_user, require_role

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


@router.post("", response_model=AssessmentSchema, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Create a new assessment (Recruiter only)"""
    new_assessment = Assessment(
        title=assessment_data.title,
        description=assessment_data.description,
        time_limit=assessment_data.time_limit,
        is_trial=assessment_data.is_trial,
        creator_id=current_user.id,
        status=AssessmentStatus.DRAFT
    )
    
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    
    # Add questions if provided
    if assessment_data.questions:
        for idx, question_data in enumerate(assessment_data.questions):
            question = Question(
                assessment_id=new_assessment.id,
                question_type=question_data.question_type,
                title=question_data.title,
                description=question_data.description,
                points=question_data.points,
                order=idx,
                options=question_data.options,
                correct_answer=question_data.correct_answer,
                codewars_kata_id=question_data.codewars_kata_id,
                test_cases=question_data.test_cases,
                starter_code=question_data.starter_code
            )
            db.add(question)
        
        db.commit()
        db.refresh(new_assessment)
    
    return new_assessment


@router.get("", response_model=List[AssessmentWithStats])
def get_assessments(
    skip: int = 0,
    limit: int = 100,
    status: AssessmentStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all assessments based on user role"""
    query = db.query(Assessment)
    
    if current_user.role == UserRole.RECRUITER:
        # Recruiters see their own assessments
        query = query.filter(Assessment.creator_id == current_user.id)
    else:
        # Interviewees see only published assessments or trial assessments
        query = query.filter(
            (Assessment.status == AssessmentStatus.PUBLISHED) |
            (Assessment.is_trial == True)
        )
    
    if status:
        query = query.filter(Assessment.status == status)
    
    assessments = query.offset(skip).limit(limit).all()
    
    # Add statistics
    result = []
    for assessment in assessments:
        total_invitations = len(assessment.invitations)
        total_submissions = len(assessment.submissions)
        total_questions = len(assessment.questions)

        avg_score = db.query(func.avg(Submission.score)).filter(
            Submission.assessment_id == assessment.id
        ).scalar() or 0.0

        assessment_dict = AssessmentSchema.from_orm(assessment).dict()
        assessment_dict.update({
            "total_invitations": total_invitations,
            "total_submissions": total_submissions,
            "total_questions": total_questions,
            "average_score": float(avg_score)
        })
        result.append(AssessmentWithStats(**assessment_dict))
    
    return result


@router.get("/{assessment_id}", response_model=AssessmentSchema)
def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.RECRUITER:
        if assessment.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this assessment"
            )
    else:
        if assessment.status != AssessmentStatus.PUBLISHED and not assessment.is_trial:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Assessment not available"
            )
    
    return assessment


@router.put("/{assessment_id}", response_model=AssessmentSchema)
def update_assessment(
    assessment_id: int,
    assessment_data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Update an assessment (Recruiter only)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this assessment"
        )
    
    # Update fields
    update_data = assessment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assessment, field, value)
    
    db.commit()
    db.refresh(assessment)
    
    return assessment


@router.post("/{assessment_id}/publish", response_model=AssessmentSchema)
def publish_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Publish an assessment (Recruiter only)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to publish this assessment"
        )
    
    if not assessment.questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish assessment without questions"
        )
    
    assessment.status = AssessmentStatus.PUBLISHED
    assessment.published_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assessment)
    
    return assessment


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Delete an assessment (Recruiter only)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this assessment"
        )
    
    try:
        db.delete(assessment)
        db.commit()
        return {"message": "Assessment deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting assessment {assessment_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assessment: {str(e)}"
        )


@router.post("/{assessment_id}/questions", response_model=QuestionSchema, status_code=status.HTTP_201_CREATED)
def add_question(
    assessment_id: int,
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Add a question to an assessment (Recruiter only)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this assessment"
        )
    
    question = Question(
        assessment_id=assessment_id,
        question_type=question_data.question_type,
        title=question_data.title,
        description=question_data.description,
        points=question_data.points,
        order=question_data.order,
        options=question_data.options,
        correct_answer=question_data.correct_answer,
        codewars_kata_id=question_data.codewars_kata_id,
        test_cases=question_data.test_cases,
        starter_code=question_data.starter_code
    )
    
    db.add(question)
    db.commit()
    db.refresh(question)
    
    return question


@router.get("/{assessment_id}/statistics", response_model=AssessmentStatistics)
def get_assessment_statistics(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Get statistics for an assessment (Recruiter only)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view statistics for this assessment"
        )
    
    # Calculate statistics
    submissions = assessment.submissions
    total_invitations = len(assessment.invitations)
    total_submissions = len(submissions)
    completed_submissions = [s for s in submissions if s.submitted_at is not None]
    
    scores = [s.score for s in completed_submissions if s.score is not None]
    times = [s.time_taken for s in completed_submissions if s.time_taken is not None]
    
    return AssessmentStatistics(
        assessment_id=assessment_id,
        total_invitations=total_invitations,
        total_submissions=total_submissions,
        completed_submissions=len(completed_submissions),
        average_score=sum(scores) / len(scores) if scores else 0.0,
        highest_score=max(scores) if scores else 0.0,
        lowest_score=min(scores) if scores else 0.0,
        average_time_taken=sum(times) / len(times) if times else 0.0,
        question_statistics=[]  # Can be expanded with per-question stats
    )
