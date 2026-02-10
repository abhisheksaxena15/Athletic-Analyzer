import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PerformanceService, PerformanceTrend, DatasetComparison, FitnessPrediction } from '../services/performanceService';
import { z } from 'zod';

export const performanceRoutes = Router();

const workoutAnalysisSchema = z.object({
  workoutType: z.enum(['Running', 'Cycling', 'Weightlifting', 'Other']),
  durationMin: z.number().positive(),
  avgHeartRate: z.number().positive(),
  distanceKm: z.number().positive().optional(),
  cadence: z.number().positive().optional(),
  workoutDate: z.string(),
});

// Analyze a single workout (manual data entry)
performanceRoutes.post('/analyze-workout', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!; // available if needed later
    const workoutInput = workoutAnalysisSchema.parse(req.body);

    const analysisResult = PerformanceService.analyzeWorkout(workoutInput , req.userId);

    res.json({
      workout: workoutInput,
      analysis: analysisResult,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to analyze workout',
    });
  }
});


// All performance routes require authentication
performanceRoutes.use(authenticate);

const analysisQuerySchema = z.object({
  sportType: z.enum(['running', 'cycling', 'weightlifting']),
  timeRange: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
});

// Get performance analysis
performanceRoutes.get('/analysis', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = analysisQuerySchema.parse(req.query);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (validated.timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Calculate metrics
    let metrics;
    try {
      metrics = PerformanceService.calculateMetrics(
        userId,
        validated.sportType,
        startDateStr,
        endDateStr
      );
    } catch (error: any) {
      console.error('Error calculating metrics:', error);
      // Return empty metrics if calculation fails
      metrics = {
        totalWorkouts: 0,
        totalDuration: 0,
        avgDuration: 0,
        trainingLoad: 0,
        fitnessScore: 0,
        progressTrend: 'stable' as const,
        progressPercentage: 0,
      };
    }

    // Get trends
    let trends: PerformanceTrend[] = [];
    try {
      trends = PerformanceService.getTrends(
        userId,
        validated.sportType,
        startDateStr,
        endDateStr,
        validated.timeRange === 'week' ? 'day' : validated.timeRange === 'month' ? 'week' : 'month'
      );
    } catch (error: any) {
      console.error('Error getting trends:', error);
      trends = [];
    }

    // Compare with dataset
    let comparisons: DatasetComparison[] = [];
    try {
      comparisons = PerformanceService.compareWithDataset(metrics, validated.sportType);
    } catch (error: any) {
      console.error('Error comparing with dataset:', error);
      comparisons = [];
    }

    // Get predictions
    let predictions: FitnessPrediction[] = [];
    try {
      predictions = PerformanceService.predictFitness(
        userId,
        validated.sportType,
        metrics,
        3 // 3 months
      );
    } catch (error: any) {
      console.error('Error generating predictions:', error);
      predictions = [];
    }

    res.json({
      metrics,
      trends,
      comparisons,
      predictions,
      period: {
        start: startDateStr,
        end: endDateStr,
        range: validated.timeRange,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message || 'Failed to analyze performance' });
  }
});

// Get performance trends only
performanceRoutes.get('/trends', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = analysisQuerySchema.parse(req.query);
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (validated.timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const trends = PerformanceService.getTrends(
      userId,
      validated.sportType,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      validated.timeRange === 'week' ? 'day' : validated.timeRange === 'month' ? 'week' : 'month'
    );

    res.json({ trends });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch trends' });
  }
});


