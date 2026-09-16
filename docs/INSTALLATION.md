# Installation Guide

## Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- PostgreSQL 14+
- Google Cloud Project with Search Console API enabled

## Backend Setup

### 1. Clone and Install Dependencies
```bash
cd backend
npm install
# or
pip install -r requirements.txt
```

### 2. Environment Configuration
Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/appdeploy
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
JWT_SECRET=your_jwt_secret
API_PORT=5000
```

### 3. Database Initialization
```bash
npm run db:migrate
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configuration
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GSC_CLIENT_ID=your_client_id
```

### 3. Start Development Server
```bash
npm start
```

## Docker Setup (Recommended)

### Start All Services
```bash
docker-compose up -d
```

Access the application at `http://localhost:3000`
