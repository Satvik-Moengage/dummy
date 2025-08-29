#!/usr/bin/env python3
"""
Production readiness checker for Status Page Application
"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a required file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description}")
        return False

def check_env_variable(var_name, required=True):
    """Check environment variable"""
    value = os.getenv(var_name)
    if value:
        if var_name == "SECRET_KEY" and "change-in-production" in value:
            print(f"⚠️  {var_name} is using default value - CHANGE IT!")
            return False
        print(f"✅ {var_name} is set")
        return True
    elif required:
        print(f"❌ {var_name} is required but not set")
        return False
    else:
        print(f"⚠️  {var_name} is optional but not set")
        return True

def main():
    print("🔍 Production Readiness Check")
    print("=" * 40)
    
    issues = []
    
    # Check required files
    print("\n📁 Required Files:")
    files_to_check = [
        ("README.md", "README.md exists"),
        ("docker-compose.yml", "Docker Compose file exists"),
        ("backend/Dockerfile", "Backend Dockerfile exists"),
        ("frontend/Dockerfile", "Frontend Dockerfile exists"),
        ("backend/requirements.txt", "Backend requirements.txt exists"),
        ("frontend/package.json", "Frontend package.json exists"),
        (".env.example", "Environment template exists"),
    ]
    
    for filepath, description in files_to_check:
        if not check_file_exists(filepath, description):
            issues.append(f"Missing file: {filepath}")
    
    # Check package.json scripts
    print("\n📦 Frontend Build Scripts:")
    try:
        with open("frontend/package.json", "r") as f:
            package_json = json.load(f)
            scripts = package_json.get("scripts", {})
            
            if "build" in scripts:
                print("✅ Build script exists")
            else:
                print("❌ Build script missing")
                issues.append("Frontend build script missing")
                
    except Exception as e:
        print(f"❌ Error reading package.json: {e}")
        issues.append("Cannot read frontend/package.json")
    
    # Check environment variables (if .env exists)
    print("\n🔐 Environment Configuration:")
    if os.path.exists(".env"):
        # Load .env file
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except ImportError:
            print("⚠️  python-dotenv not installed")
    
    env_vars = [
        ("SECRET_KEY", True),
        ("DATABASE_URL", True),
        ("VITE_API_URL", False),
    ]
    
    for var_name, required in env_vars:
        if not check_env_variable(var_name, required):
            if required:
                issues.append(f"Environment variable {var_name} issue")
    
    # Check Docker setup
    print("\n🐳 Docker Configuration:")
    if check_file_exists("docker-compose.yml", "Docker Compose configuration"):
        # Check if docker-compose.yml has required services
        try:
            import yaml
            with open("docker-compose.yml", "r") as f:
                compose = yaml.safe_load(f)
                services = compose.get("services", {})
                
                if "backend" in services:
                    print("✅ Backend service configured")
                else:
                    print("❌ Backend service missing")
                    issues.append("Backend service not in docker-compose.yml")
                    
                if "frontend" in services:
                    print("✅ Frontend service configured")
                else:
                    print("❌ Frontend service missing")
                    issues.append("Frontend service not in docker-compose.yml")
                    
        except ImportError:
            print("⚠️  PyYAML not installed - cannot check docker-compose.yml")
        except Exception as e:
            print(f"⚠️  Error reading docker-compose.yml: {e}")
    
    # Security checks
    print("\n🔒 Security Checks:")
    secret_key = os.getenv("SECRET_KEY", "")
    if "change-in-production" in secret_key:
        print("❌ Using default SECRET_KEY - SECURITY RISK!")
        issues.append("Default SECRET_KEY in use")
    elif len(secret_key) < 32:
        print("⚠️  SECRET_KEY might be too short")
    else:
        print("✅ SECRET_KEY looks good")
    
    # Final summary
    print("\n" + "=" * 40)
    if issues:
        print(f"❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"   • {issue}")
        print("\n🔧 Fix these issues before deploying to production!")
        sys.exit(1)
    else:
        print("✅ All checks passed! Ready for production deployment 🚀")
        print("\n📚 Next steps:")
        print("   1. Review HOSTING.md for deployment options")
        print("   2. Generate a secure SECRET_KEY if needed")
        print("   3. Update environment variables for production")
        print("   4. Deploy using Docker or your chosen platform")

if __name__ == "__main__":
    main()
