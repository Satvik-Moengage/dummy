from sqlalchemy.orm import Session
from app.models.service import Service, ServiceStatus
from app.models.incident import Incident, IncidentStatus, IncidentImpact
from typing import Optional
from datetime import datetime

def calculate_service_status_from_incidents(db: Session, service_id: str) -> ServiceStatus:
    """
    Calculate the appropriate service status based on active incidents.
    Returns the most severe status based on active incidents affecting the service.
    """
    # Get all active incidents for this service (not resolved)
    active_incidents = db.query(Incident).filter(
        Incident.service_id == service_id,
        Incident.status != IncidentStatus.RESOLVED
    ).all()
    
    if not active_incidents:
        # No active incidents - service should be operational
        return ServiceStatus.OPERATIONAL
    
    # Determine the most severe impact level from active incidents
    impact_levels = [incident.impact for incident in active_incidents]
    
    # Map incident impact to service status
    if IncidentImpact.CRITICAL in impact_levels:
        return ServiceStatus.MAJOR_OUTAGE
    elif IncidentImpact.HIGH in impact_levels:
        return ServiceStatus.PARTIAL_OUTAGE
    elif IncidentImpact.MEDIUM in impact_levels:
        return ServiceStatus.DEGRADED
    else:  # IncidentImpact.LOW
        return ServiceStatus.DEGRADED
    
def update_service_status_from_incidents(db: Session, service_id: str) -> Optional[Service]:
    """
    Update a service's status based on its active incidents.
    This should be called whenever incidents are created, updated, or resolved.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        return None
    
    # Calculate new status based on incidents
    new_status = calculate_service_status_from_incidents(db, service_id)
    
    # Only update if status has changed
    if service.status != new_status:
        service.status = new_status
        service.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(service)
    
    return service

def update_all_services_status_for_organization(db: Session, organization_id: str) -> int:
    """
    Update all services' status for an organization based on their incidents.
    Returns the number of services updated.
    """
    services = db.query(Service).filter(Service.organization_id == organization_id).all()
    updated_count = 0
    
    for service in services:
        old_status = service.status
        updated_service = update_service_status_from_incidents(db, service.id)
        if updated_service and updated_service.status != old_status:
            updated_count += 1
    
    return updated_count

def get_organization_overall_status(db: Session, organization_id: str) -> str:
    """
    Calculate the overall organization status based on all services.
    This provides a quick summary status for the organization.
    """
    services = db.query(Service).filter(Service.organization_id == organization_id).all()
    
    if not services:
        return "operational"
    
    # Check for the most severe status across all services
    service_statuses = [service.status for service in services]
    
    if ServiceStatus.MAJOR_OUTAGE in service_statuses:
        return "major_outage"
    elif ServiceStatus.PARTIAL_OUTAGE in service_statuses:
        return "partial_outage"
    elif ServiceStatus.DEGRADED in service_statuses:
        return "degraded"
    elif ServiceStatus.MAINTENANCE in service_statuses:
        return "maintenance"
    else:
        return "operational"
