from sqlalchemy.orm import Session
from app.models.user import User, UserRole, UserStatus
from app.models.organization import Organization
from app.schemas.team_management import UserApprovalRequest, RoleUpdateRequest
from datetime import datetime
from typing import List, Optional

def get_organization_members(db: Session, organization_id: str) -> List[User]:
    """Get all members of an organization."""
    return db.query(User).filter(User.organization_id == organization_id).all()

def get_pending_members(db: Session, organization_id: str) -> List[User]:
    """Get pending members for an organization."""
    return db.query(User).filter(
        User.organization_id == organization_id,
        User.status == UserStatus.PENDING
    ).all()

def approve_user(db: Session, user_id: str, approver_id: str, role: str = "viewer") -> User:
    """Approve a user and assign role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    if user.status != UserStatus.PENDING:
        raise ValueError("User is not in pending status")
    
    # Validate role
    try:
        user_role = UserRole(role.lower())
    except ValueError:
        raise ValueError(f"Invalid role: {role}")
    
    user.status = UserStatus.APPROVED
    user.role = user_role
    user.approved_by = approver_id
    user.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

def reject_user(db: Session, user_id: str, approver_id: str) -> User:
    """Reject a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    if user.status != UserStatus.PENDING:
        raise ValueError("User is not in pending status")
    
    user.status = UserStatus.REJECTED
    user.approved_by = approver_id
    user.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

def update_user_role(db: Session, user_id: str, new_role: str, updater_id: str) -> User:
    """Update a user's role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    if user.status != UserStatus.APPROVED:
        raise ValueError("User is not approved")
    
    # Prevent admin from changing their own role
    if user_id == updater_id:
        raise ValueError("You cannot change your own role")
    
    # Only admins can change roles
    updater = db.query(User).filter(User.id == updater_id).first()
    if not updater or updater.role != UserRole.ADMIN:
        raise ValueError("Only admins can change user roles")
    
    # Validate role
    try:
        user_role = UserRole(new_role.lower())
    except ValueError:
        raise ValueError(f"Invalid role: {new_role}")
    
    user.role = user_role
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

def revoke_user_access(db: Session, user_id: str, revoker_id: str) -> User:
    """Revoke access for a user (set status to rejected)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    # Prevent admin from revoking their own access
    if user_id == revoker_id:
        raise ValueError("You cannot revoke your own access")
    
    # Only admins can revoke access
    revoker = db.query(User).filter(User.id == revoker_id).first()
    if not revoker or revoker.role != UserRole.ADMIN:
        raise ValueError("Only admins can revoke user access")
    
    # Update user status to rejected
    user.status = UserStatus.REJECTED
    user.approved_by = revoker_id
    user.approved_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

def restore_user_access(db: Session, user_id: str, new_role: str, approver_id: str) -> User:
    """Restore access for a rejected user (set status back to approved)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    if user.status == UserStatus.APPROVED:
        raise ValueError("User already has access")
    
    # Only admins can restore access
    approver = db.query(User).filter(User.id == approver_id).first()
    if not approver or approver.role != UserRole.ADMIN:
        raise ValueError("Only admins can restore user access")
    
    # Validate role
    try:
        user_role = UserRole(new_role.lower())
    except ValueError:
        raise ValueError(f"Invalid role: {new_role}")
    
    # Update user status and role
    user.status = UserStatus.APPROVED
    user.role = user_role
    user.approved_by = approver_id
    user.approved_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

def get_organization_by_id(db: Session, organization_id: str) -> Organization:
    """Get organization by ID."""
    return db.query(Organization).filter(Organization.id == organization_id).first()

def is_user_admin(db: Session, user_id: str, organization_id: str) -> bool:
    """Check if user is admin of the organization."""
    user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == organization_id,
        User.role == UserRole.ADMIN,
        User.status == UserStatus.APPROVED
    ).first()
    return user is not None
