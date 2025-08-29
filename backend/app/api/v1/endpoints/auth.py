from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.services.auth import create_user, authenticate_user, get_user_by_email
from app.core.auth import create_access_token
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create user
    new_user = create_user(db=db, user=user)
    return UserResponse(
        id=new_user.id,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        email=new_user.email,
        role=new_user.role.value,
        status=new_user.status.value,
        organization_id=new_user.organization_id,
        created_at=new_user.created_at.isoformat()
    )

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token."""
    # Authenticate user
    authenticated_user, status_message = authenticate_user(db, user.email, user.password)
    
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Handle different status cases
    if status_message == "pending_approval":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please wait for an administrator to approve your access.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif status_message == "access_denied":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access has been revoked. Please contact an administrator for assistance.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif status_message != "success":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account access not permitted. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token only for approved users
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": authenticated_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """OAuth2 compatible token login."""
    authenticated_user, status_message = authenticate_user(db, form_data.username, form_data.password)
    
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Handle different status cases
    if status_message == "pending_approval":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please wait for an administrator to approve your access.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif status_message == "access_denied":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access has been revoked. Please contact an administrator for assistance.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif status_message != "success":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account access not permitted. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token only for approved users
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": authenticated_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return UserResponse(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        role=current_user.role.value,
        status=current_user.status.value,
        organization_id=current_user.organization_id,
        created_at=current_user.created_at.isoformat()
    )
