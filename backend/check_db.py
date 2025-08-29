#!/usr/bin/env python3
"""
Simple script to check database contents.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session.database import SessionLocal
from app.models.organization import Organization
from app.models.user import User
from app.models.service import Service
from app.models.incident import Incident

def check_database():
    """Check what's in the database."""
    db = SessionLocal()
    
    try:
        org_count = db.query(Organization).count()
        user_count = db.query(User).count()
        service_count = db.query(Service).count()
        incident_count = db.query(Incident).count()
        
        print(f"🔍 Database contents:")
        print(f"   • Organizations: {org_count}")
        print(f"   • Users: {user_count}")
        print(f"   • Services: {service_count}")
        print(f"   • Incidents: {incident_count}")
        
        if org_count > 0:
            print("\n📋 Organizations:")
            orgs = db.query(Organization).all()
            for org in orgs:
                print(f"   • {org.name} (ID: {org.id}, Status: {org.status})")
                
    except Exception as e:
        print(f"❌ Error checking database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_database()
