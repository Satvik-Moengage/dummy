from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.schemas.organization_settings import (
    OrganizationSettingsCreate,
    OrganizationSettingsUpdate,
    OrganizationSettingsResponse,
    PublicStatusPage
)
from app.services.organization_settings import (
    get_organization_settings,
    create_organization_settings,
    update_organization_settings,
    get_public_status_page
)
from app.services.public_status import (
    get_organization_incident_timeline,
    get_organization_incident_timeline
)
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/settings", response_model=OrganizationSettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get organization settings for the current user's organization."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    settings = get_organization_settings(db, current_user.organization_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization settings not found"
        )
    
    return OrganizationSettingsResponse(
        id=settings.id,
        organization_id=settings.organization_id,
        page_title=settings.page_title,
        page_description=settings.page_description,
        custom_domain=settings.custom_domain,
        subdomain=settings.subdomain,
        logo_url=settings.logo_url,
        primary_color=settings.primary_color,
        background_color=settings.background_color,
        custom_css=settings.custom_css,
        show_incident_history=settings.show_incident_history,
        show_uptime_stats=settings.show_uptime_stats,
        maintenance_mode=settings.maintenance_mode,
        maintenance_message=settings.maintenance_message,
        contact_email=settings.contact_email,
        support_url=settings.support_url,
        created_at=settings.created_at.isoformat(),
        updated_at=settings.updated_at.isoformat()
    )

@router.post("/settings", response_model=OrganizationSettingsResponse)
def create_settings(
    settings: OrganizationSettingsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create organization settings."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    # Check if settings already exist
    existing_settings = get_organization_settings(db, current_user.organization_id)
    if existing_settings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization settings already exist"
        )
    
    new_settings = create_organization_settings(db, current_user.organization_id, settings)
    return OrganizationSettingsResponse(
        id=new_settings.id,
        organization_id=new_settings.organization_id,
        page_title=new_settings.page_title,
        page_description=new_settings.page_description,
        custom_domain=new_settings.custom_domain,
        subdomain=new_settings.subdomain,
        logo_url=new_settings.logo_url,
        primary_color=new_settings.primary_color,
        background_color=new_settings.background_color,
        custom_css=new_settings.custom_css,
        show_incident_history=new_settings.show_incident_history,
        show_uptime_stats=new_settings.show_uptime_stats,
        maintenance_mode=new_settings.maintenance_mode,
        maintenance_message=new_settings.maintenance_message,
        contact_email=new_settings.contact_email,
        support_url=new_settings.support_url,
        created_at=new_settings.created_at.isoformat(),
        updated_at=new_settings.updated_at.isoformat()
    )

@router.put("/settings", response_model=OrganizationSettingsResponse)
def update_settings(
    settings: OrganizationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update organization settings."""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    
    updated_settings = update_organization_settings(db, current_user.organization_id, settings)
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization settings not found"
        )
    
    return OrganizationSettingsResponse(
        id=updated_settings.id,
        organization_id=updated_settings.organization_id,
        page_title=updated_settings.page_title,
        page_description=updated_settings.page_description,
        custom_domain=updated_settings.custom_domain,
        subdomain=updated_settings.subdomain,
        logo_url=updated_settings.logo_url,
        primary_color=updated_settings.primary_color,
        background_color=updated_settings.background_color,
        custom_css=updated_settings.custom_css,
        show_incident_history=updated_settings.show_incident_history,
        show_uptime_stats=updated_settings.show_uptime_stats,
        maintenance_mode=updated_settings.maintenance_mode,
        maintenance_message=updated_settings.maintenance_message,
        contact_email=updated_settings.contact_email,
        support_url=updated_settings.support_url,
        created_at=updated_settings.created_at.isoformat(),
        updated_at=updated_settings.updated_at.isoformat()
    )

# Public endpoints (no authentication required)
@router.get("/public/{identifier}", response_model=PublicStatusPage)
def get_public_status_page_by_identifier(
    identifier: str,
    db: Session = Depends(get_db)
):
    """Get public status page by subdomain or custom domain."""
    status_page = get_public_status_page(db, identifier)
    if not status_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status page not found"
        )
    
    return status_page

@router.get("/public/org/{organization_id}", response_model=PublicStatusPage)
def get_public_status_page_by_org_id(
    organization_id: str,
    db: Session = Depends(get_db)
):
    """Get public status page by organization ID."""
    status_page = get_public_status_page(db, organization_id, by_org_id=True)
    if not status_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status page not found"
        )
    
    return status_page

@router.get("/public/{identifier}/incidents/timeline")
def get_public_incident_timeline(
    identifier: str,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get incident timeline data for visualization/graphing.
    Includes color-coded incident blocks for each service.
    
    Args:
        identifier: Organization ID or name
        days: Number of days to look back (default: 30)
    """
    timeline_data = get_organization_incident_timeline(db, identifier, days)
    if not timeline_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return timeline_data
