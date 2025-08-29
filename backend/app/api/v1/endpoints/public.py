from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.schemas.organization_settings import PublicStatusPage
from app.services.organization_settings import get_public_status_page

router = APIRouter()

@router.get("/status/{identifier}", response_model=PublicStatusPage)
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

@router.get("/status/org/{organization_id}", response_model=PublicStatusPage)
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
