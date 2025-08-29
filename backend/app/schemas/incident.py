from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class IncidentStatus(str, Enum):
    INVESTIGATING = "investigating"
    IDENTIFIED = "identified"
    MONITORING = "monitoring"
    RESOLVED = "resolved"

class IncidentImpact(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Incident title")
    description: str = Field(..., min_length=1, max_length=2000, description="Incident description")
    impact: IncidentImpact = Field(IncidentImpact.MEDIUM, description="Incident impact level")

class IncidentCreate(IncidentBase):
    service_id: str = Field(..., description="ID of the affected service")

class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    status: Optional[IncidentStatus] = None
    impact: Optional[IncidentImpact] = None

class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    update_message: Optional[str] = Field(None, max_length=500, description="Optional update message")

class IncidentResponse(IncidentBase):
    id: str
    service_id: str
    status: IncidentStatus
    created_by: str
    resolved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Nested service info
    service_name: Optional[str] = None
    creator_email: Optional[str] = None

    class Config:
        from_attributes = True
