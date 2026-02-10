import { WorkoutInput } from '../types';

export interface EngineeredWorkoutMetrics {
  sessionLoad: number;
  gameWorkload: number;
  trainingIntensity: number;
  speedIndex?: number;
}

export function engineerWorkoutFeatures(
  workout: WorkoutInput
): EngineeredWorkoutMetrics {
  const trainingIntensity = workout.avgHeartRate / 100;

  const sessionLoad = workout.durationMin * trainingIntensity;

  const gameWorkload = sessionLoad;

  let speedIndex: number | undefined;
  if (workout.distanceKm && workout.durationMin > 0) {
    speedIndex = workout.distanceKm / (workout.durationMin / 60);
  }

  return {
    sessionLoad,
    gameWorkload,
    trainingIntensity,
    speedIndex,
  };
}
