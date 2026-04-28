# SafeZone — Crime & Anomaly Detection System

A full-stack AI-powered crime reporting and anomaly detection platform.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Mapbox GL JS, Recharts
- **Backend**: Node.js, Express, Socket.IO, JWT, PostgreSQL + PostGIS
- **ML Service**: Python, FastAPI, scikit-learn (DBSCAN + Isolation Forest)

## Live Demo
- Frontend: https://safezone.vercel.app
- Backend API: https://safezone-api.onrender.com

## Features
- Anonymous crime incident reporting
- Real-time anomaly detection using Isolation Forest
- Crime hotspot clustering using DBSCAN
- Live heatmap dashboard for authorities
- Role-based access (citizen, authority, admin)
- Real-time alerts via Socket.IO

## Local Setup

### 1. Database
psql -U postgres -c "CREATE DATABASE safezone;"
psql -U postgres -d safezone -f schema.sql

### 2. Backend
cd server
cp .env.example .env
npm install
npm run dev

### 3. ML Service
cd ml_service
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload

### 4. Frontend
cd client
npm install
npm run dev

## Environment Variables

### server/.env
DATABASE_URL=postgresql://...
JWT_SECRET=...
ML_SERVICE_URL=http://localhost:8001
CLIENT_URL=https://safezone.vercel.app

### client/.env.local
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=...
