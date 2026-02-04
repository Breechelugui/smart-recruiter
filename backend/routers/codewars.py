from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from models import User, UserRole
from auth import require_role
from services.codewars_service import codewars_service

router = APIRouter(prefix="/api/codewars", tags=["Codewars"])


@router.get("/katas/search", response_model=List[Dict])
def search_katas(
    query: str = "",
    difficulty: str = None,
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Search for Codewars katas (Recruiter only)"""
    try:
        katas = codewars_service.search_katas(query, difficulty)
        return [codewars_service.format_kata_for_question(kata) for kata in katas]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching katas: {str(e)}"
        )


@router.get("/katas/{kata_id}", response_model=Dict)
def get_kata(
    kata_id: str,
    current_user: User = Depends(require_role(UserRole.RECRUITER))
):
    """Get a specific Codewars kata by ID (Recruiter only)"""
    kata = codewars_service.get_kata_by_id(kata_id)
    
    if not kata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kata not found"
        )
    
    return codewars_service.format_kata_for_question(kata)
