# Production Deployment Guide

This guide covers different options for deploying the Status Page Application to production environments.

## Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

### Quick Start

1. **Clone and configure**:
   ```bash
   git clone <your-repo>
   cd status-page-app
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Verify deployment**:
   ```bash
   docker-compose ps
   curl http://localhost:3000
   curl http://localhost:8000/docs
   ```

### Production Configuration

1. **Update environment variables**:
   ```bash
   # .env file
   SECRET_KEY=your-super-secure-secret-key-here
   VITE_API_URL=https://your-domain.com
   DATABASE_URL=postgresql://user:pass@postgres:5432/status_page
   ```

2. **Enable PostgreSQL** (recommended for production):
   ```bash
   # Uncomment PostgreSQL service in docker-compose.yml
   # Update DATABASE_URL in .env
   ```

3. **Add reverse proxy** (Nginx/Traefik):
   ```nginx
   # nginx.conf
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api/ {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Free Hosting Options

### 1. Railway (Recommended for Fullstack Apps)

Railway offers free tier with PostgreSQL database:

1. **Setup**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**:
   ```bash
   # Create new project
   railway new
   
   # Deploy backend
   cd backend
   railway up
   
   # Deploy frontend
   cd ../frontend
   railway up
   ```

3. **Configure**:
   - Add PostgreSQL service in Railway dashboard
   - Set environment variables in Railway dashboard
   - Update frontend VITE_API_URL to backend Railway URL

**Pros**: Full PostgreSQL, simple deployment, good free tier
**Cons**: Credit-based free tier

### 2. Render

Render provides free web services and PostgreSQL:

1. **Backend deployment**:
   - Connect GitHub repo to Render
   - Create Web Service from `backend` folder
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Frontend deployment**:
   - Create Static Site from `frontend` folder
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`

3. **Database**:
   - Create PostgreSQL database in Render
   - Update backend DATABASE_URL environment variable

**Pros**: Free PostgreSQL, automatic deploys, custom domains
**Cons**: Services spin down after inactivity

### 3. Vercel + PlanetScale/Supabase

For Jamstack deployment:

1. **Frontend on Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy frontend
   cd frontend
   vercel
   ```

2. **Backend options**:
   - **Vercel Serverless Functions** (requires refactoring)
   - **Railway/Render** for FastAPI backend
   - **Supabase** for backend-as-a-service

3. **Database**:
   - **PlanetScale** (MySQL)
   - **Supabase** (PostgreSQL)
   - **Neon** (PostgreSQL)

**Pros**: Fast CDN, automatic scaling
**Cons**: May require code changes for serverless

### 4. Heroku (Limited Free Tier)

**Note**: Heroku ended free tier in November 2022, but keeping for reference.

```bash
# Create Heroku apps
heroku create status-page-api
heroku create status-page-web

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd frontend
heroku buildpacks:add heroku/nodejs
git push heroku main
```

### 5. DigitalOcean App Platform

1. **Connect GitHub repo**
2. **Configure services**:
   - Backend: Python service with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Frontend: Static site with build command `npm run build`
3. **Add managed PostgreSQL database**

**Pros**: Professional platform, managed databases
**Cons**: Limited free tier

## Production Checklist

### Security
- [ ] Change default SECRET_KEY
- [ ] Use HTTPS in production
- [ ] Set up CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up proper authentication

### Performance
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize database queries

### Monitoring
- [ ] Set up health checks
- [ ] Configure logging
- [ ] Monitor application metrics
- [ ] Set up error tracking (Sentry)
- [ ] Monitor database performance

### Backup
- [ ] Set up database backups
- [ ] Test restore procedures
- [ ] Store backups securely
- [ ] Document backup strategy

### Scaling
- [ ] Configure horizontal scaling
- [ ] Set up load balancing
- [ ] Monitor resource usage
- [ ] Plan for database scaling

## Environment Variables for Production

```bash
# Required
SECRET_KEY=your-super-secure-key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
VITE_API_URL=https://your-api-domain.com

# Optional
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
LOG_LEVEL=INFO
RATE_LIMIT_PER_MINUTE=60

# Email notifications (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

2. **CORS issues**:
   - Update CORS_ORIGINS environment variable
   - Check frontend API URL configuration

3. **Build failures**:
   - Check Node.js/Python versions
   - Verify all dependencies are listed
   - Check build logs for specific errors

### Health Checks

```bash
# Backend health
curl https://your-api-domain.com/api/v1/health

# Frontend health
curl https://your-domain.com/health
```

### Logs

```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```
