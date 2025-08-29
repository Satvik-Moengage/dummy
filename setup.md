# Application Setup Guide

This guide provides step-by-step instructions to set up and run the backend and frontend of the Status Page Application.

## Backend Setup (Python/FastAPI)

Follow these steps to get the backend server running.

### 1. Navigate to the Backend Directory

```bash
cd backend
```

### 2. Create and Activate a Virtual Environment

**On macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**

```bash
python -m venv venv
.\venv\Scripts\activate
```

After activation, your terminal prompt should be prefixed with `(venv)`.

### 3. Install Dependencies

Install all the required Python packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

**Note:** This application uses SQLite as the default database, which requires no additional setup. The database file will be created automatically when the application starts.

**Dependencies:** The application now includes authentication packages:
- `python-jose[cryptography]` - JWT token handling
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data handling
- `email-validator` - Email validation

**Troubleshooting:** If you encounter any installation errors, try upgrading pip first:

```bash
pip install --upgrade pip
```

### 4. Run the Backend Server

Start the FastAPI application using Uvicorn. The `--reload` flag enables hot-reloading, which automatically restarts the server when code changes are detected.

```bash
uvicorn app.main:app --reload
```

The backend API will be running at `http://127.0.0.1:8000`.

**Database Information:**
- The application uses SQLite as the database
- Database file: `status_page.db` (created automatically in the backend directory)
- Database tables are created automatically when the application starts
- No additional database setup required

**API Endpoints:**
- Root: `http://127.0.0.1:8000/` - Basic health check
- API Health: `http://127.0.0.1:8000/api/v1/health` - API health status
- API Documentation: `http://127.0.0.1:8000/docs` - Interactive API documentation

**Authentication Endpoints:**
- Register: `POST /api/v1/auth/register` - Create new user account
- Login: `POST /api/v1/auth/login` - User authentication
- Current User: `GET /api/v1/auth/me` - Get current user info (requires authentication)

**Security:**
- JWT tokens for authentication
- Bcrypt password hashing
- Token expiration (30 minutes default)

---

## Frontend Setup (React)

Follow these steps to get the frontend development server running.

### 1. Navigate to the Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

Install all the required Node.js packages using npm.

```bash
npm install
```

**Dependencies Added:**
- `react-router-dom` - Client-side routing
- `axios` - HTTP client for API calls
- `@mui/material` - Material-UI component library
- `@emotion/react` & `@emotion/styled` - Required for Material-UI
- `@mui/icons-material` - Material-UI icons

**UI Framework:**
- **Material-UI (MUI)** - Professional React component library
- **Responsive Design** - Mobile-first approach
- **Custom Theme** - Consistent styling across the application
- **Material Design** - Google's design system implementation

**Authentication Features:**
- User registration and login
- Protected routes
- JWT token management
- Automatic token refresh
- Beautiful Material-UI forms

### 3. Run the Frontend Server

Start the React development server.

```bash
npm run dev
```

The frontend application will be running at `http://localhost:5173` (or the next available port).
