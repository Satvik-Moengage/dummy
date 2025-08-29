#!/usr/bin/env python3
"""
Seed script to populate the database with dummy data for testing.
Creates organizations, users, services, and incidents.
"""

import sys
import os
from datetime import datetime, timedelta
import random
from typing import List

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session.database import engine, SessionLocal
from app.db.session.base import Base
from app.models.user import User, UserRole, UserStatus
from app.models.organization import Organization, OrganizationStatus
from app.models.service import Service, ServiceStatus
from app.models.incident import Incident, IncidentStatus, IncidentImpact
from app.core.auth import get_password_hash

# Sample data
ORGANIZATIONS = [
    {
        "name": "TechCorp Solutions",
        "description": "Leading technology solutions provider specializing in cloud infrastructure and enterprise software.",
        "website": "https://techcorp.com",
        "industry": "Technology",
        "company_size": "Enterprise",
        "subscription_code": "PREMIUM_TECH_2024"
    },
    {
        "name": "CloudFlow Systems",
        "description": "Next-generation cloud orchestration and workflow automation platform.",
        "website": "https://cloudflow.systems",
        "industry": "Software",
        "company_size": "Medium",
        "subscription_code": "STANDARD_CLOUD_2024"
    },
    {
        "name": "DataVault Analytics",
        "description": "Advanced data analytics and business intelligence solutions for modern enterprises.",
        "website": "https://datavault.io",
        "industry": "Analytics",
        "company_size": "Startup",
        "subscription_code": "BASIC_DATA_2024"
    },
    {
        "name": "SecureNet Services",
        "description": "Comprehensive cybersecurity and network protection services.",
        "website": "https://securenet.com",
        "industry": "Security",
        "company_size": "Large",
        "subscription_code": "ENTERPRISE_SEC_2024"
    },
    {
        "name": "DevOps Central",
        "description": "DevOps consulting and automation tools for continuous integration and deployment.",
        "website": "https://devopscentral.dev",
        "industry": "DevOps",
        "company_size": "Medium",
        "subscription_code": "PRO_DEVOPS_2024"
    }
]

SERVICES_BY_ORG = {
    "TechCorp Solutions": [
        {"name": "API Gateway", "description": "Core API gateway handling all external requests", "status": ServiceStatus.OPERATIONAL, "uptime": 99.9},
        {"name": "User Authentication", "description": "OAuth 2.0 authentication service", "status": ServiceStatus.OPERATIONAL, "uptime": 99.8},
        {"name": "Database Cluster", "description": "Primary PostgreSQL database cluster", "status": ServiceStatus.OPERATIONAL, "uptime": 99.95},
        {"name": "CDN Service", "description": "Content delivery network for static assets", "status": ServiceStatus.DEGRADED, "uptime": 98.5},
        {"name": "Email Service", "description": "Transactional email delivery system", "status": ServiceStatus.MAINTENANCE, "uptime": 99.2}
    ],
    "CloudFlow Systems": [
        {"name": "Workflow Engine", "description": "Core workflow orchestration engine", "status": ServiceStatus.OPERATIONAL, "uptime": 99.7},
        {"name": "Task Scheduler", "description": "Distributed task scheduling service", "status": ServiceStatus.OPERATIONAL, "uptime": 99.6},
        {"name": "Monitoring Dashboard", "description": "Real-time system monitoring and alerting", "status": ServiceStatus.OPERATIONAL, "uptime": 99.9},
        {"name": "File Storage", "description": "Distributed file storage system", "status": ServiceStatus.DEGRADED, "uptime": 97.8}
    ],
    "DataVault Analytics": [
        {"name": "Analytics API", "description": "RESTful API for data analytics operations", "status": ServiceStatus.OPERATIONAL, "uptime": 99.4},
        {"name": "Data Pipeline", "description": "ETL pipeline for data processing", "status": ServiceStatus.OPERATIONAL, "uptime": 99.1},
        {"name": "Reporting Engine", "description": "Business intelligence reporting system", "status": ServiceStatus.OPERATIONAL, "uptime": 99.3},
        {"name": "Data Warehouse", "description": "Centralized data warehouse", "status": ServiceStatus.MAJOR_OUTAGE, "uptime": 95.2}
    ],
    "SecureNet Services": [
        {"name": "Firewall Manager", "description": "Network firewall management system", "status": ServiceStatus.OPERATIONAL, "uptime": 99.99},
        {"name": "Threat Detection", "description": "AI-powered threat detection engine", "status": ServiceStatus.OPERATIONAL, "uptime": 99.8},
        {"name": "VPN Gateway", "description": "Secure VPN access gateway", "status": ServiceStatus.OPERATIONAL, "uptime": 99.5},
        {"name": "Security Dashboard", "description": "Centralized security monitoring dashboard", "status": ServiceStatus.MAINTENANCE, "uptime": 99.0}
    ],
    "DevOps Central": [
        {"name": "CI/CD Pipeline", "description": "Continuous integration and deployment pipeline", "status": ServiceStatus.OPERATIONAL, "uptime": 99.2},
        {"name": "Container Registry", "description": "Docker container image registry", "status": ServiceStatus.OPERATIONAL, "uptime": 99.6},
        {"name": "Build Agents", "description": "Distributed build agent cluster", "status": ServiceStatus.DEGRADED, "uptime": 98.1},
        {"name": "Artifact Storage", "description": "Build artifact storage system", "status": ServiceStatus.OPERATIONAL, "uptime": 99.4}
    ]
}

# User roles and sample users per organization
USERS_PER_ORG = [
    {"email": "admin@{domain}", "first_name": "Admin", "last_name": "User", "role": UserRole.ADMIN, "status": UserStatus.APPROVED},
    {"email": "devops@{domain}", "first_name": "DevOps", "last_name": "Engineer", "role": UserRole.ADMIN, "status": UserStatus.APPROVED},
    {"email": "developer@{domain}", "first_name": "Senior", "last_name": "Developer", "role": UserRole.EDITOR, "status": UserStatus.APPROVED},
    {"email": "analyst@{domain}", "first_name": "System", "last_name": "Analyst", "role": UserRole.EDITOR, "status": UserStatus.APPROVED},
    {"email": "monitor@{domain}", "first_name": "Monitoring", "last_name": "Specialist", "role": UserRole.VIEWER, "status": UserStatus.APPROVED},
    {"email": "intern@{domain}", "first_name": "Intern", "last_name": "User", "role": UserRole.VIEWER, "status": UserStatus.PENDING},
]

# Sample incidents
INCIDENT_TEMPLATES = [
    {
        "title": "High CPU usage on {service}",
        "description": "CPU utilization has exceeded 90% for more than 5 minutes on {service}. Investigating potential causes.",
        "impact": IncidentImpact.MEDIUM,
        "status": IncidentStatus.INVESTIGATING
    },
    {
        "title": "Database connection timeout",
        "description": "Multiple reports of database connection timeouts affecting {service}. Database team is investigating.",
        "impact": IncidentImpact.HIGH,
        "status": IncidentStatus.IDENTIFIED
    },
    {
        "title": "Planned maintenance window",
        "description": "Scheduled maintenance for {service} to apply security updates and performance improvements.",
        "impact": IncidentImpact.LOW,
        "status": IncidentStatus.RESOLVED
    },
    {
        "title": "Network connectivity issues",
        "description": "Intermittent network connectivity issues reported for {service}. Network team investigating routing problems.",
        "impact": IncidentImpact.CRITICAL,
        "status": IncidentStatus.MONITORING
    },
    {
        "title": "Memory leak detected",
        "description": "Memory usage continuously increasing on {service}. Development team working on fix.",
        "impact": IncidentImpact.MEDIUM,
        "status": IncidentStatus.IDENTIFIED
    },
    {
        "title": "SSL certificate renewal",
        "description": "SSL certificate for {service} was successfully renewed. Service is now fully operational.",
        "impact": IncidentImpact.LOW,
        "status": IncidentStatus.RESOLVED
    }
]

def create_organizations(db: Session) -> List[Organization]:
    """Create sample organizations."""
    organizations = []
    
    for org_data in ORGANIZATIONS:
        org = Organization(
            name=org_data["name"],
            description=org_data["description"],
            website=org_data["website"],
            industry=org_data["industry"],
            company_size=org_data["company_size"],
            subscription_code=org_data["subscription_code"],
            status=OrganizationStatus.ACTIVE,
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
        )
        db.add(org)
        organizations.append(org)
    
    db.commit()
    print(f"✅ Created {len(organizations)} organizations")
    return organizations

def create_users(db: Session, organizations: List[Organization]) -> List[User]:
    """Create sample users for each organization."""
    users = []
    
    for org in organizations:
        # Generate domain from organization name
        domain = org.name.lower().replace(" ", "").replace("-", "") + ".com"
        
        for user_template in USERS_PER_ORG:
            user = User(
                email=user_template["email"].format(domain=domain),
                first_name=user_template["first_name"],
                last_name=user_template["last_name"],
                hashed_password=get_password_hash("password123"),
                role=user_template["role"],
                status=user_template["status"],
                organization_id=org.id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180))
            )
            db.add(user)
            users.append(user)
    
    db.commit()
    print(f"✅ Created {len(users)} users across all organizations")
    return users

def create_services(db: Session, organizations: List[Organization]) -> List[Service]:
    """Create sample services for each organization."""
    services = []
    
    for org in organizations:
        if org.name in SERVICES_BY_ORG:
            for service_data in SERVICES_BY_ORG[org.name]:
                service = Service(
                    name=service_data["name"],
                    description=service_data["description"],
                    status=service_data["status"],
                    uptime_percentage=service_data["uptime"],
                    organization_id=org.id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(7, 90))
                )
                db.add(service)
                services.append(service)
    
    db.commit()
    print(f"✅ Created {len(services)} services across all organizations")
    return services

def create_incidents(db: Session, services: List[Service], users: List[User]) -> List[Incident]:
    """Create sample incidents for services."""
    incidents = []
    
    # Create incidents for random services
    for service in services:
        # Get admin users from the same organization
        admin_users = [u for u in users if u.organization_id == service.organization_id and u.role == UserRole.ADMIN]
        
        if not admin_users:
            continue
        
        # Create 1-3 incidents per service
        num_incidents = random.randint(1, 3)
        
        for _ in range(num_incidents):
            template = random.choice(INCIDENT_TEMPLATES)
            creator = random.choice(admin_users)
            
            # Create incident with random timing
            created_time = datetime.utcnow() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            incident = Incident(
                title=template["title"].format(service=service.name),
                description=template["description"].format(service=service.name),
                status=template["status"],
                impact=template["impact"],
                service_id=service.id,
                created_by=creator.id,
                created_at=created_time,
                resolved_at=created_time + timedelta(hours=random.randint(1, 48)) if template["status"] == IncidentStatus.RESOLVED else None
            )
            db.add(incident)
            incidents.append(incident)
    
    db.commit()
    print(f"✅ Created {len(incidents)} incidents across all services")
    return incidents

def main():
    """Main seeding function."""
    print("🌱 Starting database seeding...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("🧹 Clearing existing data...")
        db.query(Incident).delete()
        db.query(Service).delete()
        db.query(User).delete()
        db.query(Organization).delete()
        db.commit()
        
        # Create sample data
        organizations = create_organizations(db)
        users = create_users(db, organizations)
        services = create_services(db, organizations)
        incidents = create_incidents(db, services, users)
        
        print("\n🎉 Database seeding completed successfully!")
        print(f"📊 Summary:")
        print(f"   • {len(organizations)} organizations")
        print(f"   • {len(users)} users")
        print(f"   • {len(services)} services")
        print(f"   • {len(incidents)} incidents")
        print("\n🔑 Login credentials:")
        print("   Email: admin@[organization-domain]")
        print("   Password: password123")
        print("\n🌐 Available organizations:")
        for org in organizations:
            # Generate domain from organization name
            domain = org.name.lower().replace(" ", "").replace("-", "") + ".com"
            print(f"   • {org.name} - admin@{domain}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
