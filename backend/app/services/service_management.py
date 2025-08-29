from sqlalchemy.orm import Session
from app.models.service import Service, ServiceStatus
from app.models.user import User, UserRole
from app.schemas.service import ServiceCreate, ServiceUpdate
from typing import List, Optional
from datetime import datetime

def get_services_by_organization(db: Session, organization_id: str) -> List[Service]:
    """Get all services for an organization."""
    return db.query(Service).filter(Service.organization_id == organization_id).all()

def get_service_by_id(db: Session, service_id: str, organization_id: str) -> Optional[Service]:
    """Get a specific service by ID within an organization."""
    return db.query(Service).filter(
        Service.id == service_id,
        Service.organization_id == organization_id
    ).first()

def create_service(db: Session, service_data: ServiceCreate, organization_id: str) -> Service:
    """Create a new service for an organization."""
    service = Service(
        name=service_data.name,
        description=service_data.description,
        status=service_data.status,
        organization_id=organization_id
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

def update_service(db: Session, service_id: str, service_data: ServiceUpdate, organization_id: str) -> Optional[Service]:
    """Update an existing service."""
    service = get_service_by_id(db, service_id, organization_id)
    if not service:
        return None
    
    update_data = service_data.dict(exclude_unset=True)
    if update_data:
        for field, value in update_data.items():
            setattr(service, field, value)
        service.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(service)
    
    return service

def delete_service(db: Session, service_id: str, organization_id: str) -> bool:
    """Delete a service."""
    service = get_service_by_id(db, service_id, organization_id)
    if not service:
        return False
    
    db.delete(service)
    db.commit()
    return True

def update_service_status(db: Session, service_id: str, status: ServiceStatus, organization_id: str) -> Optional[Service]:
    """Update only the status of a service."""
    service = get_service_by_id(db, service_id, organization_id)
    if not service:
        return None
    
    service.status = status
    service.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(service)
    return service

def is_user_admin_of_organization(db: Session, user_id: str, organization_id: str) -> bool:
    """Check if user is an admin of the specified organization."""
    user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == organization_id,
        User.role == UserRole.ADMIN
    ).first()
    return user is not None
