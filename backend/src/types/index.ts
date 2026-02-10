export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  googleId: string | null;
  authProvider: 'email' | 'phone' | 'google';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  gender: 'male' | 'female' | 'other' | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete' | null;
  sports: string[];
  weeklyWorkouts: string | null;
  primaryGoal: string | null;
  dietType: string | null;
  allergies: string[];
  hydrationGoal: number | null;
  experienceLevel: string | null;
  injuries: string | null;
  medications: string | null;
  sleepHours: number | null;
  stressLevel: string | null;
  targetWeight: number | null;
  targetDistance: number | null;
  targetTime: number | null;
  mealPreference: string | null;
  restingHeartRate: number | null;
  bodyTemperature: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  authProvider: 'email' | 'phone' | 'google';
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface UpdateProfileRequest {
  age?: number;
  height?: number;
  weight?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';
  sports?: string[];
  weeklyWorkouts?: string;
  primaryGoal?: string;
  dietType?: string;
  allergies?: string[];
  hydrationGoal?: number;
  experienceLevel?: string;
  injuries?: string;
  medications?: string;
  sleepHours?: number;
  stressLevel?: string;
  targetWeight?: number;
  targetDistance?: number;
  targetTime?: number;
  mealPreference?: string;
  restingHeartRate?: number;
  bodyTemperature?: number;
}


export interface WorkoutInput {
  workoutType: 'Running' | 'Cycling' | 'Weightlifting' | 'Other';
  durationMin: number;
  avgHeartRate: number;
  distanceKm?: number;
  cadence?: number;
  workoutDate: string;
}


export interface EngineeredMetrics {
  sessionLoad: number;
  gameWorkload: number;
  trainingIntensity: number;
  speedIndex?: number;
}
