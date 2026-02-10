import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { SampleService, SampleInput } from '../services/sampleService';

export const sampleRoutes = Router();

sampleRoutes.use(authenticate);

const sampleItemSchema = z.object({
  timestamp: z.string(),
  activityId: z.number().optional(),
  heart_rate: z.number().optional(),
  hand_temp: z.number().optional(),
  chest_temp: z.number().optional(),
  ankle_temp: z.number().optional(),
  steps: z.number().optional(),
  distance: z.number().optional(),
  calories_burned: z.number().optional(),
  active_minutes: z.number().optional(),
  sleep_minutes: z.number().optional(),
  stress_level: z.number().optional(),
  acc_x: z.number().optional(),
  acc_y: z.number().optional(),
  acc_z: z.number().optional(),
  gyro_x: z.number().optional(),
  gyro_y: z.number().optional(),
  gyro_z: z.number().optional(),
});

const bulkSchema = z.object({
  items: z.array(sampleItemSchema).min(1),
});

sampleRoutes.post('/bulk', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const parsed = bulkSchema.parse(req.body);
    const count = SampleService.bulkInsert(userId, parsed.items as SampleInput[]);
    res.status(201).json({ message: 'Samples ingested', count });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Failed to ingest samples' });
  }
});
