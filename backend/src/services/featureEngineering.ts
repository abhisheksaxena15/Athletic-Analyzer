import { WorkoutInput } from '../types';

export interface EngineeredWorkoutMetrics {
  sessionLoad: number;
  gameWorkload: number;
  trainingIntensity: number;
  speedIndex?: number;

  // STEP-1 additions
  avgSpeed?: number;
  pace?: number;
  volume?: number;
}

export function engineerWorkoutFeatures(
  workout: WorkoutInput
): EngineeredWorkoutMetrics {

  // ================= SAFE INTENSITY CALCULATION =================
  let trainingIntensity = 0.7; // default base intensity

  if (workout.avgHeartRate && workout.maxHeartRate) {
    trainingIntensity = workout.avgHeartRate / workout.maxHeartRate;
  } else if (workout.avgHeartRate) {
    // assume estimated max HR = 190 if not provided
    trainingIntensity = workout.avgHeartRate / 190;
  }

  // Clamp intensity between 0.5 and 1.5 (realistic range)
  trainingIntensity = Math.max(0.5, Math.min(trainingIntensity, 1.5));

  // ================= SESSION LOAD =================
  const sessionLoad = workout.durationMin * trainingIntensity;
  const gameWorkload = sessionLoad;

  // ================= SPEED INDEX =================
  let speedIndex: number | undefined;
  if (workout.distanceKm && workout.durationMin > 0) {
    speedIndex = workout.distanceKm / (workout.durationMin / 60);
  }

  // ================= AUTO-DERIVED METRICS =================

  // avgSpeed (km/h)
  let avgSpeed: number | undefined;
  if (workout.distanceKm && workout.durationMin > 0) {
    avgSpeed = Number(
      ((workout.distanceKm / workout.durationMin) * 60).toFixed(2)
    );
  }

  // pace (min/km)
  let pace: number | undefined;
  if (avgSpeed && avgSpeed > 0) {
    pace = Number((60 / avgSpeed).toFixed(2));
  }

  // Weightlifting volume
  let volume: number | undefined;
  if (workout.sets && workout.reps && workout.weight) {
    volume = workout.sets * workout.reps * workout.weight;
  }

  // ================= RETURN =================
  return {
    sessionLoad,
    gameWorkload,
    trainingIntensity,
    speedIndex,
    avgSpeed,
    pace,
    volume,
  };
}
