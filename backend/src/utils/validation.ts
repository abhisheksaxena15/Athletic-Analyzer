import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  authProvider: z.enum(['email', 'phone', 'google']),
}).refine(
  (data) => {
    if (data.authProvider === 'email') {
      return !!data.email && !!data.password;
    }
    if (data.authProvider === 'phone') {
      return !!data.phone && !!data.password;
    }
    if (data.authProvider === 'google') {
      return !!data.email;
    }
    return true;
  },
  {
    message: 'Email/phone and password are required for email/phone registration',
  }
);

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone must be provided',
  }
);

export const updateProfileSchema = z.object({
  age: z.number().int().min(1).max(150).optional(),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(500).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active', 'athlete']).optional(),
  sports: z.array(z.string()).optional(),
  weeklyWorkouts: z.string().optional(),
  primaryGoal: z.string().optional(),
  dietType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  hydrationGoal: z.number().positive().optional(),
  experienceLevel: z.string().optional(),
  injuries: z.string().optional(),
  medications: z.string().optional(),
  sleepHours: z.number().positive().max(24).optional(),
  stressLevel: z.string().optional(),
  targetWeight: z.number().positive().optional(),
  targetDistance: z.number().positive().optional(),
  targetTime: z.number().int().positive().optional(),
  mealPreference: z.string().optional(),
});




