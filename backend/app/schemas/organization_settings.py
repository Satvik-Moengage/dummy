from pydantic import BaseModel
from typing import Optional

class OrganizationSettingsBase(BaseModel):
    page_title: Optional[str] = "Status Page"
    page_description: Optional[str] = "System status and incident updates"
    custom_domain: Optional[str] = None
    subdomain: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = "#1976d2"
    background_color: Optional[str] = "#f5f5f5"
    custom_css: Optional[str] = None
    show_incident_history: Optional[bool] = True
    show_uptime_stats: Optional[bool] = True
    maintenance_mode: Optional[bool] = False
    maintenance_message: Optional[str] = None
    contact_email: Optional[str] = None
    support_url: Optional[str] = None

class OrganizationSettingsCreate(OrganizationSettingsBase):
    pass

class OrganizationSettingsUpdate(OrganizationSettingsBase):
    pass

class OrganizationSettingsResponse(OrganizationSettingsBase):
    id: str
    organization_id: str
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

class PublicStatusPage(BaseModel):
    page_title: str
    page_description: str
    logo_url: Optional[str]
    primary_color: str
    background_color: str
    custom_css: Optional[str]
    show_incident_history: bool
    show_uptime_stats: bool
    maintenance_mode: bool
    maintenance_message: Optional[str]
    contact_email: Optional[str]
    support_url: Optional[str]
    services: list = []
    incidents: list = []
    organization_name: str
