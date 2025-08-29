from sqlalchemy.orm import Session
from app.models.organization_settings import OrganizationSettings
from app.models.organization import Organization
from app.models.service import Service
from app.models.incident import Incident
from app.schemas.organization_settings import OrganizationSettingsCreate, OrganizationSettingsUpdate
import uuid

def get_organization_settings(db: Session, organization_id: str) -> OrganizationSettings:
    """Get organization settings by organization ID."""
    return db.query(OrganizationSettings).filter(
        OrganizationSettings.organization_id == organization_id
    ).first()

def create_organization_settings(
    db: Session, 
    organization_id: str, 
    settings: OrganizationSettingsCreate
) -> OrganizationSettings:
    """Create new organization settings."""
    db_settings = OrganizationSettings(
        id=str(uuid.uuid4()),
        organization_id=organization_id,
        **settings.dict(exclude_unset=True)
    )
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_organization_settings(
    db: Session,
    organization_id: str,
    settings: OrganizationSettingsUpdate
) -> OrganizationSettings:
    """Update organization settings."""
    db_settings = get_organization_settings(db, organization_id)
    if not db_settings:
        return None
    
    update_data = settings.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

def get_public_status_page(db: Session, identifier: str, by_org_id: bool = False):
    """Get public status page data by subdomain, custom domain, or organization ID."""
    
    if by_org_id:
        # Get by organization ID directly
        settings = db.query(OrganizationSettings).filter(
            OrganizationSettings.organization_id == identifier
        ).first()
    else:
        # Get by subdomain or custom domain
        settings = db.query(OrganizationSettings).filter(
            (OrganizationSettings.subdomain == identifier) |
            (OrganizationSettings.custom_domain == identifier)
        ).first()
    
    if not settings:
        return None
    
    # Get organization
    organization = db.query(Organization).filter(
        Organization.id == settings.organization_id
    ).first()
    
    if not organization:
        return None
    
    # Get services for this organization
    services = db.query(Service).filter(
        Service.organization_id == settings.organization_id
    ).all()
    
    # Get recent incidents for this organization
    incidents = db.query(Incident).join(Service).filter(
        Service.organization_id == settings.organization_id
    ).order_by(Incident.created_at.desc()).limit(10).all()
    
    # Format services data
    services_data = [
        {
            "id": service.id,
            "name": service.name,
            "status": service.status,
            "created_at": service.created_at.isoformat(),
            "updated_at": service.updated_at.isoformat()
        }
        for service in services
    ]
    
    # Format incidents data
    incidents_data = [
        {
            "id": incident.id,
            "title": incident.title,
            "message": incident.message,
            "status": incident.status,
            "service_id": incident.service_id,
            "created_at": incident.created_at.isoformat(),
            "updated_at": incident.updated_at.isoformat()
        }
        for incident in incidents
    ]
    
    return {
        "page_title": settings.page_title,
        "page_description": settings.page_description,
        "logo_url": settings.logo_url,
        "primary_color": settings.primary_color,
        "background_color": settings.background_color,
        "custom_css": settings.custom_css,
        "show_incident_history": settings.show_incident_history,
        "show_uptime_stats": settings.show_uptime_stats,
        "maintenance_mode": settings.maintenance_mode,
        "maintenance_message": settings.maintenance_message,
        "contact_email": settings.contact_email,
        "support_url": settings.support_url,
        "services": services_data,
        "incidents": incidents_data,
        "organization_name": organization.name
    }
