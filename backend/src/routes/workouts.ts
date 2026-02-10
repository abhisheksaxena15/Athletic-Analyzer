import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { WorkoutService } from '../services/workoutService';
import { z } from 'zod';
import { mapWorkoutByType } from '../utils/workoutResponseMapper';

export const workoutRoutes = Router();





// All workout routes require authentication
workoutRoutes.use(authenticate);
const baseWorkoutSchema = z.object({
  date: z.string().optional(),
  timestamp: z.string().optional(),
  type: z.enum(['running', 'cycling', 'weightlifting', 'other']),
  activityId: z.number().optional(),
  duration: z.number().int().positive(),
  heartRate: z.number().int().positive().optional(),
  avgHeartRate: z.number().int().positive().optional(),
  maxHeartRate: z.number().int().positive().optional(),
  minHeartRate: z.number().int().positive().optional(),
  bodyTemperature: z.number().optional(),
  handTemp: z.number().optional(),
  chestTemp: z.number().optional(),
  ankleTemp: z.number().optional(),
  steps: z.number().int().positive().optional(),
  caloriesBurned: z.number().positive().optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  speed: z.number().positive().optional(),
  avgSpeed: z.number().positive().optional(),
  maxSpeed: z.number().positive().optional(),
  cadence: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  power: z.number().int().positive().optional(),
  avgPower: z.number().int().positive().optional(),
  maxPower: z.number().int().positive().optional(),
  cyclingCadence: z.number().int().positive().optional(),
  elevation: z.number().optional(),
  elevationGain: z.number().optional(),
  exerciseName: z.string().optional(),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  restTime: z.number().int().positive().optional(),
});

// const workoutSchema = z.object({
//   date: z.string().optional(),
//   timestamp: z.string().optional(),
//   type: z.enum(['running', 'cycling', 'weightlifting', 'other']),
//   activityId: z.number().optional(),
//   duration: z.number().int().positive(),
//   heartRate: z.number().int().positive().optional(),
//   avgHeartRate: z.number().int().positive().optional(),
//   maxHeartRate: z.number().int().positive().optional(),
//   minHeartRate: z.number().int().positive().optional(),
//   bodyTemperature: z.number().optional(),
//   handTemp: z.number().optional(),
//   chestTemp: z.number().optional(),
//   ankleTemp: z.number().optional(),
//   steps: z.number().int().positive().optional(),
//   caloriesBurned: z.number().positive().optional(),
//   stressLevel: z.number().int().min(1).max(10).optional(),
//   notes: z.string().optional(),
//   latitude: z.number().optional(),
//   longitude: z.number().optional(),
//   speed: z.number().positive().optional(),
//   avgSpeed: z.number().positive().optional(),
//   maxSpeed: z.number().positive().optional(),
//   cadence: z.number().int().positive().optional(),
//   distance: z.number().positive().optional(),
//   power: z.number().int().positive().optional(),
//   avgPower: z.number().int().positive().optional(),
//   maxPower: z.number().int().positive().optional(),
//   cyclingCadence: z.number().int().positive().optional(),
//   elevation: z.number().optional(),
//   elevationGain: z.number().optional(),
//   exerciseName: z.string().optional(),
//   sets: z.number().int().positive().optional(),
//   reps: z.number().int().positive().optional(),
//   weight: z.number().positive().optional(),
//   restTime: z.number().int().positive().optional(),
// });
const runningSchema = baseWorkoutSchema.extend({
  type: z.literal('running'),
  distance: z.number().positive(),
});

const cyclingSchema = baseWorkoutSchema.extend({
  type: z.literal('cycling'),
  distance: z.number().positive(),
  avgHeartRate: z.number().positive(),
});

const weightliftingSchema = baseWorkoutSchema.extend({
  type: z.literal('weightlifting'),
  sets: z.number().positive(),
  reps: z.number().positive(),
  weight: z.number().positive(),
});

const workoutSchema = z.discriminatedUnion('type', [
  runningSchema,
  cyclingSchema,
  weightliftingSchema,
  baseWorkoutSchema.extend({
    type: z.literal('other'),
  }),
]);
const otherSchema = baseWorkoutSchema.extend({
  type: z.literal('other'),
});

// Create workout entry
workoutRoutes.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = workoutSchema.parse(req.body);
    
    const workout = WorkoutService.createWorkout(userId, validated);

    res.status(201).json({
      message: 'Workout logged successfully',
      workout,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Failed to create workout' });
  }
});

// Get user workouts
workoutRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const workouts = WorkoutService.getWorkoutsByUser(userId, limit, offset);

    res.json({
      workouts: workouts.map(mapWorkoutByType),
      count: workouts.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch workouts' });
  }
});

// Get single workout

// Update workout
workoutRoutes.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = workoutSchema.partial().parse(req.body);
    
    const workout = WorkoutService.updateWorkout(req.params.id, userId, validated);

    res.json({
      message: 'Workout updated successfully',
      workout,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Failed to update workout' });
  }
});

// Delete workout
workoutRoutes.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    WorkoutService.deleteWorkout(req.params.id, userId);

    res.json({
      message: 'Workout deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete workout' });
  }
});



