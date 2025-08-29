#!/bin/bash

# Production startup script for Status Page Application

set -e

echo "🚀 Starting Status Page Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env with your production values"
    exit 1
fi

# Generate secret key if using default
if grep -q "your-secret-key-change-in-production" .env; then
    echo "🔑 Generating secure secret key..."
    python backend/generate_secret.py >> .env
    echo "✅ Secret key generated and added to .env"
fi

# Build and start services
echo "🐳 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🔍 Checking service health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

echo "🎉 Status Page Application is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"

# Show logs
docker-compose logs --tail=50
