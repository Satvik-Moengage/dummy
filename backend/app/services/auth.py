from sqlalchemy.orm import Session
from app.models.user import User, UserRole, UserStatus
from app.models.organization import Organization
from app.models.organization_settings import OrganizationSettings
from app.schemas.auth import UserCreate
from app.core.auth import get_password_hash, verify_password
import uuid

def get_user_by_email(db: Session, email: str) -> User:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user with organization validation."""
    # Validate organization exists
    organization = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not organization:
        raise ValueError("Invalid organization ID")
    
    # Check if user email already exists
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("Email already registered")
    
    # Create user with pending status
    hashed_password = get_password_hash(user.password)
    db_user = User(
        id=str(uuid.uuid4()),
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        hashed_password=hashed_password,
        role=UserRole.VIEWER,  # Default role
        status=UserStatus.PENDING,  # Requires admin approval
        organization_id=user.organization_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> tuple[User, str]:
    """
    Authenticate a user and return user object with status message.
    Returns tuple of (user, status_message) where status_message indicates login result.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None, "Invalid email or password"
    
    if not verify_password(password, user.hashed_password):
        return None, "Invalid email or password"
    
    # Check user status
    if user.status == UserStatus.PENDING:
        return user, "pending_approval"
    elif user.status == UserStatus.REJECTED:
        return user, "access_denied"
    elif user.status == UserStatus.APPROVED:
        return user, "success"
    
    return None, "Invalid account status"
