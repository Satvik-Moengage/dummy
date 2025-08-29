from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    organization_id: str  # Now mandatory

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str
    status: str
    organization_id: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True
