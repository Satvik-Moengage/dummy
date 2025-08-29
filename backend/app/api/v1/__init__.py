from fastapi import APIRouter
from app.api.v1.endpoints import auth, organizations, public, organization_registration, team_management, public_status, services, incidents

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Include organization registration routes
api_router.include_router(organization_registration.router, prefix="/organization", tags=["organization-registration"])

# Include team management routes (admin only)
api_router.include_router(team_management.router, prefix="/team", tags=["team-management"])

# Include service management routes (admin only)
api_router.include_router(services.router, prefix="/organization", tags=["service-management"])

# Include incident management routes (admin only)
api_router.include_router(incidents.router, prefix="/organization", tags=["incident-management"])

# Include organization routes
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])

# Include public routes (no authentication required)
api_router.include_router(public.router, prefix="/public", tags=["public"])

# Include public status pages (no authentication required)
api_router.include_router(public_status.router, prefix="/status", tags=["public-status"])

@api_router.get("/health")
def health_check():
    return {"status": "healthy", "database": "SQLite"}