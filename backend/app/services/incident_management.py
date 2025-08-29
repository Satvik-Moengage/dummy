from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentStatus, IncidentImpact
from app.models.service import Service
from app.models.user import User
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentStatusUpdate
from app.services.dynamic_status import update_service_status_from_incidents
from typing import List, Optional
from datetime import datetime

def get_incidents_by_organization(db: Session, organization_id: str) -> List[Incident]:
    """Get all incidents for an organization."""
    return db.query(Incident).join(Service).filter(
        Service.organization_id == organization_id
    ).order_by(Incident.created_at.desc()).all()

def get_incidents_by_service(db: Session, service_id: str, organization_id: str) -> List[Incident]:
    """Get all incidents for a specific service."""
    return db.query(Incident).join(Service).filter(
        Incident.service_id == service_id,
        Service.organization_id == organization_id
    ).order_by(Incident.created_at.desc()).all()

def get_incident_by_id(db: Session, incident_id: str, organization_id: str) -> Optional[Incident]:
    """Get a specific incident by ID within an organization."""
    return db.query(Incident).join(Service).filter(
        Incident.id == incident_id,
        Service.organization_id == organization_id
    ).first()

def create_incident(db: Session, incident_data: IncidentCreate, user_id: str, organization_id: str) -> Optional[Incident]:
    """Create a new incident for a service."""
    # Verify the service belongs to the organization
    service = db.query(Service).filter(
        Service.id == incident_data.service_id,
        Service.organization_id == organization_id
    ).first()
    
    if not service:
        return None
    
    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        impact=IncidentImpact(incident_data.impact),
        service_id=incident_data.service_id,
        created_by=user_id,
        status=IncidentStatus.INVESTIGATING
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Update service status based on the new incident
    update_service_status_from_incidents(db, incident_data.service_id)
    
    return incident
    db.refresh(incident)
    return incident

def update_incident(db: Session, incident_id: str, incident_data: IncidentUpdate, organization_id: str) -> Optional[Incident]:
    """Update an existing incident."""
    incident = get_incident_by_id(db, incident_id, organization_id)
    if not incident:
        return None
    
    # Track if impact level changed to update service status
    old_impact = incident.impact
    
    update_data = incident_data.dict(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            if field == "status" and value:
                # Convert schema status to model status
                from app.models.incident import IncidentStatus as ModelIncidentStatus
                setattr(incident, field, ModelIncidentStatus(value.value))
            elif field == "impact" and value:
                setattr(incident, field, IncidentImpact(value.value))
            else:
                setattr(incident, field, value)
        incident.updated_at = datetime.utcnow()
        
        # Handle resolved_at for status changes
        if "status" in update_data and update_data["status"]:
            if update_data["status"].value == "resolved":
                incident.resolved_at = datetime.utcnow()
            elif incident.resolved_at:
                incident.resolved_at = None
        
        db.commit()
        db.refresh(incident)
        
        # Update service status if impact changed or status changed
        if old_impact != incident.impact or "status" in update_data:
            update_service_status_from_incidents(db, incident.service_id)
    
    return incident

def update_incident_status(db: Session, incident_id: str, status_data: IncidentStatusUpdate, organization_id: str) -> Optional[Incident]:
    """Update incident status with optional message."""
    incident = get_incident_by_id(db, incident_id, organization_id)
    if not incident:
        return None
    
    # Convert schema status to model status
    from app.models.incident import IncidentStatus as ModelIncidentStatus
    incident.status = ModelIncidentStatus(status_data.status.value)
    incident.updated_at = datetime.utcnow()
    
    # If status is resolved, set resolved_at
    if status_data.status.value == "resolved":
        incident.resolved_at = datetime.utcnow()
    elif incident.resolved_at:  # If changing from resolved to something else
        incident.resolved_at = None
    
    # If there's an update message, append it to description
    if status_data.update_message:
        current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        update_text = f"\n\n**Update ({current_time}):** {status_data.update_message}"
        incident.description += update_text
    
    db.commit()
    db.refresh(incident)
    
    # Update service status based on the incident change
    update_service_status_from_incidents(db, incident.service_id)
    
    return incident

def delete_incident(db: Session, incident_id: str, organization_id: str) -> bool:
    """Delete an incident."""
    incident = get_incident_by_id(db, incident_id, organization_id)
    if not incident:
        return False
    
    service_id = incident.service_id
    db.delete(incident)
    db.commit()
    
    # Update service status after incident deletion
    update_service_status_from_incidents(db, service_id)
    
    return True

def get_active_incidents_by_organization(db: Session, organization_id: str) -> List[Incident]:
    """Get all active (non-resolved) incidents for an organization."""
    return db.query(Incident).join(Service).filter(
        Service.organization_id == organization_id,
        Incident.status != IncidentStatus.RESOLVED
    ).order_by(Incident.created_at.desc()).all()

def get_incident_statistics(db: Session, organization_id: str) -> dict:
    """Get incident statistics for an organization."""
    total_incidents = db.query(Incident).join(Service).filter(
        Service.organization_id == organization_id
    ).count()
    
    active_incidents = db.query(Incident).join(Service).filter(
        Service.organization_id == organization_id,
        Incident.status != IncidentStatus.RESOLVED
    ).count()
    
    resolved_incidents = total_incidents - active_incidents
    
    # Get incidents by impact
    critical_incidents = db.query(Incident).join(Service).filter(
        Service.organization_id == organization_id,
        Incident.impact == IncidentImpact.CRITICAL,
        Incident.status != IncidentStatus.RESOLVED
    ).count()
    
    return {
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "resolved_incidents": resolved_incidents,
        "critical_active": critical_incidents
    }
