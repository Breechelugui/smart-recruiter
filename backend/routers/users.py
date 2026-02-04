from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate, User
from database import get_db
from models import User as UserModel

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
