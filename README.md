# AI-Driven Athlete Performance Analysis and Recommendation System

A comprehensive mobile/web application that helps athletes and general users analyze their physical performance, sleep quality, injury risk, and overall fitness based on inputs collected manually or from smartwatches.

## Features

### ✅ Implemented (Requirement 3.1)

- **User Registration & Profile Management**
  - User registration with email, phone, or Google login (FR-101)
  - Personal information entry (age, height, weight, gender, fitness level) (FR-102)
  - Profile update and delete functionality (FR-103)
  - Secure database storage (FR-104)

### 🚧 In Progress

- Smartwatch Data Input / Manual Input (FR-201-205)
- Performance Analysis (FR-301-305)
- Sleep Quality Analysis (FR-401-404)
- Injury Risk Prediction (FR-501-505)
- Personalized Training Plan Generator (FR-601-605)
- Diet Recommendation System (FR-701-705)

## Project Structure

```
EP-02/
├── backend/              # Node.js/Express backend API
│   ├── src/
│   │   ├── database/     # Database initialization
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth middleware
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript types
│   └── package.json
├── frontend/            # React/TypeScript frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/     # API service layer
│   │   └── types/        # TypeScript types
│   └── package.json
└── ml_assets/           # ML datasets and models
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TypeScript (installed via npm)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
   - Set a secure `JWT_SECRET`
   - Configure `FRONTEND_URL` (default: http://localhost:5173)

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
# Create .env file with:
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: {
  name: string,
  email?: string,
  phone?: string,
  password?: string,
  authProvider: 'email' | 'phone' | 'google'
}
```

#### Login
```
POST /api/auth/login
Body: {
  email?: string,
  phone?: string,
  password: string
}
```

### Profile Endpoints (Requires Authentication)

#### Get Profile
```
GET /api/profile/me
Headers: Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/profile/me
Headers: Authorization: Bearer <token>
Body: {
  age?: number,
  height?: number,
  weight?: number,
  gender?: 'male' | 'female' | 'other',
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete',
  sports?: string[],
  weeklyWorkouts?: string,
  primaryGoal?: string,
  dietType?: string,
  allergies?: string[],
  hydrationGoal?: number,
  // ... other profile fields
}
```

#### Delete Account
```
DELETE /api/profile/me
Headers: Authorization: Bearer <token>
```

## Database

The application uses SQLite by default. The database is automatically created on first run at `backend/data/athlete_performance.db`.

### Database Schema

- **users**: Stores user accounts and authentication information
- **user_profiles**: Stores extended user profile data

## Technology Stack

### Backend
- Node.js with Express
- TypeScript
- SQLite (better-sqlite3)
- JWT for authentication
- bcrypt for password hashing
- Zod for validation

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- shadcn/ui components
- Tailwind CSS
- TanStack Query

## Development Roadmap

1. ✅ **User Registration & Profile Management** (Completed)
2. ⏳ **Smartwatch Data Input / Manual Input**
3. ⏳ **Performance Analysis**
4. ⏳ **Sleep Quality Analysis**
5. ⏳ **Injury Risk Prediction**
6. ⏳ **Personalized Training Plan Generator**
7. ⏳ **Diet Recommendation System**

## Contributing

This project is being developed incrementally, feature by feature. Each requirement section (3.1, 3.2, etc.) is implemented and tested before moving to the next.

## License

ISC

