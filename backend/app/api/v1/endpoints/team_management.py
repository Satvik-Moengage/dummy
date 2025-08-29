from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.team_management import (
    TeamMembersListResponse,
    TeamMemberResponse,
    UserApprovalRequest,
    UserApprovalResponse,
    OrganizationLookupResponse,
    RoleUpdateRequest
)
from app.services.team_management import (
    get_organization_members,
    get_pending_members,
    approve_user,
    reject_user,
    update_user_role,
    revoke_user_access,
    restore_user_access,
    get_organization_by_id,
    is_user_admin
)
from typing import List

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/members", response_model=TeamMembersListResponse)
def get_team_members(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all team members for the admin's organization."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    members = get_organization_members(db, current_user.organization_id)
    
    # Count by status
    pending_count = sum(1 for m in members if m.status.value == "pending")
    approved_count = sum(1 for m in members if m.status.value == "approved")
    rejected_count = sum(1 for m in members if m.status.value == "rejected")
    
    team_members = []
    for member in members:
        team_members.append(TeamMemberResponse(
            id=member.id,
            first_name=member.first_name,
            last_name=member.last_name,
            email=member.email,
            role=member.role.value,
            status=member.status.value,
            created_at=member.created_at.isoformat(),
            approved_at=member.approved_at.isoformat() if member.approved_at else None,
            approved_by=member.approved_by
        ))
    
    return TeamMembersListResponse(
        total=len(members),
        pending=pending_count,
        approved=approved_count,
        rejected=rejected_count,
        members=team_members
    )

@router.post("/approve-user", response_model=UserApprovalResponse)
def approve_team_member(
    approval_request: UserApprovalRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve or reject a team member."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    try:
        if approval_request.action == "approve":
            user = approve_user(
                db, 
                approval_request.user_id, 
                current_user.id,
                approval_request.role or "viewer"
            )
            message = f"User {user.email} has been approved"
        elif approval_request.action == "reject":
            user = reject_user(db, approval_request.user_id, current_user.id)
            message = f"User {user.email} has been rejected"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action. Use 'approve' or 'reject'"
            )
        
        # Verify user belongs to same organization
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot manage users from other organizations"
            )
        
        team_member = TeamMemberResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=user.role.value,
            status=user.status.value,
            created_at=user.created_at.isoformat(),
            approved_at=user.approved_at.isoformat() if user.approved_at else None,
            approved_by=user.approved_by
        )
        
        return UserApprovalResponse(
            success=True,
            message=message,
            user=team_member
        )
        
    except ValueError as e:
        return UserApprovalResponse(
            success=False,
            message=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process approval: {str(e)}"
        )

@router.put("/update-role", response_model=UserApprovalResponse)
def update_member_role(
    role_request: RoleUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a team member's role."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    try:
        user = update_user_role(
            db,
            role_request.user_id,
            role_request.new_role,
            current_user.id
        )
        
        # Verify user belongs to same organization
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot manage users from other organizations"
            )
        
        team_member = TeamMemberResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=user.role.value,
            status=user.status.value,
            created_at=user.created_at.isoformat(),
            approved_at=user.approved_at.isoformat() if user.approved_at else None,
            approved_by=user.approved_by
        )
        
        return UserApprovalResponse(
            success=True,
            message=f"User role updated to {role_request.new_role}",
            user=team_member
        )
        
    except ValueError as e:
        return UserApprovalResponse(
            success=False,
            message=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update role: {str(e)}"
        )

@router.post("/restore-access", response_model=UserApprovalResponse)
def restore_user_access_endpoint(
    approval_request: UserApprovalRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Restore access for a rejected user (admin only)."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    try:
        user = restore_user_access(
            db, 
            approval_request.user_id, 
            approval_request.role or "viewer",
            current_user.id
        )
        
        # Verify user belongs to same organization
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot manage users from other organizations"
            )
        
        team_member = TeamMemberResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=user.role.value,
            status=user.status.value,
            created_at=user.created_at.isoformat(),
            approved_at=user.approved_at.isoformat() if user.approved_at else None,
            approved_by=user.approved_by
        )
        
        return UserApprovalResponse(
            success=True,
            message=f"Access restored for {user.email} as {approval_request.role or 'viewer'}",
            user=team_member
        )
        
    except ValueError as e:
        return UserApprovalResponse(
            success=False,
            message=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to restore access: {str(e)}"
        )

@router.delete("/revoke-access", response_model=UserApprovalResponse)
def revoke_user_access_endpoint(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Revoke access for a user (admin only)."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    try:
        user = revoke_user_access(db, user_id, current_user.id)
        
        # Verify user belongs to same organization
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot manage users from other organizations"
            )
        
        team_member = TeamMemberResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=user.role.value,
            status=user.status.value,
            created_at=user.created_at.isoformat(),
            approved_at=user.approved_at.isoformat() if user.approved_at else None,
            approved_by=user.approved_by
        )
        
        return UserApprovalResponse(
            success=True,
            message=f"Access revoked for {user.email}",
            user=team_member
        )
        
    except ValueError as e:
        return UserApprovalResponse(
            success=False,
            message=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke access: {str(e)}"
        )

@router.get("/organization/{organization_id}", response_model=OrganizationLookupResponse)
def lookup_organization(
    organization_id: str,
    db: Session = Depends(get_db)
):
    """Public endpoint to lookup organization details for registration."""
    organization = get_organization_by_id(db, organization_id)
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return OrganizationLookupResponse(
        id=organization.id,
        name=organization.name,
        description=organization.description
    )
