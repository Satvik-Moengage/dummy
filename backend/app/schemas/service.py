from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime
from app.models.service import ServiceStatus

class ServiceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Service name")
    description: Optional[str] = Field(None, max_length=500, description="Service description")
    status: ServiceStatus = Field(ServiceStatus.OPERATIONAL, description="Service status")

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[ServiceStatus] = None
    uptime_percentage: Optional[float] = Field(None, ge=0, le=100)

class ServiceResponse(ServiceBase):
    id: str
    organization_id: str
    uptime_percentage: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
