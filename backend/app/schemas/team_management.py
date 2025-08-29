from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class TeamMemberResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str
    status: str
    created_at: str
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserApprovalRequest(BaseModel):
    user_id: str
    action: str  # "approve" or "reject"
    role: Optional[str] = "viewer"  # Role to assign when approving

class UserApprovalResponse(BaseModel):
    success: bool
    message: str
    user: Optional[TeamMemberResponse] = None

class TeamMembersListResponse(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int
    members: List[TeamMemberResponse]

class OrganizationLookupResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    
class RoleUpdateRequest(BaseModel):
    user_id: str
    new_role: str
