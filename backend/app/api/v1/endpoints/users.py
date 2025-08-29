from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import User, UserCreate
from app.services.user_service import create_user
from app.db.session.database import get_db

router = APIRouter()

@router.post("/", response_model=User)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db=db, user=user)
    if db_user is None:
        raise HTTPException(status_code=400, detail="Email already registered")
    return db_user
