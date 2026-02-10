import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { SleepService, SleepLogEntry } from '../services/sleepService';
import { z } from 'zod';

export const sleepRoutes = Router();

// All sleep routes require authentication
sleepRoutes.use(authenticate);

const sleepSchema = z.object({
  date: z.string().optional(),
  bedtime: z.string(),
  wakeTime: z.string(),
  totalSleep: z.number().positive(),
  deepSleep: z.number().positive().optional(),
  remSleep: z.number().positive().optional(),
  lightSleep: z.number().positive().optional(),
  sleepQuality: z.number().int().min(1).max(5),
  disturbances: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

// Create sleep log
sleepRoutes.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = sleepSchema.parse(req.body);
    
    // Ensure sleepQuality is 1-5
    const sleepData = {
      ...validated,
      sleepQuality: validated.sleepQuality as 1 | 2 | 3 | 4 | 5,
    };
    
    const sleepLog = SleepService.createSleepLog(userId, sleepData);

    res.status(201).json({
      message: 'Sleep log created successfully',
      sleepLog,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Failed to create sleep log' });
  }
});

// Get user sleep logs
sleepRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const sleepLogs = SleepService.getSleepLogsByUser(userId, limit, offset);

    res.json({
      sleepLogs,
      count: sleepLogs.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sleep logs' });
  }
});

// Get single sleep log
sleepRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const sleepLog = SleepService.getSleepLogById(req.params.id);
    
    if (!sleepLog || sleepLog.userId !== userId) {
      return res.status(404).json({ error: 'Sleep log not found' });
    }

    res.json({ sleepLog });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sleep log' });
  }
});

// Update sleep log
sleepRoutes.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = sleepSchema.partial().parse(req.body);
    
    // Ensure sleepQuality is 1-5 if provided
    const sleepData: Partial<SleepLogEntry> = validated.sleepQuality !== undefined 
      ? { ...validated, sleepQuality: validated.sleepQuality as 1 | 2 | 3 | 4 | 5 } as Partial<SleepLogEntry>
      : validated as Partial<SleepLogEntry>;
    
    const sleepLog = SleepService.updateSleepLog(req.params.id, userId, sleepData);

    res.json({
      message: 'Sleep log updated successfully',
      sleepLog,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Failed to update sleep log' });
  }
});

// Delete sleep log
sleepRoutes.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    SleepService.deleteSleepLog(req.params.id, userId);

    res.json({
      message: 'Sleep log deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete sleep log' });
  }
});


