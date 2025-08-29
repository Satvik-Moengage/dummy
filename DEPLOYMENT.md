# Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the Status Page Application to various platforms.

## 📋 Table of Contents

- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Railway)](#backend-deployment-railway)
- [Alternative Platforms](#alternative-platforms)
- [Environment Variables](#environment-variables)
- [Domain Configuration](#domain-configuration)
- [CI/CD Setup](#cicd-setup)

## 🌐 Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying the React frontend due to its excellent integration with Vite and automatic deployments.

### Prerequisites

1. **GitHub Account** with your repository
2. **Vercel Account** (free tier available)
3. **Node.js 16+** for local testing

### Method 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Verify your `frontend/package.json` has the correct build script:
   ```json
   {
     "scripts": {
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click **"New Project"**
3. **Import Git Repository**:
   - Connect your GitHub account if not already connected
   - Select your repository: `Satvik-Moengage/dummy`
   - Click **"Import"**

#### Step 3: Configure Project Settings

1. **Framework Preset**: Vercel should auto-detect "Vite"
2. **Root Directory**: Set to `frontend`
3. **Build Command**: `npm run build` (should be auto-filled)
4. **Output Directory**: `dist` (should be auto-filled)
5. **Install Command**: `npm install` (should be auto-filled)

#### Step 4: Environment Variables

Add these environment variables in the Vercel dashboard:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
VITE_API_URL=https://your-backend-url.com

# App Configuration
VITE_APP_NAME=Status Page
VITE_APP_DESCRIPTION=Real-time service status monitoring
```

#### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-3 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy from Frontend Directory

```bash
cd frontend
vercel

# Follow the prompts:
# ? Set up and deploy "~/Desktop/dummy/frontend"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Username]
# ? Link to existing project? [y/N] n
# ? What's your project's name? status-page-frontend
# ? In which directory is your code located? ./
```

#### Step 4: Configure Production Deployment

```bash
# Deploy to production
vercel --prod
```

### Method 3: Automatic Deployments (Recommended for Production)

1. After initial setup, enable **automatic deployments**:
   - Go to your project dashboard on Vercel
   - Navigate to **Settings** → **Git**
   - Enable **"Automatic deployments from Git"**

2. Now every push to `main` branch will trigger a new deployment

## 🔧 Frontend Build Optimization

### Vite Configuration for Production

Create or update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

### Environment Variables Setup

Create `frontend/.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=Status Page
VITE_APP_DESCRIPTION=Real-time service status monitoring

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=
```

Create `frontend/.env.production`:

```bash
# Production API Configuration
VITE_API_BASE_URL=https://your-production-backend.com/api/v1
VITE_API_URL=https://your-production-backend.com

# App Configuration
VITE_APP_NAME=Status Page
VITE_APP_DESCRIPTION=Real-time service status monitoring
```

## 🚀 Backend Deployment (Render)

Render is recommended for the FastAPI backend due to its excellent Python support, automatic deployments, and generous free tier.

### Step 1: Prepare Backend for Deployment

1. Create `backend/render.yaml` (optional, for advanced configuration):
   ```yaml
   services:
     - type: web
       name: status-page-api
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
       healthCheckPath: /api/v1/health
   ```

2. Update `backend/requirements.txt` to include production dependencies:
   ```txt
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   sqlalchemy==2.0.23
   python-jose[cryptography]==3.3.0
   passlib[bcrypt]==1.7.4
   python-multipart==0.0.6
   email-validator==2.1.0
   python-dotenv==1.0.0
   psycopg2-binary==2.9.9
   gunicorn==21.2.0
   ```

3. Create `backend/gunicorn.conf.py` for production server:
   ```python
   import multiprocessing
   
   # Server socket
   bind = "0.0.0.0:10000"
   backlog = 2048
   
   # Worker processes
   workers = multiprocessing.cpu_count() * 2 + 1
   worker_class = "uvicorn.workers.UvicornWorker"
   worker_connections = 1000
   timeout = 30
   keepalive = 2
   
   # Restart workers after this many requests, to help prevent memory leaks
   max_requests = 1000
   max_requests_jitter = 100
   
   # Log level
   loglevel = "info"
   ```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/log in with GitHub
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository**:
   - Connect your GitHub account if not already connected
   - Select your repository: `Satvik-Moengage/dummy`
   - Click **"Connect"**

4. **Configure Service Settings**:
   - **Name**: `status-page-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free` (for testing) or `Starter` (for production)

### Step 3: Configure Environment Variables

Add these in Render dashboard under **Environment**:

```bash
# Database (Render will provide PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Security
SECRET_KEY=your-super-secret-key-here-256-bits-long
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173

# Environment
ENVIRONMENT=production
PYTHONPATH=/opt/render/project/src

# Python settings
PYTHON_VERSION=3.11.0
```

### Step 4: Add PostgreSQL Database (Render)

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. **Configure Database**:
   - **Name**: `status-page-db`
   - **Database**: `statuspage`
   - **User**: `statuspage_user`
   - **Plan**: `Free` (for testing)

3. **Connect Database to Web Service**:
   - Copy the **Internal Database URL**
   - Add it as `DATABASE_URL` environment variable in your web service

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy your application
3. Your API will be available at `https://your-service-name.onrender.com`
4. Check deployment logs for any issues

## 🌍 Alternative Platforms

### Frontend Alternatives

#### Netlify
```bash
# Build settings
Build command: npm run build
Publish directory: dist
```

#### GitHub Pages
```bash
# Add to package.json
"homepage": "https://username.github.io/repository-name",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### Backend Alternatives

#### Heroku
```bash
# Create Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: status-page-backend
services:
- name: api
  source_dir: backend
  github:
    repo: Satvik-Moengage/dummy
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 🔒 Environment Variables Reference

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_API_URL=https://your-backend.onrender.com
VITE_APP_NAME=Status Page
VITE_APP_DESCRIPTION=Real-time service status monitoring
```

### Backend (Render)
```bash
SECRET_KEY=your-256-bit-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://user:password@host:port/database
ALLOWED_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production
PYTHONPATH=/opt/render/project/src
PYTHON_VERSION=3.11.0
```

## 🌐 Domain Configuration

### Custom Domain on Vercel

1. Go to your project dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Configure DNS records as instructed

### SSL/HTTPS

Both Vercel and Render provide automatic SSL certificates. No additional configuration needed.

## 🔄 CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🔍 Monitoring & Analytics

### Add Error Tracking (Optional)

1. **Sentry** for error monitoring
2. **Google Analytics** for usage tracking
3. **Vercel Analytics** for performance monitoring

### Health Checks

Both platforms provide built-in health monitoring:
- **Vercel**: Automatic uptime monitoring
- **Render**: Health check endpoints and monitoring dashboard

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   npm install
   npm run build
   ```

2. **API Connection Issues**
   ```bash
   # Verify environment variables
   # Check CORS settings
   # Ensure API URL is correct
   ```

3. **Environment Variables Not Working**
   ```bash
   # Ensure variables start with VITE_ for frontend
   # Redeploy after adding variables
   ```

### Getting Help

1. Check deployment logs in platform dashboards
2. Test locally with production environment variables
3. Verify all environment variables are set correctly
4. Check CORS configuration for API calls

---

**🎉 Your Status Page Application is now deployed and ready for production use!**
