# 🚀 Free Hosting Deployment Guide

## Recommended: Railway (Best for Full-Stack Apps)

**Why Railway?** 
- ✅ Free tier with 500 hours/month
- ✅ Built-in PostgreSQL database
- ✅ One-click deploy from GitHub
- ✅ Environment variables management
- ✅ Custom domains
- ✅ Automatic HTTPS

### Step-by-Step Railway Deployment

1. **Prepare your repo**:
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Add Services**:
   - **Backend**: Railway will auto-detect Python/FastAPI
   - **Frontend**: Add as separate service
   - **Database**: Add PostgreSQL service

4. **Configure Environment Variables**:
   
   **Backend Service**:
   ```
   SECRET_KEY=<generate-new-secret>
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   CORS_ORIGINS=https://your-frontend-url.railway.app
   DEBUG=false
   ```

   **Frontend Service**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

5. **Deploy Commands**:
   
   **Backend** (Railway auto-detects):
   ```
   Build: pip install -r requirements.txt
   Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

   **Frontend**:
   ```
   Build: npm install && npm run build
   Start: npm run serve
   ```

### Alternative: Render

1. **Backend on Render**:
   - Go to [render.com](https://render.com)
   - Create Web Service from GitHub
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Frontend on Render**:
   - Create Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **Database**:
   - Add PostgreSQL database
   - Copy connection string to backend env vars

## Quick Local Docker Test

```bash
# Test your production build locally
docker-compose up --build
```

## Post-Deployment Checklist

- [ ] Update CORS origins with production URLs
- [ ] Generate secure SECRET_KEY
- [ ] Set DEBUG=false
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Test all functionality

## Cost Comparison

| Platform | Free Tier | Database | Custom Domain | HTTPS |
|----------|-----------|----------|---------------|--------|
| Railway | 500h/month | PostgreSQL ✅ | ✅ | ✅ |
| Render | 750h/month | PostgreSQL ✅ | ✅ | ✅ |
| Vercel | Unlimited | External only | ✅ | ✅ |
| Netlify | 100GB/month | External only | ✅ | ✅ |

## Production URLs Example

After deployment, your app will be available at:
- **Frontend**: `https://status-page-frontend.railway.app`
- **Backend API**: `https://status-page-backend.railway.app`
- **API Docs**: `https://status-page-backend.railway.app/docs`

## Need Help?

1. Check the logs in your hosting platform dashboard
2. Verify environment variables are set correctly  
3. Test API endpoints with curl or Postman
4. Check CORS configuration if frontend can't reach backend

Your Status Page Application is now production-ready! 🎉
