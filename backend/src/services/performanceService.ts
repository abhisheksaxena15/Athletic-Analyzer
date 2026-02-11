import { db } from '../database/init';
import { WorkoutService, WorkoutEntry } from './workoutService';
import { engineerWorkoutFeatures } from './featureEngineering';
import { WorkoutInput } from '../types';
console.log('🔥 PERFORMANCE SERVICE LOADED 🔥');

export interface EngineeredWorkoutMetrics {
  sessionLoad: number;
  gameWorkload: number;
  trainingIntensity: number;
  speedIndex?: number;
}
export interface PerformanceMetrics {
  // Basic metrics
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalDistance?: number; // km
  avgDuration: number;
  avgDistance?: number;
  
  // Running metrics
  avgPace?: number; // min/km
  avgSpeed?: number; // km/h
  maxSpeed?: number;
  avgCadence?: number; // steps/min
  bestPace?: number; // min/km (fastest)
  
  // Cycling metrics
  avgPower?: number; // watts
  maxPower?: number;
  avgCyclingCadence?: number; // rpm
  totalElevationGain?: number; // meters
  
  // Weightlifting metrics
  totalVolume?: number; // kg
  avgVolume?: number;
  exercisesCount?: number;
  
  // Heart rate metrics
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  
  // Training load
  trainingLoad: number; // calculated score
  trainingStressScore?: number;
  
  // Progress indicators
  fitnessScore: number; // 0-100
  progressTrend: 'improving' | 'stable' | 'declining';
  progressPercentage: number; // % change from previous period
}

export interface PerformanceTrend {
  date: string;
  pace?: number;
  speed?: number;
  distance?: number;
  cadence?: number;
  heartRate?: number;
  power?: number;
  trainingLoad: number;
}

export interface DatasetComparison {
  metric: string;
  userValue: number;
  datasetAverage: number;
  datasetPercentile: number; // 0-100
  comparison: 'above_average' | 'average' | 'below_average';
  difference: number; // percentage
}

export interface FitnessPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string; // e.g., "3 months"
  confidence: number; // 0-100
  factors: string[];
}

export class PerformanceService {
  static generateTrainingInsights(
  metrics: PerformanceMetrics,
  acwr: number
) {
  let fatigueScore = 0;
  let riskLevel = 'Low';
  let recommendation = 'Maintain current training load.';
  let advice = 'You are training consistently. Keep monitoring recovery.';

  // Fatigue calculation (0-100)
  fatigueScore = Math.min(
    100,
    (metrics.trainingLoad / 10) +
    (acwr * 20)
  );

  // Risk logic
  if (acwr > 1.5) {
    riskLevel = 'High';
    recommendation = 'Reduce training intensity immediately.';
    advice = 'High risk of overtraining. Prioritize recovery.';
  } else if (acwr > 1.3) {
    riskLevel = 'Moderate';
    recommendation = 'Monitor fatigue closely.';
    advice = 'Slight overload detected. Consider lighter session.';
  } else if (acwr < 0.8) {
    riskLevel = 'Undertraining';
    recommendation = 'Increase training stimulus gradually.';
    advice = 'Training load is low. You may not improve optimally.';
  }

  return {
    fatigueScore: Number(fatigueScore.toFixed(2)),
    riskLevel,
    recommendation,
    advice,
  };
}



  // STEP-4: Analyze a single workout with ACWR
static analyzeWorkout(workout: WorkoutInput, userId?: string) {
  const engineeredMetrics = engineerWorkoutFeatures(workout);

  // --- Historical workloads (exclude current workout date) ---
  // const acuteLoad = userId
  //   ? this.getWorkloadLastNDays(
  //       userId,
  //       7,
  //       workout.workoutDate
  //     ) + engineeredMetrics.gameWorkload
  //   : engineeredMetrics.gameWorkload;

  // const chronicLoad = userId
  //   ? this.getWorkloadLastNDays(
  //       userId,
  //       28,
  //       workout.workoutDate
  //     ) / 4 || acuteLoad
  //   : acuteLoad;

  // const acwr = this.calculateACWR(acuteLoad, chronicLoad);
  // STEP-4: ACWR using AVERAGES (correct method)

const acuteAvg = userId
  ? (this.getWorkloadLastNDays(
      userId,
      7,
new Date().toISOString()    ) + engineeredMetrics.gameWorkload) / 7
  : engineeredMetrics.gameWorkload;

const chronicAvg = userId
  ? this.getWorkloadLastNDays(
      userId,
      28,
      workout.workoutDate
    ) / 28
  : acuteAvg;

// Safety fallback
const safeChronic = chronicAvg === 0 ? acuteAvg : chronicAvg;

const acwr = Number((acuteAvg / safeChronic).toFixed(2));
const acwrZone = this.getACWRZone(acwr);
;

  return {
    engineeredMetrics,
    workload: {
      acuteAvg,
      chronicAvg,
      acwr,
      acwrZone,
    },
  };
}




  // Calculate performance metrics for a user and sport type
  
  static calculateMetrics(
    userId: string,
    sportType: 'running' | 'cycling' | 'weightlifting',
    startDate: string,
    endDate: string
  ): PerformanceMetrics {
    
    const workouts = WorkoutService.getWorkoutsByUser(userId, 1000, 0);
    
    // Filter by date range and sport type
    const filteredWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return w.type === sportType && workoutDate >= start && workoutDate <= end;
    });

    if (filteredWorkouts.length === 0) {
      return this.getEmptyMetrics();
    }

    // Basic calculations
    const totalWorkouts = filteredWorkouts.length;
    const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const avgDuration = totalDuration / totalWorkouts;

    // Distance calculations
    const distances = filteredWorkouts.map(w => w.distance).filter(d => d !== null && d !== undefined) as number[];
    const totalDistance = distances.reduce((sum, d) => sum + d, 0);
    const avgDistance = distances.length > 0 ? totalDistance / distances.length : undefined;

    // Running metrics
    const speeds = filteredWorkouts.map(w => w.speed || w.avgSpeed).filter(s => s !== null && s !== undefined) as number[];
    const avgSpeed = speeds.length > 0 ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length : undefined;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : undefined;
    const avgPace = avgSpeed ? 60 / avgSpeed : undefined; // min/km
    const bestPace = maxSpeed ? 60 / maxSpeed : undefined;

    const cadences = filteredWorkouts.map(w => w.cadence).filter(c => c !== null && c !== undefined) as number[];
    const avgCadence = cadences.length > 0 ? cadences.reduce((sum, c) => sum + c, 0) / cadences.length : undefined;

    // Cycling metrics
    const powers = filteredWorkouts.map(w => w.power || w.avgPower).filter(p => p !== null && p !== undefined) as number[];
    const avgPower = powers.length > 0 ? powers.reduce((sum, p) => sum + p, 0) / powers.length : undefined;
    const maxPower = powers.length > 0 ? Math.max(...powers) : undefined;

    const cyclingCadences = filteredWorkouts.map(w => w.cyclingCadence).filter(c => c !== null && c !== undefined) as number[];
    const avgCyclingCadence = cyclingCadences.length > 0 
      ? cyclingCadences.reduce((sum, c) => sum + c, 0) / cyclingCadences.length 
      : undefined;

    const elevationGains = filteredWorkouts.map(w => w.elevationGain).filter(e => e !== null && e !== undefined) as number[];
    const totalElevationGain = elevationGains.reduce((sum, e) => sum + e, 0);

    // Weightlifting metrics
    const volumes = filteredWorkouts.map(w => w.volume).filter(v => v !== null && v !== undefined) as number[];
    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
    const avgVolume = volumes.length > 0 ? totalVolume / volumes.length : undefined;
    const exercisesCount = filteredWorkouts.filter(w => w.exerciseName).length;

    // Heart rate metrics
    const heartRates = filteredWorkouts
      .map(w => w.avgHeartRate || w.heartRate)
      .filter(hr => hr !== null && hr !== undefined) as number[];
    const avgHeartRate = heartRates.length > 0 
      ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length 
      : undefined;

    const maxHeartRates = filteredWorkouts.map(w => w.maxHeartRate).filter(hr => hr !== null && hr !== undefined) as number[];
    const maxHeartRate = maxHeartRates.length > 0 ? Math.max(...maxHeartRates) : avgHeartRate;

    const minHeartRates = filteredWorkouts.map(w => w.minHeartRate).filter(hr => hr !== null && hr !== undefined) as number[];
    const minHeartRate = minHeartRates.length > 0 ? Math.min(...minHeartRates) : avgHeartRate;

    // Training load calculation (simplified TSS-like score)
    const trainingLoad = this.calculateTrainingLoad(filteredWorkouts, sportType);

    // Fitness score (0-100)
    const fitnessScore = this.calculateFitnessScore(filteredWorkouts, sportType, avgSpeed, avgPower, avgCadence);

    // Progress trend (compare with previous period)
    let progressTrend: 'improving' | 'stable' | 'declining' = 'stable';
    let progressPercentage = 0;
    try {
      const previousPeriod = this.getPreviousPeriod(startDate, endDate);
      const previousMetrics = this.calculateMetrics(userId, sportType, previousPeriod.start, previousPeriod.end);
      progressTrend = this.determineTrend(fitnessScore, previousMetrics.fitnessScore);
      progressPercentage = previousMetrics.fitnessScore > 0
        ? ((fitnessScore - previousMetrics.fitnessScore) / previousMetrics.fitnessScore) * 100
        : 0;
    } catch (error) {
      // If previous period calculation fails, default to stable
      console.error('Error calculating previous period metrics:', error);
      progressTrend = 'stable';
      progressPercentage = 0;
    }

    return {
      totalWorkouts,
      totalDuration,
      totalDistance,
      avgDuration,
      avgDistance,
      avgPace,
      avgSpeed,
      maxSpeed,
      avgCadence,
      bestPace,
      avgPower,
      maxPower,
      avgCyclingCadence,
      totalElevationGain: totalElevationGain > 0 ? totalElevationGain : undefined,
      totalVolume: totalVolume > 0 ? totalVolume : undefined,
      avgVolume,
      exercisesCount: exercisesCount > 0 ? exercisesCount : undefined,
      avgHeartRate,
      maxHeartRate,
      minHeartRate,
      trainingLoad,
      fitnessScore,
      progressTrend,
      progressPercentage,
    };
  }

  // Get performance trends over time
  static getTrends(
    userId: string,
    sportType: 'running' | 'cycling' | 'weightlifting',
    startDate: string,
    endDate: string,
    interval: 'day' | 'week' | 'month' = 'week'
  ): PerformanceTrend[] {
    try {
      const workouts = WorkoutService.getWorkoutsByUser(userId, 1000, 0);
      
      const filteredWorkouts = workouts.filter(w => {
        try {
          const workoutDate = new Date(w.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return w.type === sportType && workoutDate >= start && workoutDate <= end;
        } catch (error) {
          return false;
        }
      });

      if (filteredWorkouts.length === 0) {
        return [];
      }

      // Group by interval
      const grouped = this.groupWorkoutsByInterval(filteredWorkouts, interval);
      
      return grouped.map(group => {
        try {
          const speeds = group.workouts.map(w => w.speed || w.avgSpeed).filter(s => s !== null && s !== undefined) as number[];
          const avgSpeed = speeds.length > 0 ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length : undefined;
          const avgPace = avgSpeed ? 60 / avgSpeed : undefined;

          const cadences = group.workouts.map(w => w.cadence).filter(c => c !== null && c !== undefined) as number[];
          const avgCadence = cadences.length > 0 ? cadences.reduce((sum, c) => sum + c, 0) / cadences.length : undefined;

          const heartRates = group.workouts.map(w => w.avgHeartRate || w.heartRate).filter(hr => hr !== null && hr !== undefined) as number[];
          const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length : undefined;

          const powers = group.workouts.map(w => w.power || w.avgPower).filter(p => p !== null && p !== undefined) as number[];
          const avgPower = powers.length > 0 ? powers.reduce((sum, p) => sum + p, 0) / powers.length : undefined;

          const distances = group.workouts.map(w => w.distance).filter(d => d !== null && d !== undefined) as number[];
          const totalDistance = distances.length > 0 ? distances.reduce((sum, d) => sum + d, 0) : 0;

          const trainingLoad = this.calculateTrainingLoad(group.workouts, sportType);

          return {
            date: group.date,
            pace: avgPace,
            speed: avgSpeed,
            distance: totalDistance > 0 ? totalDistance : undefined,
            cadence: avgCadence,
            heartRate: avgHeartRate,
            power: avgPower,
            trainingLoad,
          };
        } catch (error) {
          // Return minimal trend data if calculation fails
          return {
            date: group.date,
            trainingLoad: 0,
          };
        }
      });
    } catch (error) {
      console.error('Error in getTrends:', error);
      return [];
    }
  }

  // Compare user metrics with dataset
  static compareWithDataset(
    userMetrics: PerformanceMetrics,
    sportType: 'running' | 'cycling' | 'weightlifting'
  ): DatasetComparison[] {
    // Dataset benchmarks (based on typical values)
    const benchmarks = this.getDatasetBenchmarks(sportType);
    const comparisons: DatasetComparison[] = [];

    if (sportType === 'running') {
      if (userMetrics.avgPace) {
        const datasetAvgPace = benchmarks.avgPace;
        const percentile = this.calculatePercentile(userMetrics.avgPace, datasetAvgPace, true); // lower is better for pace
        comparisons.push({
          metric: 'Average Pace',
          userValue: userMetrics.avgPace,
          datasetAverage: datasetAvgPace,
          datasetPercentile: percentile,
          comparison: userMetrics.avgPace < datasetAvgPace ? 'above_average' : userMetrics.avgPace > datasetAvgPace * 1.2 ? 'below_average' : 'average',
          difference: ((datasetAvgPace - userMetrics.avgPace) / datasetAvgPace) * 100,
        });
      }

      if (userMetrics.avgCadence && benchmarks.avgCadence) {
        const datasetAvgCadence = benchmarks.avgCadence;
        const percentile = this.calculatePercentile(userMetrics.avgCadence, datasetAvgCadence, false);
        comparisons.push({
          metric: 'Average Cadence',
          userValue: userMetrics.avgCadence,
          datasetAverage: datasetAvgCadence,
          datasetPercentile: percentile,
          comparison: userMetrics.avgCadence > datasetAvgCadence ? 'above_average' : userMetrics.avgCadence < datasetAvgCadence * 0.9 ? 'below_average' : 'average',
          difference: ((userMetrics.avgCadence - datasetAvgCadence) / datasetAvgCadence) * 100,
        });
      }
    }

    if (sportType === 'cycling') {
      if (userMetrics.avgPower && benchmarks.avgPower) {
        const datasetAvgPower = benchmarks.avgPower;
        const percentile = this.calculatePercentile(userMetrics.avgPower, datasetAvgPower, false);
        comparisons.push({
          metric: 'Average Power',
          userValue: userMetrics.avgPower,
          datasetAverage: datasetAvgPower,
          datasetPercentile: percentile,
          comparison: userMetrics.avgPower > datasetAvgPower ? 'above_average' : userMetrics.avgPower < datasetAvgPower * 0.8 ? 'below_average' : 'average',
          difference: ((userMetrics.avgPower - datasetAvgPower) / datasetAvgPower) * 100,
        });
      }
    }

    if (userMetrics.avgHeartRate && benchmarks.avgHeartRate) {
      const datasetAvgHR = benchmarks.avgHeartRate;
      const percentile = this.calculatePercentile(userMetrics.avgHeartRate, datasetAvgHR, false);
      comparisons.push({
        metric: 'Average Heart Rate',
        userValue: userMetrics.avgHeartRate,
        datasetAverage: datasetAvgHR,
        datasetPercentile: percentile,
        comparison: userMetrics.avgHeartRate > datasetAvgHR ? 'above_average' : userMetrics.avgHeartRate < datasetAvgHR * 0.9 ? 'below_average' : 'average',
        difference: ((userMetrics.avgHeartRate - datasetAvgHR) / datasetAvgHR) * 100,
      });
    }

    return comparisons;
  }

  // Predict fitness progression
  static predictFitness(
    userId: string,
    sportType: 'running' | 'cycling' | 'weightlifting',
    currentMetrics: PerformanceMetrics,
    timeframe: number = 3 // months
  ): FitnessPrediction[] {
    const predictions: FitnessPrediction[] = [];

    // Get historical data for trend analysis
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - timeframe);
    const historicalStart = startDate.toISOString().split('T')[0];

    const trends = this.getTrends(userId, sportType, historicalStart, endDate, 'week');
    
    if (trends.length < 2) {
      return predictions; // Not enough data
    }

    // Calculate trend slopes
    if (sportType === 'running' && currentMetrics.avgPace) {
      const paceTrend = this.calculateTrendSlope(trends.map(t => t.pace).filter(p => p !== undefined) as number[]);
      const predictedPace = currentMetrics.avgPace + (paceTrend * timeframe * 4); // 4 weeks per month
      const improvement = currentMetrics.avgPace - predictedPace;

      predictions.push({
        metric: '5K Race Time',
        currentValue: currentMetrics.avgPace * 5, // 5km at current pace
        predictedValue: Math.max(predictedPace * 5, currentMetrics.avgPace * 5 * 0.85), // Cap at 15% improvement
        timeframe: `${timeframe} months`,
        confidence: Math.min(85, trends.length * 10),
        factors: [
          `Current pace: ${this.formatPace(currentMetrics.avgPace)}/km`,
          `Trend: ${paceTrend > 0 ? 'improving' : 'stable'}`,
          `Training frequency: ${currentMetrics.totalWorkouts} workouts`,
        ],
      });
    }

    if (sportType === 'cycling' && currentMetrics.avgPower) {
      const powerTrend = this.calculateTrendSlope(trends.map(t => t.power).filter(p => p !== undefined) as number[]);
      const predictedPower = currentMetrics.avgPower + (powerTrend * timeframe * 4);

      predictions.push({
        metric: 'Average Power Output',
        currentValue: currentMetrics.avgPower,
        predictedValue: Math.max(predictedPower, currentMetrics.avgPower * 1.15), // Cap at 15% improvement
        timeframe: `${timeframe} months`,
        confidence: Math.min(80, trends.length * 10),
        factors: [
          `Current power: ${currentMetrics.avgPower}W`,
          `Training load: ${currentMetrics.trainingLoad}`,
          `Consistency: ${currentMetrics.totalWorkouts} workouts`,
        ],
      });
    }

    // Fitness score prediction
    const fitnessTrend = this.calculateTrendSlope(trends.map(t => {
      const weekMetrics = this.calculateMetrics(userId, sportType, t.date, t.date);
      return weekMetrics.fitnessScore;
    }));

    predictions.push({
      metric: 'Fitness Score',
      currentValue: currentMetrics.fitnessScore,
      predictedValue: Math.min(100, currentMetrics.fitnessScore + (fitnessTrend * timeframe * 4)),
      timeframe: `${timeframe} months`,
      confidence: Math.min(75, trends.length * 8),
      factors: [
        `Current score: ${currentMetrics.fitnessScore}/100`,
        `Progress trend: ${currentMetrics.progressTrend}`,
        `Training consistency: ${currentMetrics.totalWorkouts} workouts`,
      ],
    });

    return predictions;
  }

  // Helper methods
  private static calculateTrainingLoad(workouts: WorkoutEntry[], sportType: string): number {
    // Simplified training load calculation
    // Real TSS would use power/pace zones, but we'll use duration and intensity
    return workouts.reduce((load, workout) => {
      let intensity = 0.5; // Base intensity
      
      if (workout.avgHeartRate && workout.maxHeartRate) {
        // Estimate intensity from heart rate
        const hrPercent = (workout.avgHeartRate / workout.maxHeartRate) * 100;
        if (hrPercent > 85) intensity = 1.0;
        else if (hrPercent > 75) intensity = 0.8;
        else if (hrPercent > 65) intensity = 0.6;
      }

      return load + (workout.duration * intensity);
    }, 0);
  }

  private static calculateFitnessScore(
    workouts: WorkoutEntry[],
    sportType: string,
    avgSpeed?: number,
    avgPower?: number,
    avgCadence?: number
  ): number {
    let score = 0;
    const maxScore = 100;

    // Consistency (40 points)
    const consistencyScore = Math.min(40, (workouts.length / 10) * 40);
    score += consistencyScore;

    // Performance metrics (60 points)
    if (sportType === 'running' && avgSpeed) {
      // Good running speed is typically 10-15 km/h
      const speedScore = Math.min(30, ((avgSpeed - 5) / 10) * 30);
      score += speedScore;

      if (avgCadence) {
        // Good cadence is 160-180 steps/min
        const cadenceScore = Math.min(30, ((avgCadence - 140) / 40) * 30);
        score += cadenceScore;
      }
    }

    if (sportType === 'cycling' && avgPower) {
      // Good power varies, but 200-300W is decent for recreational
      const powerScore = Math.min(60, ((avgPower - 100) / 200) * 60);
      score += powerScore;
    }

    return Math.min(maxScore, Math.max(0, score));
  }

  private static determineTrend(current: number, previous: number): 'improving' | 'stable' | 'declining' {
    const change = current - previous;
    const percentChange = previous > 0 ? (change / previous) * 100 : 0;
    
    if (percentChange > 5) return 'improving';
    if (percentChange < -5) return 'declining';
    return 'stable';
  }

  private static getPreviousPeriod(startDate: string, endDate: string): { start: string; end: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end.getTime() - start.getTime();
    
    return {
      start: new Date(start.getTime() - duration).toISOString().split('T')[0],
      end: startDate,
    };
  }

  private static groupWorkoutsByInterval(
    workouts: WorkoutEntry[],
    interval: 'day' | 'week' | 'month'
  ): Array<{ date: string; workouts: WorkoutEntry[] }> {
    const grouped: { [key: string]: WorkoutEntry[] } = {};

    workouts.forEach(workout => {
      const date = new Date(workout.date);
      let key: string;

      if (interval === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (interval === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(workout);
    });

    return Object.entries(grouped)
      .map(([date, workouts]) => ({ date, workouts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static getDatasetBenchmarks(sportType: string): any {
    // These are typical values based on fitness datasets
    // In production, these would come from analyzing the actual CSV dataset
    if (sportType === 'running') {
      return {
        avgPace: 6.0, // min/km (10 km/h)
        avgCadence: 165, // steps/min
        avgHeartRate: 150, // bpm
      };
    }
    if (sportType === 'cycling') {
      return {
        avgPower: 200, // watts
        avgCyclingCadence: 85, // rpm
        avgHeartRate: 145, // bpm
      };
    }
    return {
      avgHeartRate: 140,
    };
  }

  private static calculatePercentile(userValue: number, datasetAvg: number, lowerIsBetter: boolean): number {
    // Simplified percentile calculation
    // In production, this would use actual dataset distribution
    const deviation = Math.abs(userValue - datasetAvg) / datasetAvg;
    
    if (lowerIsBetter) {
      // For pace (lower is better)
      if (userValue < datasetAvg * 0.9) return 90;
      if (userValue < datasetAvg) return 75;
      if (userValue < datasetAvg * 1.1) return 50;
      return 25;
    } else {
      // For speed/power (higher is better)
      if (userValue > datasetAvg * 1.1) return 90;
      if (userValue > datasetAvg) return 75;
      if (userValue > datasetAvg * 0.9) return 50;
      return 25;
    }
  }

  private static calculateTrendSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + (i * v), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private static formatPace(pace: number): string {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

    // STEP-4: Get workload for last N days
  // STEP-4: Get AVERAGE workload for last N days (excluding current workout)
private static getWorkloadLastNDays(
  userId: string,
  days: number,
  referenceDate: string
): number {
  const workouts = WorkoutService.getWorkoutsByUser(userId, 1000, 0);

  const ref = new Date(referenceDate);
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = workouts.filter(w => {
  const d = new Date(w.timestamp ?? w.date);
  return d >= cutoff && d < new Date(referenceDate);
});


  if (filtered.length === 0) return 0;
console.log("Filtered workouts:", filtered.length);

  const totalLoad = filtered.reduce((sum, w) => {
    const intensity =
      w.avgHeartRate && w.maxHeartRate
        ? w.avgHeartRate / w.maxHeartRate
        : 0.7;

    return sum + w.duration * intensity;
  }, 0);

  // ✅ THIS IS THE KEY FIX
  return totalLoad / days; // DAILY AVERAGE
}



  // STEP-4: Calculate ACWR
  private static calculateACWR(acute: number, chronic: number): number {
    if (chronic === 0) return 1;
    return Number((acute / chronic).toFixed(2));
  }

  // STEP-4: Determine ACWR risk zone
  private static getACWRZone(acwr: number): string {
    if (acwr < 0.8) return 'Undertraining';
    if (acwr <= 1.3) return 'Optimal';
    if (acwr <= 1.5) return 'Elevated Risk';
    return 'High Risk';
  }


  private static getEmptyMetrics(): PerformanceMetrics {
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      avgDuration: 0,
      trainingLoad: 0,
      fitnessScore: 0,
      progressTrend: 'stable',
      progressPercentage: 0,
    };
  }
}



// {
//     "workout": {
//         "workoutType": "Running",
//         "durationMin": 60,
//         "avgHeartRate": 150,
//         "distanceKm": 10,
//         "cadence": 170,
//         "workoutDate": "2026-02-08"
//     },
//     "analysis": {
//         "engineeredMetrics": {
//             "sessionLoad": 90,
//             "gameWorkload": 90,
//             "trainingIntensity": 1.5,
//             "speedIndex": 10
//         },
//         "workload": {
//             "acuteAvg": 90,
//             "chronicAvg": 90,
//             "acwr": 1,
//             "acwrZone": "Optimal"
//         }
//     }
// }