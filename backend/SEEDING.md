# Database Seeding

This directory contains a comprehensive seed script that populates the database with realistic dummy data for testing and development.

## What gets seeded:

- **5 Organizations** with different industries and company sizes
- **30 Users** (6 per organization) with different roles:
  - Admin users (organization admins and DevOps engineers)
  - Editors (developers and analysts)
  - Viewers (monitoring specialists and interns)
- **21 Services** distributed across organizations with various statuses
- **40+ Incidents** with realistic titles, descriptions, and status progression

## How to run:

### Method 1: Python script
```bash
cd backend
python seed_data.py
# or with virtual environment:
/path/to/.venv/bin/python seed_data.py
```

### Method 2: Shell script
```bash
cd backend
./seed.sh
```

## Login credentials:

All users have the password: `password123`

### Sample admin login emails:
- `admin@techcorpsolutions.com`
- `admin@cloudflowsystems.com`
- `admin@datavaultanalytics.com`
- `admin@securenetservices.com`
- `admin@devopscentral.com`

### Organizations created:
1. **TechCorp Solutions** - Technology company with API gateway, authentication, database services
2. **CloudFlow Systems** - Cloud platform with workflow engine and task scheduler
3. **DataVault Analytics** - Analytics company with data pipeline and reporting services
4. **SecureNet Services** - Security company with firewall and threat detection services
5. **DevOps Central** - DevOps consulting with CI/CD and container services

## Features demonstrated:

- **Multi-tenant data** - Each organization has isolated data
- **Realistic service statuses** - Mix of operational, degraded, maintenance, and outage states
- **Incident tracking** - Various incident types with different impact levels
- **User role management** - Admin, Editor, and Viewer roles with different access levels
- **Status calculations** - Overall organization status based on service health
- **Time-based data** - Incidents and services with realistic timestamps

## Database structure:

The seed script populates all major entities:
- Organizations with subscription details
- Users with roles and approval status
- Services with uptime percentages
- Incidents with impact levels and resolution status

## Testing endpoints:

After seeding, you can test various endpoints:

```bash
# Get organization directory (public)
curl http://localhost:8000/api/v1/status/organizations

# Get specific organization status page (public)
curl http://localhost:8000/api/v1/status/organizations/{org-id}/status

# Login (authentication required)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@techcorpsolutions.com", "password": "password123"}'
```

## Customization:

You can modify the seed data by editing the constants at the top of `seed_data.py`:
- `ORGANIZATIONS` - Add/modify organization details
- `SERVICES_BY_ORG` - Define services for each organization
- `USERS_PER_ORG` - Configure user roles and types
- `INCIDENT_TEMPLATES` - Customize incident scenarios

## Clean slate:

The script automatically clears existing data before seeding, so you can run it multiple times to reset the database to a known state.
