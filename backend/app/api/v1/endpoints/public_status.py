from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.services.public_status import get_organization_status_page, get_all_organizations_list
from typing import List

router = APIRouter()

@router.get("/organizations", response_model=List[dict])
def get_organizations_directory(db: Session = Depends(get_db)):
    """
    Get a directory of all organizations and their status.
    This is a public endpoint that doesn't require authentication.
    """
    organizations = get_all_organizations_list(db)
    return organizations

@router.get("/organizations/{org_identifier}/status")
def get_organization_public_status(
    org_identifier: str,
    db: Session = Depends(get_db)
):
    """
    Get public status page for a specific organization.
    org_identifier can be organization ID or subdomain.
    This is a public endpoint that doesn't require authentication.
    """
    status_data = get_organization_status_page(db, org_identifier)
    
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return status_data

@router.get("/organizations/{org_identifier}/services")
def get_organization_services_status(
    org_identifier: str,
    db: Session = Depends(get_db)
):
    """
    Get only services status for a specific organization.
    Useful for lightweight checks or widgets.
    """
    status_data = get_organization_status_page(db, org_identifier)
    
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return {
        "organization": status_data["organization"],
        "overall_status": status_data["overall_status"],
        "services": status_data["services"],
        "last_updated": status_data["last_updated"]
    }

@router.get("/organizations/{org_identifier}/incidents")
def get_organization_incidents_status(
    org_identifier: str,
    db: Session = Depends(get_db)
):
    """
    Get only incidents for a specific organization.
    Useful for incident history pages.
    """
    status_data = get_organization_status_page(db, org_identifier)
    
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return {
        "organization": status_data["organization"],
        "incidents": status_data["incidents"],
        "last_updated": status_data["last_updated"]
    }
