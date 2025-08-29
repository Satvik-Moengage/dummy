import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session.base import Base

class OrganizationSettings(Base):
    __tablename__ = "organization_settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), unique=True)
    
    # Status page customization
    page_title = Column(String, default="Status Page")
    page_description = Column(Text, default="System status and incident updates")
    custom_domain = Column(String, unique=True, nullable=True)  # e.g., status.company.com
    subdomain = Column(String, unique=True, nullable=True)     # e.g., company.statuspage.app
    
    # Branding
    logo_url = Column(String, nullable=True)
    primary_color = Column(String, default="#1976d2")
    background_color = Column(String, default="#f5f5f5")
    custom_css = Column(Text, nullable=True)
    
    # Features
    show_incident_history = Column(Boolean, default=True)
    show_uptime_stats = Column(Boolean, default=True)
    maintenance_mode = Column(Boolean, default=False)
    maintenance_message = Column(Text, nullable=True)
    
    # Contact
    contact_email = Column(String, nullable=True)
    support_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="settings")
