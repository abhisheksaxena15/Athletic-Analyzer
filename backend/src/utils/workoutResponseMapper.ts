export function mapWorkoutByType(workout: any) {
  switch (workout.type) {
    case 'running':
      return {
        id: workout.id,
        type: workout.type,
        date: workout.date,
        duration: workout.duration,
        distance: workout.distance,
        avgHeartRate: workout.avgHeartRate,
        cadence: workout.cadence,
        avgSpeed: workout.avgSpeed
          ?? (workout.distance && workout.duration
              ? +(workout.distance / (workout.duration / 60)).toFixed(2)
              : null),
      };

    case 'cycling':
      return {
        id: workout.id,
        type: workout.type,
        date: workout.date,
        duration: workout.duration,
        distance: workout.distance,
        avgHeartRate: workout.avgHeartRate,
        avgPower: workout.avgPower,
        cadence: workout.cyclingCadence,
      };

    case 'weightlifting':
      return {
        id: workout.id,
        type: workout.type,
        date: workout.date,
        duration: workout.duration,
        exerciseName: workout.exerciseName,
        sets: workout.sets,
        reps: workout.reps,
        weight: workout.weight,
        volume: workout.volume,
      };

    default:
      return workout;
  }
}
