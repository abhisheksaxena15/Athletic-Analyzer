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

  // ---------------- BASE METRICS (already correct) ----------------
  const trainingIntensity = workout.avgHeartRate
    ? workout.avgHeartRate / 100
    : 0.7;

  const sessionLoad = workout.durationMin * trainingIntensity;
  const gameWorkload = sessionLoad;

  let speedIndex: number | undefined;
  if (workout.distanceKm && workout.durationMin > 0) {
    speedIndex = workout.distanceKm / (workout.durationMin / 60);
  }

  // ================= STEP 1: AUTO-DERIVED METRICS =================

  // Derive avgSpeed (km/h) if not provided
  let avgSpeed: number | undefined;
  if (workout.distanceKm && workout.durationMin > 0) {
    avgSpeed = Number(
      ((workout.distanceKm / workout.durationMin) * 60).toFixed(2)
    );
  }

  // Derive pace (min/km) from avgSpeed
  let pace: number | undefined;
  if (avgSpeed && avgSpeed > 0) {
    pace = Number((60 / avgSpeed).toFixed(2));
  }

  // Weightlifting: derive volume
  let volume: number | undefined;
  if (workout.sets && workout.reps && workout.weight) {
    volume = workout.sets * workout.reps * workout.weight;
  }

  // ---------------- FINAL RETURN ----------------
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
