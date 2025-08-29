import uuid
from sqlalchemy import Column, String, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session.base import Base
import enum

class OrganizationStatus(enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    subscription_code = Column(String, nullable=False)
    status = Column(Enum(OrganizationStatus), default=OrganizationStatus.TRIAL, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    services = relationship("Service", back_populates="organization")
    settings = relationship("OrganizationSettings", back_populates="organization", uselist=False)
