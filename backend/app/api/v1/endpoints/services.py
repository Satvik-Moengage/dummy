from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.service import ServiceStatus
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.services.service_management import (
    get_services_by_organization,
    get_service_by_id,
    create_service,
    update_service,
    delete_service,
    update_service_status,
    is_user_admin_of_organization
)
from app.services.dynamic_status import update_all_services_status_for_organization

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_admin_or_editor(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is an admin or editor."""
    if current_user.role not in [UserRole.ADMIN, UserRole.EDITOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor access required"
        )
    return current_user

@router.get("/debug/current-user")
def debug_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Debug endpoint to check current user info."""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value if current_user.role else None,
        "status": current_user.status.value if current_user.status else None,
        "organization_id": current_user.organization_id
    }

@router.get("/services", response_model=List[ServiceResponse])
def get_organization_services(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all services for the current user's organization."""
    services = get_services_by_organization(db, current_user.organization_id)
    return services

@router.post("/services", response_model=ServiceResponse)
def create_organization_service(
    service_data: ServiceCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new service (admin only)."""
    try:
        service = create_service(db, service_data, current_user.organization_id)
        return service
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create service: {str(e)}"
        )

@router.get("/services/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific service by ID."""
    service = get_service_by_id(db, service_id, current_user.organization_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_organization_service(
    service_id: str,
    service_data: ServiceUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a service (admin only)."""
    service = update_service(db, service_id, service_data, current_user.organization_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service

@router.patch("/services/{service_id}/status")
def update_service_status_endpoint(
    service_id: str,
    status: ServiceStatus,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update service status (admin only)."""
    service = update_service_status(db, service_id, status, current_user.organization_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return {"message": f"Service status updated to {status.value}", "service": service}

@router.delete("/services/{service_id}")
def delete_organization_service(
    service_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a service (admin only)."""
    success = delete_service(db, service_id, current_user.organization_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return {"message": "Service deleted successfully"}

@router.post("/services/refresh-status")
def refresh_all_services_status(
    current_user: User = Depends(require_admin_or_editor),
    db: Session = Depends(get_db)
):
    """Refresh all services status based on active incidents (admin or editor only)."""
    updated_count = update_all_services_status_for_organization(db, current_user.organization_id)
    return {
        "message": f"Updated status for {updated_count} services based on active incidents",
        "services_updated": updated_count
    }
