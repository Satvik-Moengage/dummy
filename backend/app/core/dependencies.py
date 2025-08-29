from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.core.auth import verify_token
from app.services.auth import get_user_by_email
from app.models.user import User, UserStatus

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    username = verify_token(token)
    if username is None:
        raise credentials_exception
    
    user = get_user_by_email(db, email=username)
    if user is None:
        raise credentials_exception
    
    # Check if user status allows access
    if user.status == UserStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please wait for an administrator to approve your access.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif user.status == UserStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access has been revoked. Please contact an administrator for assistance.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif user.status != UserStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account access not permitted. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user
