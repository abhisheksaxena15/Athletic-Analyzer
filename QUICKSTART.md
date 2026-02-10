# Quick Start Guide

## First Time Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/athlete_performance.db
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

Backend will be available at: http://localhost:3001

### 2. Frontend Setup

```bash
cd frontend
npm install
```

(Optional) Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

Start frontend:
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## Testing the Implementation

### 1. Register a New User

1. Navigate to http://localhost:5173/auth/register
2. Fill in:
   - Full Name
   - Email (or Phone)
   - Password (min 6 characters)
   - Confirm Password
3. Click "Create Account"
4. You should be redirected to the onboarding page

### 2. Complete Onboarding

1. Fill in your personal information
2. Complete all 5 steps
3. Click "Complete Setup"
4. Profile data will be saved to the database
5. You'll be redirected to the dashboard

### 3. View/Edit Profile

1. Navigate to http://localhost:5173/profile
2. Click "Edit Profile"
3. Make changes
4. Click "Save Changes"
5. Changes will be saved to the database

### 4. Login

1. Navigate to http://localhost:5173/auth/login
2. Enter your email/phone and password
3. Click "Sign In"
4. You'll be logged in and redirected to the dashboard

## API Testing with curl

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "authProvider": "email"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with token from login)
```bash
curl -X GET http://localhost:3001/api/profile/me \
  -H "Authorization: Bearer TOKEN"
```

## Database Location

The SQLite database is created at: `backend/data/athlete_performance.db`

You can inspect it using any SQLite browser or command-line tool:
```bash
sqlite3 backend/data/athlete_performance.db
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify Node.js version is 18+
- Check `.env` file exists and has valid values

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Check CORS settings in backend

### Database errors
- Delete `backend/data/athlete_performance.db` to reset database
- Restart backend server

### Authentication errors
- Check JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header
- Check token hasn't expired




