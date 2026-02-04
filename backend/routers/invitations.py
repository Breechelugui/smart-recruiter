from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import User, Invitation, Assessment, InvitationStatus, UserRole, Notification
from schemas import (
    InvitationCreate, BulkInvitationCreate, Invitation as InvitationSchema,
    InvitationWithDetails
)
from auth import get_current_active_user, require_role
from services.email_service import email_service

router = APIRouter(prefix="/api/invitations", tags=["Invitations"])


@router.post("", response_model=InvitationSchema, status_code=status.HTTP_201_CREATED)
def create_invitation(
    invitation_data: InvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Create a single invitation (Recruiter only)"""
    # Verify assessment exists and belongs to recruiter
    assessment = db.query(Assessment).filter(Assessment.id == invitation_data.assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send invitations for this assessment"
        )
    
    # Verify interviewee exists
    interviewee = db.query(User).filter(User.id == invitation_data.interviewee_id).first()
    if not interviewee or interviewee.role != UserRole.INTERVIEWEE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interviewee not found"
        )
    
    # Check if invitation already exists
    existing = db.query(Invitation).filter(
        Invitation.assessment_id == invitation_data.assessment_id,
        Invitation.interviewee_id == invitation_data.interviewee_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already exists for this interviewee"
        )
    
    # Create invitation
    invitation = Invitation(
        assessment_id=invitation_data.assessment_id,
        interviewee_id=invitation_data.interviewee_id,
        scheduled_start=invitation_data.scheduled_start,
        scheduled_end=invitation_data.scheduled_end
    )
    
    db.add(invitation)
    
    # Create notification
    notification = Notification(
        user_id=invitation_data.interviewee_id,
        title="New Assessment Invitation",
        message=f"You have been invited to take the assessment: {assessment.title}",
        notification_type="invitation",
        related_id=invitation_data.assessment_id
    )
    db.add(notification)
    
    db.commit()
    db.refresh(invitation)
    
    # Send email notification
    try:
        scheduled_start_str = invitation.scheduled_start.strftime('%Y-%m-%d %H:%M') if invitation.scheduled_start else None
        email_service.send_invitation_email(
            interviewee.email,
            assessment.title,
            scheduled_start_str
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return invitation


@router.post("/bulk", response_model=List[InvitationSchema], status_code=status.HTTP_201_CREATED)
def create_bulk_invitations(
    invitation_data: BulkInvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Create multiple invitations at once (Recruiter only)"""
    # Verify assessment
    assessment = db.query(Assessment).filter(Assessment.id == invitation_data.assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    if assessment.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send invitations for this assessment"
        )
    
    invitations = []
    for interviewee_id in invitation_data.interviewee_ids:
        # Check if interviewee exists
        interviewee = db.query(User).filter(User.id == interviewee_id).first()
        if not interviewee or interviewee.role != UserRole.INTERVIEWEE:
            continue
        
        # Check if invitation already exists
        existing = db.query(Invitation).filter(
            Invitation.assessment_id == invitation_data.assessment_id,
            Invitation.interviewee_id == interviewee_id
        ).first()
        
        if existing:
            continue
        
        # Create invitation
        invitation = Invitation(
            assessment_id=invitation_data.assessment_id,
            interviewee_id=interviewee_id,
            scheduled_start=invitation_data.scheduled_start,
            scheduled_end=invitation_data.scheduled_end
        )
        db.add(invitation)
        invitations.append(invitation)
        
        # Create notification
        notification = Notification(
            user_id=interviewee_id,
            title="New Assessment Invitation",
            message=f"You have been invited to take the assessment: {assessment.title}",
            notification_type="invitation",
            related_id=invitation_data.assessment_id
        )
        db.add(notification)
    
    db.commit()
    
    # Refresh all invitations
    for invitation in invitations:
        db.refresh(invitation)
    
    return invitations


@router.get("", response_model=List[InvitationWithDetails])
def get_invitations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get invitations based on user role"""
    if current_user.role == UserRole.RECRUITER:
        # Get invitations for assessments created by this recruiter
        invitations = db.query(Invitation).join(Assessment).filter(
            Assessment.creator_id == current_user.id
        ).offset(skip).limit(limit).all()
    else:
        # Get invitations for this interviewee
        invitations = db.query(Invitation).filter(
            Invitation.interviewee_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return invitations


@router.get("/{invitation_id}", response_model=InvitationWithDetails)
def get_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific invitation"""
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.RECRUITER:
        if invitation.assessment.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this invitation"
            )
    else:
        if invitation.interviewee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this invitation"
            )
    
    return invitation


@router.post("/{invitation_id}/accept", response_model=InvitationSchema)
def accept_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INTERVIEWEE))
):
    """Accept an invitation (Interviewee only)"""
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    if invitation.interviewee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to accept this invitation"
        )
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been responded to"
        )
    
    invitation.status = InvitationStatus.ACCEPTED
    invitation.responded_at = datetime.utcnow()
    
    db.commit()
    db.refresh(invitation)
    
    return invitation


@router.post("/{invitation_id}/decline", response_model=InvitationSchema)
def decline_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INTERVIEWEE))
):
    """Decline an invitation (Interviewee only)"""
    invitation = db.query(Invitation).filter(Invitation.id == invitation_id).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    if invitation.interviewee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to decline this invitation"
        )
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been responded to"
        )
    
    invitation.status = InvitationStatus.DECLINED
    invitation.responded_at = datetime.utcnow()
    
    db.commit()
    db.refresh(invitation)
    
    return invitation
