from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentStatusUpdate, IncidentResponse
from app.services.incident_management import (
    get_incidents_by_organization,
    get_incidents_by_service,
    get_incident_by_id,
    create_incident,
    update_incident,
    update_incident_status,
    delete_incident,
    get_active_incidents_by_organization,
    get_incident_statistics
)

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

@router.get("/incidents", response_model=List[IncidentResponse])
def get_organization_incidents(
    service_id: Optional[str] = Query(None, description="Filter by service ID"),
    active_only: bool = Query(False, description="Show only active incidents"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get incidents for the current user's organization."""
    if service_id:
        incidents = get_incidents_by_service(db, service_id, current_user.organization_id)
    elif active_only:
        incidents = get_active_incidents_by_organization(db, current_user.organization_id)
    else:
        incidents = get_incidents_by_organization(db, current_user.organization_id)
    
    # Enrich with service and creator info
    enriched_incidents = []
    for incident in incidents:
        incident_dict = {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status.value,
            "impact": incident.impact.value,
            "service_id": incident.service_id,
            "created_by": incident.created_by,
            "resolved_at": incident.resolved_at,
            "created_at": incident.created_at,
            "updated_at": incident.updated_at,
            "service_name": incident.service.name if incident.service else None,
            "creator_email": incident.creator.email if incident.creator else None
        }
        enriched_incidents.append(incident_dict)
    
    return enriched_incidents

@router.post("/incidents", response_model=IncidentResponse)
def create_organization_incident(
    incident_data: IncidentCreate,
    current_user: User = Depends(require_admin_or_editor),
    db: Session = Depends(get_db)
):
    """Create a new incident (admin or editor only)."""
    incident = create_incident(db, incident_data, current_user.id, current_user.organization_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service not found or does not belong to your organization"
        )
    
    # Return enriched response
    return {
        "id": incident.id,
        "title": incident.title,
        "description": incident.description,
        "status": incident.status.value,
        "impact": incident.impact.value,
        "service_id": incident.service_id,
        "created_by": incident.created_by,
        "resolved_at": incident.resolved_at,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
        "service_name": incident.service.name if incident.service else None,
        "creator_email": current_user.email
    }

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific incident by ID."""
    incident = get_incident_by_id(db, incident_id, current_user.organization_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    return {
        "id": incident.id,
        "title": incident.title,
        "description": incident.description,
        "status": incident.status.value,
        "impact": incident.impact.value,
        "service_id": incident.service_id,
        "created_by": incident.created_by,
        "resolved_at": incident.resolved_at,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
        "service_name": incident.service.name if incident.service else None,
        "creator_email": incident.creator.email if incident.creator else None
    }

@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
def update_organization_incident(
    incident_id: str,
    incident_data: IncidentUpdate,
    current_user: User = Depends(require_admin_or_editor),
    db: Session = Depends(get_db)
):
    """Update an incident (admin or editor only)."""
    incident = update_incident(db, incident_id, incident_data, current_user.organization_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    return {
        "id": incident.id,
        "title": incident.title,
        "description": incident.description,
        "status": incident.status.value,
        "impact": incident.impact.value,
        "service_id": incident.service_id,
        "created_by": incident.created_by,
        "resolved_at": incident.resolved_at,
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
        "service_name": incident.service.name if incident.service else None,
        "creator_email": incident.creator.email if incident.creator else None
    }

@router.patch("/incidents/{incident_id}/status")
def update_incident_status_endpoint(
    incident_id: str,
    status_data: IncidentStatusUpdate,
    current_user: User = Depends(require_admin_or_editor),
    db: Session = Depends(get_db)
):
    """Update incident status with optional message (admin or editor only)."""
    incident = update_incident_status(db, incident_id, status_data, current_user.organization_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    return {
        "message": f"Incident status updated to {status_data.status.value}",
        "incident": {
            "id": incident.id,
            "title": incident.title,
            "status": incident.status.value,
            "updated_at": incident.updated_at,
            "resolved_at": incident.resolved_at
        }
    }

@router.delete("/incidents/{incident_id}")
def delete_organization_incident(
    incident_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete an incident (admin only)."""
    success = delete_incident(db, incident_id, current_user.organization_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    return {"message": "Incident deleted successfully"}

@router.get("/incidents-stats")
def get_incident_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get incident statistics for the organization."""
    stats = get_incident_statistics(db, current_user.organization_id)
    return stats
