#!/usr/bin/env python3
"""
Test script to debug the public_status service.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session.database import SessionLocal
from app.services.public_status import get_all_organizations_list

def test_public_status():
    """Test the public status service."""
    db = SessionLocal()
    
    try:
        print("🔍 Testing get_all_organizations_list function...")
        result = get_all_organizations_list(db)
        print(f"Result: {result}")
        print(f"Result type: {type(result)}")
        print(f"Result length: {len(result)}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_public_status()
