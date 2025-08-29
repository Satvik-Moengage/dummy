from sqlalchemy.orm import Session
from app.models.organization import Organization, OrganizationStatus
from app.models.service import Service, ServiceStatus
from app.models.incident import Incident, IncidentImpact
from app.services.dynamic_status import get_organization_overall_status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

def get_organization_status_page(db: Session, org_identifier: str) -> Optional[dict]:
    """
    Get public status page data for an organization.
    org_identifier can be either organization ID or name.
    """
    # Try to find organization by ID first, then by name
    organization = db.query(Organization).filter(
        (Organization.id == org_identifier) | 
        (Organization.name == org_identifier)
    ).first()
    
    if not organization:
        return None
    
    # Get all services for this organization
    services = db.query(Service).filter(Service.organization_id == organization.id).all()
    
    # Get recent incidents (last 30 days) through services
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_incidents = db.query(Incident).join(Service).filter(
        Service.organization_id == organization.id,
        Incident.created_at >= thirty_days_ago
    ).order_by(Incident.created_at.desc()).all()
    
    # Calculate overall status using dynamic status service
    overall_status = get_organization_overall_status(db, organization.id)
    
    # Format services data
    services_data = []
    for service in services:
        services_data.append({
            "id": service.id,
            "name": service.name,
            "description": service.description or "",
            "status": service.status.value if hasattr(service.status, 'value') else service.status,
            "uptime_percentage": service.uptime_percentage or 99.9
        })
    
    # Format incidents data
    incidents_data = []
    for incident in recent_incidents:
        incidents_data.append({
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "status": incident.status.value,
            "impact": incident.impact.value,
            "created_at": incident.created_at.isoformat(),
            "updated_at": incident.updated_at.isoformat(),
            "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None
        })
    
    return {
        "organization": {
            "id": organization.id,
            "name": organization.name,
            "description": organization.description,
            "website": organization.website
        },
        "overall_status": overall_status,
        "services": services_data,
        "incidents": incidents_data,
        "last_updated": datetime.utcnow().isoformat()
    }

def get_all_organizations_list(db: Session) -> List[dict]:
    """Get a list of all organizations with basic info for directory."""
    organizations = db.query(Organization).filter(
        Organization.status.in_([OrganizationStatus.ACTIVE, OrganizationStatus.TRIAL])
    ).all()
    
    org_list = []
    for org in organizations:
        # Get service count and overall status using dynamic status service
        services = db.query(Service).filter(Service.organization_id == org.id).all()
        overall_status = get_organization_overall_status(db, org.id)
        
        org_list.append({
            "id": org.id,
            "name": org.name,
            "description": org.description,
            "website": org.website,
            "status": overall_status,
            "service_count": len(services)
        })
    
    return org_list

def get_organization_incident_timeline(db: Session, org_identifier: str, days: int = 30) -> Optional[Dict[str, Any]]:
    """
    Get incident timeline data for visualization/graphing.
    Returns data structure optimized for timeline charts with color coding.
    """
    # Try to find organization by ID first, then by name
    organization = db.query(Organization).filter(
        (Organization.id == org_identifier) | 
        (Organization.name == org_identifier)
    ).first()
    
    if not organization:
        return None
    
    # Get all services for this organization
    services = db.query(Service).filter(Service.organization_id == organization.id).all()
    
    # Get incidents for the specified time period
    start_date = datetime.utcnow() - timedelta(days=days)
    incidents = db.query(Incident).join(Service).filter(
        Service.organization_id == organization.id,
        Incident.created_at >= start_date
    ).order_by(Incident.created_at.asc()).all()
    
    # Define impact color mapping for visualization
    impact_colors = {
        IncidentImpact.CRITICAL: "#dc2626",    # Red
        IncidentImpact.HIGH: "#ea580c",        # Orange
        IncidentImpact.MEDIUM: "#ca8a04",      # Yellow
        IncidentImpact.LOW: "#16a34a"          # Green
    }
    
    # Create service timeline data
    services_timeline = []
    for service in services:
        service_incidents = [inc for inc in incidents if inc.service_id == service.id]
        
        # Create incident blocks for this service
        incident_blocks = []
        for incident in service_incidents:
            end_time = incident.resolved_at or datetime.utcnow()
            duration_hours = (end_time - incident.created_at).total_seconds() / 3600
            
            incident_blocks.append({
                "id": incident.id,
                "title": incident.title,
                "description": incident.description,
                "impact": incident.impact.value,
                "status": incident.status.value,
                "color": impact_colors.get(incident.impact, "#6b7280"),  # Default gray
                "start_time": incident.created_at.isoformat(),
                "end_time": end_time.isoformat(),
                "duration_hours": round(duration_hours, 2),
                "is_ongoing": incident.resolved_at is None
            })
        
        services_timeline.append({
            "service": {
                "id": service.id,
                "name": service.name,
                "description": service.description,
                "current_status": service.status.value if hasattr(service.status, 'value') else service.status
            },
            "incidents": incident_blocks,
            "incident_count": len(incident_blocks)
        })
    
    # Calculate summary statistics
    total_incidents = len(incidents)
    critical_incidents = sum(1 for inc in incidents if inc.impact == IncidentImpact.CRITICAL)
    high_incidents = sum(1 for inc in incidents if inc.impact == IncidentImpact.HIGH)
    ongoing_incidents = sum(1 for inc in incidents if inc.resolved_at is None)
    
    # Calculate average resolution time for resolved incidents
    resolved_incidents = [inc for inc in incidents if inc.resolved_at is not None]
    avg_resolution_hours = 0
    if resolved_incidents:
        total_resolution_time = sum(
            (inc.resolved_at - inc.created_at).total_seconds() / 3600 
            for inc in resolved_incidents
        )
        avg_resolution_hours = round(total_resolution_time / len(resolved_incidents), 2)
    
    return {
        "organization": {
            "id": organization.id,
            "name": organization.name
        },
        "timeline_period": {
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat(),
            "days": days
        },
        "services": services_timeline,
        "summary": {
            "total_incidents": total_incidents,
            "critical_incidents": critical_incidents,
            "high_incidents": high_incidents,
            "ongoing_incidents": ongoing_incidents,
            "average_resolution_hours": avg_resolution_hours
        },
        "impact_legend": {
            "critical": {"color": impact_colors[IncidentImpact.CRITICAL], "label": "Critical"},
            "high": {"color": impact_colors[IncidentImpact.HIGH], "label": "High"},
            "medium": {"color": impact_colors[IncidentImpact.MEDIUM], "label": "Medium"},
            "low": {"color": impact_colors[IncidentImpact.LOW], "label": "Low"}
        },
        "generated_at": datetime.utcnow().isoformat()
    }
