# Athlete Performance Analysis - Backend API

Backend API server for the AI-Driven Athlete Performance Analysis and Recommendation System.

## Features

- User registration with email, phone, or Google OAuth
- User authentication with JWT tokens
- User profile management (CRUD operations)
- Secure password hashing with bcrypt
- SQLite database (easily migratable to PostgreSQL)

## Setup

### Prerequisites

- Node.js 18+ and npm
- TypeScript

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set `JWT_SECRET` to a secure random string
   - Set `FRONTEND_URL` to your frontend URL (default: http://localhost:5173)
   - Configure Google OAuth credentials if using Google login

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, email?, phone?, password?, authProvider }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email?, phone?, password }`

### Profile

- `GET /api/profile/me` - Get current user profile (requires auth)
- `PUT /api/profile/me` - Update user profile (requires auth)
- `DELETE /api/profile/me` - Delete user account (requires auth)

### Health Check

- `GET /api/health` - Server health check

## Database

The application uses SQLite by default. The database file is created at `./data/athlete_performance.db` on first run.

### Database Schema

- **users**: User accounts and authentication info
- **user_profiles**: Extended user profile information

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)
- `DATABASE_PATH` - Path to SQLite database file
- `FRONTEND_URL` - Frontend URL for CORS
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS enabled for frontend
- Input validation with Zod
- SQL injection protection with parameterized queries

## Development

The backend uses:
- Express.js for the web framework
- TypeScript for type safety
- SQLite (better-sqlite3) for the database
- JWT for authentication
- Zod for validation


