from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session.database import get_db
from app.schemas.organization_registration import (
    OrganizationRegistration,
    OrganizationRegistrationResponse,
    SubscriptionCodeValidation,
    SubscriptionCodeResponse
)
from app.services.organization_registration import (
    register_organization,
    validate_subscription_code
)

router = APIRouter()

@router.post("/validate-subscription", response_model=SubscriptionCodeResponse)
def validate_subscription_code_endpoint(
    validation_data: SubscriptionCodeValidation,
    db: Session = Depends(get_db)
):
    """Validate a subscription code."""
    try:
        result = validate_subscription_code(validation_data.subscription_code)
        return SubscriptionCodeResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/register", response_model=OrganizationRegistrationResponse)
def register_organization_endpoint(
    registration_data: OrganizationRegistration,
    db: Session = Depends(get_db)
):
    """Register a new organization with admin user."""
    try:
        result = register_organization(db, registration_data)
        return OrganizationRegistrationResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register organization: {str(e)}"
        )
