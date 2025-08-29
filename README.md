# Status Page Application

A modern, full-stack status page application built with FastAPI (Python) backend and React (Vite) frontend. This application allows organizations to create and manage status pages for their services, track incidents, and keep users informed about service availability.

## Features

- 🏢 **Multi-tenant Organization Support** - Multiple organizations with custom branding
- 📊 **Service Status Management** - Track operational status of multiple services
- 🚨 **Incident Management** - Create, update, and resolve incidents with real-time status updates
- 📈 **Dynamic Status Updates** - Automatic service status calculation based on incident impact
- 📱 **Public Status Pages** - Beautiful, responsive status pages for end users
- 👥 **Role-based Access Control** - Admin, Editor, and Viewer roles
- 📊 **Incident Timeline Visualization** - Interactive graphs showing incident history
- 🎨 **Customizable Branding** - Custom domains, colors, and styling
- 🔒 **JWT Authentication** - Secure user authentication and authorization

## Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **SQLite** - Lightweight database (easily upgradeable to PostgreSQL)
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Tokens for authentication

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Prerequisites

- **Python 3.9+**
- **Node.js 16+**
- **npm or yarn**

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd status-page-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative API Docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Environment Configuration

Create environment files for configuration:

#### Backend (.env)
```bash
# Create backend/.env
DATABASE_URL=sqlite:///./status_page.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend (.env)
```bash
# Create frontend/.env
VITE_API_URL=http://localhost:8000
```

### 5. Initial Data Setup

The application includes a seed script with sample data. On first run, the database will be automatically created with sample organizations, services, and incidents.

### 6. Default Login Credentials

```
Email: admin@techcorpsolutions.com
Password: admin123
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Organizations
- `GET /api/v1/organizations/public/{identifier}` - Public status page
- `GET /api/v1/organizations/public/{identifier}/incidents/timeline` - Incident timeline

### Services
- `GET /api/v1/organization/services` - List organization services
- `POST /api/v1/organization/services` - Create service
- `PUT /api/v1/organization/services/{id}` - Update service

### Incidents
- `GET /api/v1/organization/incidents` - List incidents
- `POST /api/v1/organization/incidents` - Create incident
- `PATCH /api/v1/organization/incidents/{id}/status` - Update incident status

### Public Status
- `GET /api/v1/status/organizations` - List all organizations
- `GET /api/v1/status/organizations/{id}/status` - Organization status

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/     # API route handlers
│   │   ├── core/                 # Core configuration and auth
│   │   ├── db/                   # Database configuration
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic
│   │   └── main.py               # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── contexts/             # React contexts
│   │   ├── pages/                # Page components
│   │   ├── services/             # API client
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Features Overview

### 🏢 Organization Management
- Multi-tenant architecture supporting multiple organizations
- Custom branding with logos, colors, and domains
- Organization settings and configuration

### 📊 Service Monitoring
- Create and manage multiple services per organization
- Automatic status calculation based on incidents
- Service uptime tracking and reporting

### 🚨 Incident Management
- Create incidents with different impact levels (Low, Medium, High, Critical)
- Real-time status updates with messaging
- Automatic service status updates based on incident impact
- Role-based permissions for incident creation and management

### 📈 Status Visualization
- Public status pages for end users
- Incident timeline graphs with color-coded impact levels
- Real-time status updates
- Historical incident data

### 👥 User Management
- Role-based access control (Admin, Editor, Viewer)
- JWT-based authentication
- Organization-scoped user access

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
npm run lint:fix
```

### Database Migrations

The application uses SQLAlchemy with automatic table creation. For production deployments with schema changes, consider implementing Alembic migrations.

## Production Deployment

See the included Dockerfile and docker-compose.yml for containerized deployment options.

### Environment Variables for Production

```bash
# Backend
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secure-secret-key
DEBUG=false

# Frontend
VITE_API_URL=https://your-api-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.

* **Target Completion:** Friday, October 10, 2025
* **Goal:** Ensure the application is stable, bug-free, and ready for production.

| Milestone | Key Tasks | Status |
| :--- | :--- | :--- |
| **5.1: End-to-End Testing** | - Manually test all user flows, from registration to incident creation.<br>- Write unit or integration tests for critical API endpoints. | To Do |
| **5.2: Deployment** | - Prepare the application for a production environment.<br>- Deploy the backend and frontend to a cloud service (e.g., Vercel, Heroku).<br>- Final smoke testing on the live environment. | To Do |