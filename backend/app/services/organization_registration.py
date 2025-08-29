from sqlalchemy.orm import Session
from app.models.user import User, UserRole, UserStatus
from app.models.organization import Organization, OrganizationStatus
from app.models.organization_settings import OrganizationSettings
from app.schemas.organization_registration import OrganizationRegistration, SubscriptionCodeValidation
from app.core.auth import get_password_hash
import uuid

def validate_subscription_code(subscription_code: str) -> dict:
    """
    Validate subscription code. 
    For now, this is static but can be extended to call external API.
    """
    # Static validation for now - you can replace this with API call
    valid_codes = {
        "STARTUP2024": {
            "valid": True,
            "plan_name": "Startup Plan",
            "features": ["Up to 10 services", "Basic incident management", "Custom branding"],
            "message": "Startup plan activated successfully"
        },
        "ENTERPRISE2024": {
            "valid": True,
            "plan_name": "Enterprise Plan", 
            "features": ["Unlimited services", "Advanced analytics", "API access", "Priority support"],
            "message": "Enterprise plan activated successfully"
        },
        "TRIAL2024": {
            "valid": True,
            "plan_name": "Trial Plan",
            "features": ["Up to 3 services", "7-day trial"],
            "message": "Trial plan activated successfully"
        }
    }
    
    if subscription_code in valid_codes:
        return valid_codes[subscription_code]
    else:
        return {
            "valid": False,
            "plan_name": None,
            "features": None,
            "message": "Invalid subscription code"
        }

def register_organization(db: Session, registration_data: OrganizationRegistration) -> dict:
    """Register a new organization with admin user."""
    
    # First validate subscription code
    validation_result = validate_subscription_code(registration_data.subscription_code)
    if not validation_result["valid"]:
        raise ValueError("Invalid subscription code")
    
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email == registration_data.admin_user.email).first()
    if existing_user:
        raise ValueError("Email already registered")
    
    # Create organization
    organization = Organization(
        id=str(uuid.uuid4()),
        name=registration_data.name,
        description=registration_data.description,
        website=registration_data.website,
        industry=registration_data.industry,
        company_size=registration_data.company_size,
        phone=registration_data.phone,
        address=registration_data.address,
        subscription_code=registration_data.subscription_code,
        status=OrganizationStatus.TRIAL if "TRIAL" in registration_data.subscription_code else OrganizationStatus.ACTIVE
    )
    db.add(organization)
    db.flush()  # Get the ID
    
    # Create default organization settings
    subdomain = registration_data.name.lower().replace(' ', '-').replace('_', '-')
    # Ensure subdomain is unique
    counter = 1
    original_subdomain = subdomain
    while db.query(OrganizationSettings).filter(OrganizationSettings.subdomain == subdomain).first():
        subdomain = f"{original_subdomain}-{counter}"
        counter += 1
    
    default_settings = OrganizationSettings(
        id=str(uuid.uuid4()),
        organization_id=organization.id,
        page_title=f"{registration_data.name} Status",
        page_description=f"System status and incident updates for {registration_data.name}",
        subdomain=subdomain
    )
    db.add(default_settings)
    
    # Create admin user
    hashed_password = get_password_hash(registration_data.admin_user.password)
    admin_user = User(
        id=str(uuid.uuid4()),
        first_name=registration_data.admin_user.first_name,
        last_name=registration_data.admin_user.last_name,
        email=registration_data.admin_user.email,
        hashed_password=hashed_password,
        role=UserRole.ADMIN,
        status=UserStatus.APPROVED,  # Admin is automatically approved
        organization_id=organization.id
    )
    db.add(admin_user)
    
    # Commit all changes
    db.commit()
    db.refresh(organization)
    db.refresh(admin_user)
    
    return {
        "organization_id": organization.id,
        "organization_name": organization.name,
        "admin_user_id": admin_user.id,
        "admin_email": admin_user.email,
        "message": f"Organization '{organization.name}' registered successfully with {validation_result['plan_name']}"
    }
