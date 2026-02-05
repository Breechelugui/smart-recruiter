from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from schemas import UserCreate, User
from database import get_db
from models import User as UserModel
from auth import get_current_active_user
import os
import uuid
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    full_name: str = None
    username: str = None

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(UserModel).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role} for u in users]

@router.get("/by-email/{email}")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}

@router.post("/ensure")
def ensure_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == payload.email).first()
    if user:
        return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    # Create user if not exists
    new_user = UserModel(
        email=payload.email,
        full_name=payload.full_name or payload.email.split("@")[0],
        role="interviewee",
        hashed_password="placeholder", # You may want a better default
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email, "full_name": new_user.full_name, "role": new_user.role}

@router.get("/profile")
def get_profile(current_user: UserModel = Depends(get_current_active_user)):
    """Get current user's profile"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "profile_picture": current_user.profile_picture,
        "role": current_user.role
    }

@router.put("/profile")
def update_profile(
    profile_data: ProfileUpdate,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    
    # Update only provided fields
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    
    if profile_data.username is not None:
        # Check if username is already taken
        existing_user = db.query(UserModel).filter(
            UserModel.username == profile_data.username,
            UserModel.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = profile_data.username
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "profile_picture": current_user.profile_picture,
            "role": current_user.role
        }
    }

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload profile picture for current user"""
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update user's profile picture in database
        current_user.profile_picture = f"/uploads/profile_pictures/{unique_filename}"
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Profile picture uploaded successfully",
            "profile_picture_url": current_user.profile_picture
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
