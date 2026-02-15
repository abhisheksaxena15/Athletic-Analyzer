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
// All performance routes require authentication
performanceRoutes.use(authenticate);
// Analyze a single workout (manual data entry)
performanceRoutes.post('/analyze-workout', async (req: AuthRequest, res: Response) => {
  try {
    const workoutInput = workoutAnalysisSchema.parse(req.body);

    const analysisResult = PerformanceService.analyzeWorkout(
      workoutInput,
      req.userId // ✅ now available
    );

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
    const spikeInfo = PerformanceService.detectLoadSpike(trends);


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
    const insights = PerformanceService.generateTrainingInsights(
      metrics,
      metrics.trainingLoad > 0 ? metrics.trainingLoad / 100 : 1
    );


    res.json({
      metrics,
      trends,
      comparisons,
      predictions,
      insights,   // ✅ new addition
      spikeInfo,   // ✅ new addition
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

  // ✅ Export all workouts (for Jupyter analysis)
  

});

performanceRoutes.get('/export-workouts', async (req: AuthRequest, res: Response) => {
    console.log('🔥 EXPORT WORKOUTS ROUTE HIT');

    try {
      console.log('User ID:', req.userId);

      const userId = req.userId!;
      const workouts = PerformanceService.getAllWorkoutsForUser(userId);

      console.log('Workout count:', workouts.length);

      res.json({
        count: workouts.length,
        workouts
      });

    } catch (error: any) {
      console.error('EXPORT ERROR:', error);
      res.status(500).json({
        error: error.message || 'Failed to export workouts'
      });
    }
  });
// {
//     "workout": {
//         "workoutType": "Running",
//         "durationMin": 70,
//         "avgHeartRate": 155,
//         "distanceKm": 8,
//         "workoutDate": "2026-02-09"
//     },
//     "analysis": {
//         "engineeredMetrics": {
//             "sessionLoad": 108.5,
//             "gameWorkload": 108.5,
//             "trainingIntensity": 1.55,
//             "speedIndex": 6.857142857142857
//         },
//         "workload": {
//             "acuteAvg": 108.5,
//             "chronicAvg": 108.5,
//             "acwr": 1,
//             "acwrZone": "Optimal"
//         }
//     }
// }


/*
{
    "metrics": {
        "totalWorkouts": 14,
        "totalDuration": 770,
        "totalDistance": 102,
        "avgDuration": 55,
        "avgDistance": 7.285714285714286,
        "avgCadence": 168.75,
        "avgHeartRate": 144.28571428571428,
        "maxHeartRate": 144.28571428571428,
        "minHeartRate": 144.28571428571428,
        "trainingLoad": 385,
        "fitnessScore": 40,
        "progressTrend": "stable",
        "progressPercentage": 0
    },
    "trends": [
        {
            "date": "2026-01-25",
            "distance": 5,
            "heartRate": 135,
            "trainingLoad": 20
        },
        {
            "date": "2026-02-01",
            "distance": 37,
            "cadence": 165,
            "heartRate": 137.14285714285714,
            "trainingLoad": 142.5
        },
        {
            "date": "2026-02-08",
            "distance": 60,
            "cadence": 171,
            "heartRate": 154.16666666666666,
            "trainingLoad": 222.5
        }
    ],
    "comparisons": [
        {
            "metric": "Average Cadence",
            "userValue": 168.75,
            "datasetAverage": 165,
            "datasetPercentile": 75,
            "comparison": "above_average",
            "difference": 2.272727272727273
        },
        {
            "metric": "Average Heart Rate",
            "userValue": 144.28571428571428,
            "datasetAverage": 150,
            "datasetPercentile": 50,
            "comparison": "average",
            "difference": -3.8095238095238146
        }
    ],
    "predictions": [
        {
            "metric": "Fitness Score",
            "currentValue": 40,
            "predictedValue": 88,
            "timeframe": "3 months",
            "confidence": 24,
            "factors": [
                "Current score: 40/100",
                "Progress trend: stable",
                "Training consistency: 14 workouts"
            ]
        }
    ],
    "insights": {
        "fatigueScore": 100,
        "riskLevel": "High",
        "recommendation": "Reduce training intensity immediately.",
        "advice": "High risk of overtraining. Prioritize recovery."
    },
    "period": {
        "start": "2026-01-11",
        "end": "2026-02-11",
        "range": "month"
    }
} */