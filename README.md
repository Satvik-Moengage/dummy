# Status Page Application 🚀

A modern, real-time status page application that helps organizations communicate service status and incidents to their users. Built with React, FastAPI, and Material-UI for a professional and responsive experience.

![Status Page Application](https://img.shields.io/badge/Status-Active-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Database](https://img.shields.io/badge/Database-SQLite-lightblue)
![UI Framework](https://img.shields.io/badge/UI-Material--UI-purple)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 **Authentication & Security**
- User registration and login system
- JWT-based authentication
- Bcrypt password hashing
- Protected routes and API endpoints
- Session management with automatic token refresh

### 🏢 **Multi-tenant Architecture**
- Organization-based data segregation
- Team management with role-based access
- Admin and Editor roles
- User invitation system

### 📊 **Service Management**
- Create, read, update, and delete services
- Real-time service status updates
- Service categorization and organization
- Historical status tracking

### 🚨 **Incident Management**
- Create and manage incidents
- Link incidents to affected services
- Incident timeline and updates
- Scheduled maintenance notifications
- Real-time incident status updates

### 🌐 **Public Status Page**
- Clean, professional public interface
- Real-time service status display
- Incident history and current issues
- Mobile-responsive design
- Customizable branding per organization

### ⚡ **Real-time Updates**
- WebSocket integration for live updates
- Instant status change notifications
- Real-time incident updates
- No-refresh user experience

## 🛠 Technology Stack

### **Frontend**
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Professional component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management

### **Backend**
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database (production-ready alternatives available)
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Uvicorn** - ASGI server

### **Development & Deployment**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **Git**

Optional but recommended:
- **Docker** and **Docker Compose** (for containerized deployment)

## 🚀 Quick Start

### Option 1: Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Satvik-Moengage/dummy.git
   cd dummy
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://127.0.0.1:8000
   - API Documentation: http://127.0.0.1:8000/docs

### Option 2: Docker Setup

```bash
# Clone the repository
git clone https://github.com/Satvik-Moengage/dummy.git
cd dummy

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## 📁 Project Structure

```
dummy/
├── 📄 README.md                    # Project documentation
├── 📄 docker-compose.yml           # Docker orchestration
├── 📄 setup.md                     # Detailed setup guide
├── 📄 DEPLOYMENT.md                # Deployment instructions
├── 📄 HOSTING.md                   # Hosting guidelines
├── 📂 backend/                     # Python FastAPI backend
│   ├── 📄 Dockerfile              # Backend container config
│   ├── 📄 requirements.txt        # Python dependencies
│   ├── 📄 seed.sh                 # Database seeding script
│   ├── 📂 app/                    # Main application code
│   │   ├── 📄 main.py             # FastAPI app entry point
│   │   ├── 📂 api/                # API routes
│   │   ├── 📂 core/               # Core configuration
│   │   ├── 📂 db/                 # Database configuration
│   │   ├── 📂 models/             # SQLAlchemy models
│   │   ├── 📂 schemas/            # Pydantic schemas
│   │   └── 📂 services/           # Business logic
│   └── 📂 tests/                  # Backend tests
└── 📂 frontend/                    # React frontend
    ├── 📄 Dockerfile              # Frontend container config
    ├── 📄 package.json            # Node.js dependencies
    ├── 📄 vite.config.js          # Vite configuration
    ├── 📂 src/                    # Source code
    │   ├── 📄 App.jsx             # Main App component
    │   ├── 📄 main.jsx            # Entry point
    │   ├── 📂 components/         # Reusable components
    │   ├── 📂 contexts/           # React contexts
    │   ├── 📂 pages/              # Page components
    │   └── 📂 services/           # API services
    └── 📂 public/                 # Static assets
```

## 📚 API Documentation

The API documentation is automatically generated and available at:
- **Interactive Docs**: http://127.0.0.1:8000/docs (Swagger UI)
- **Alternative Docs**: http://127.0.0.1:8000/redoc (ReDoc)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/auth/login` | User authentication |
| `GET` | `/api/v1/auth/me` | Get current user |
| `GET` | `/api/v1/services/` | List all services |
| `POST` | `/api/v1/services/` | Create new service |
| `GET` | `/api/v1/incidents/` | List all incidents |
| `POST` | `/api/v1/incidents/` | Create new incident |
| `GET` | `/api/v1/health` | API health check |

## 🔧 Development

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run in development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
python -m pytest tests/
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Database Management

The application uses SQLite by default with automatic table creation. For production, you can easily switch to PostgreSQL, MySQL, or other databases supported by SQLAlchemy.

```bash
# Seed the database with sample data
cd backend
chmod +x seed.sh
./seed.sh
```

## 🚀 Deployment

### Production Deployment with Docker

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Production Deployment

Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for various platforms including:
- Vercel (Frontend)
- Railway/Heroku (Backend)
- DigitalOcean
- AWS/GCP

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help with setup, please:

1. Check the [setup guide](setup.md)
2. Review the [deployment documentation](DEPLOYMENT.md)
3. Open an issue on GitHub
4. Contact the development team

---

## 🗺️ Development Roadmap

### **Phase 1: Project Setup & Core Models (1 Week)**

* **Target Completion:** Friday, September 5, 2025
* **Goal:** Establish the foundational structure of the application, including the database schema and basic user authentication.

| Milestone | Key Tasks | Status |
| :--- | :--- | :--- |
| **1.1: Environment Setup** | - Initialize Git repository.<br>- Set up frontend (React/Vite) and backend (FastAPI) projects.<br>- Configure development and production environments. | ✅ Complete |
| **1.2: Database Schema Design** | - Design and implement schemas for `Organizations`, `Users`, and `Services`.<br>- Establish relationships between tables/collections. | ✅ Complete |
| **1.3: Implement User Authentication** | - Create API endpoints for user registration and login.<br>- Implement password hashing (bcrypt).<br>- Set up JWT for session management. | ✅ Complete |

### **Phase 2: Service & Incident Management (2 Weeks)**

* **Target Completion:** Friday, September 19, 2025
* **Goal:** Build the core administrative features for managing services and handling incidents.

| Milestone | Key Tasks | Status |
| :--- | :--- | :--- |
| **2.1: Service Management API** | - Build backend endpoints for CRUD operations on services.<br>- Implement logic to update service status. | 🔄 In Progress |
| **2.2: Admin Dashboard UI for Services** | - Create a UI for administrators to view, add, edit, and delete services.<br>- Implement a simple interface to change a service's status. | 🔄 In Progress |
| **2.3: Incident Management API** | - Build backend endpoints for creating, updating, and resolving incidents.<br>- Link incidents to affected services. | 📋 Planned |
| **2.4: Admin Dashboard UI for Incidents**| - Design the UI for creating new incidents and scheduled maintenance.<br>- Develop the interface for posting updates to an ongoing incident. | 📋 Planned |

### **Phase 3: Public Status Page & Real-time Updates (1.5 Weeks)**

* **Target Completion:** Wednesday, October 1, 2025
* **Goal:** Develop the public-facing component and integrate real-time communication.

| Milestone | Key Tasks | Status |
| :--- | :--- | :--- |
| **3.1: Develop Public Status Page** | - Create the frontend UI to display all services and their current status.<br>- Add sections for active incidents and a history of past events. | 📋 Planned |
| **3.2: WebSocket Integration (Backend)** | - Set up WebSocket support.<br>- Emit events when a service status is updated or an incident changes. | 📋 Planned |
| **3.3: WebSocket Integration (Frontend)**| - Configure the client-side to listen for WebSocket events.<br>- Update the UI in real-time on both the admin dashboard and public page without requiring a refresh. | 📋 Planned |

### **Phase 4: Team Management & Multi-tenancy (1 Week)**

* **Target Completion:** Wednesday, October 8, 2025
* **Goal:** Scale the application to support multiple organizations and collaborative teams.

| Milestone | Key Tasks | Status |
| :--- | :--- | :--- |
| **4.1: Implement Multi-tenancy Logic** | - Refactor API endpoints to be organization-specific.<br>- Ensure data is strictly segregated between different organizations. | 📋 Planned |
| **4.2: Team Management Features** | - Build the functionality for admins to invite new users to their organization.<br>- Implement a basic role system (Admin, Editor). | 📋 Planned |

### **Phase 5: Testing & Deployment (0.5 Week)**

* **Target Completion:** Friday, October 10, 2025
* **Goal:** Ensure the application is stable, bug-free, and ready for production.

| Milestone | Key Tasks | Status |
| :--- | :--- | :--- |
| **5.1: End-to-End Testing** | - Manually test all user flows, from registration to incident creation.<br>- Write unit or integration tests for critical API endpoints. | 📋 Planned |
| **5.2: Deployment** | - Prepare the application for a production environment.<br>- Deploy the backend and frontend to a cloud service.<br>- Final smoke testing on the live environment. | 📋 Planned |

---

**Made with ❤️ by the Status Page Team**