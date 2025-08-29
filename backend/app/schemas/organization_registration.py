from pydantic import BaseModel, EmailStr
from typing import Optional

class AdminUserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class OrganizationRegistration(BaseModel):
    # Organization details
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    subscription_code: str
    
    # Admin user details
    admin_user: AdminUserCreate

class SubscriptionCodeValidation(BaseModel):
    subscription_code: str

class SubscriptionCodeResponse(BaseModel):
    valid: bool
    plan_name: Optional[str] = None
    features: Optional[list] = None
    message: Optional[str] = None

class OrganizationRegistrationResponse(BaseModel):
    organization_id: str
    organization_name: str
    admin_user_id: str
    admin_email: str
    message: str
    
    class Config:
        from_attributes = True
