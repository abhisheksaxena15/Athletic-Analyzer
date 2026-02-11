import { db } from '../database/init';
import { randomUUID } from 'crypto';

export interface WorkoutEntry {
  id: string;
  userId: string;
  date: string;
  timestamp?: string;
  type: 'running' | 'cycling' | 'weightlifting' | 'other';
  activityId?: number;
  duration: number;
  heartRate?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  bodyTemperature?: number;
  handTemp?: number;
  chestTemp?: number;
  ankleTemp?: number;
  steps?: number;
  caloriesBurned?: number;
  stressLevel?: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  cadence?: number;
  distance?: number;
  power?: number;
  avgPower?: number;
  maxPower?: number;
  cyclingCadence?: number;
  elevation?: number;
  elevationGain?: number;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  volume?: number;
  trainingLoad?: number;
  createdAt: string;
  updatedAt: string;
}

export class WorkoutService {
  static createWorkout(userId: string, data: Partial<WorkoutEntry>): WorkoutEntry {
    const workoutId = randomUUID();
    const now = new Date().toISOString();

    // 🔥 STEP 6: Calculate training load properly

let trainingLoad = null;

if (data.duration) {
  let intensity = 0.7; // default

  if (data.avgHeartRate && data.maxHeartRate) {
    intensity = data.avgHeartRate / data.maxHeartRate;
  } else if (data.avgHeartRate) {
    intensity = data.avgHeartRate / 190; // fallback max HR
  }

  trainingLoad = Number((data.duration * intensity).toFixed(2));
}


    // Calculate volume for weightlifting
    let volume = null;
    if (data.type === 'weightlifting' && data.sets && data.reps && data.weight) {
      volume = data.sets * data.reps * data.weight;
    }

    db.prepare(`
      INSERT INTO workout_entries (
        id, user_id, date, timestamp, type, activity_id, duration,
        heart_rate, avg_heart_rate, max_heart_rate, min_heart_rate,
        body_temperature, hand_temp, chest_temp, ankle_temp,
        steps, calories_burned, stress_level, notes,
        latitude, longitude, speed, avg_speed, max_speed, cadence, distance,
        power, avg_power, max_power, cycling_cadence, elevation, elevation_gain,
        exercise_name, sets, reps, weight, rest_time, volume,training_load,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      workoutId,
      userId,
      data.date || now.split('T')[0],
      data.timestamp || now,
      data.type!,
      data.activityId || null,
      data.duration!,
      data.heartRate || null,
      data.avgHeartRate || null,
      data.maxHeartRate || null,
      data.minHeartRate || null,
      data.bodyTemperature || null,
      data.handTemp || null,
      data.chestTemp || null,
      data.ankleTemp || null,
      data.steps || null,
      data.caloriesBurned || null,
      data.stressLevel || null,
      data.notes || null,
      data.latitude || null,
      data.longitude || null,
      data.speed || null,
      data.avgSpeed || null,
      data.maxSpeed || null,
      data.cadence || null,
      data.distance || null,
      data.power || null,
      data.avgPower || null,
      data.maxPower || null,
      data.cyclingCadence || null,
      data.elevation || null,
      data.elevationGain || null,
      data.exerciseName || null,
      data.sets || null,
      data.reps || null,
      data.weight || null,
      data.restTime || null,
      volume,
      data.trainingLoad || null,
      now,
      now
    );

    return this.getWorkoutById(workoutId)!;
  }

  static getWorkoutById(workoutId: string): WorkoutEntry | null {
    const row = db.prepare('SELECT * FROM workout_entries WHERE id = ?').get(workoutId) as any;
    if (!row) return null;
    return this.mapRowToWorkout(row);
  }

  static getWorkoutsByUser(userId: string, limit: number = 100, offset: number = 0): WorkoutEntry[] {
    const rows = db.prepare(`
      SELECT * FROM workout_entries 
      WHERE user_id = ? 
      ORDER BY date DESC, timestamp DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset) as any[];
    
    return rows.map(row => this.mapRowToWorkout(row));
  }

  static updateWorkout(workoutId: string, userId: string, data: Partial<WorkoutEntry>): WorkoutEntry {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (data.duration !== undefined) {
      updateFields.push('duration = ?');
      values.push(data.duration);
    }
    if (data.heartRate !== undefined) {
      updateFields.push('heart_rate = ?');
      values.push(data.heartRate);
    }
    if (data.avgHeartRate !== undefined) {
      updateFields.push('avg_heart_rate = ?');
      values.push(data.avgHeartRate);
    }
    if (data.maxHeartRate !== undefined) {
      updateFields.push('max_heart_rate = ?');
      values.push(data.maxHeartRate);
    }
    if (data.minHeartRate !== undefined) {
      updateFields.push('min_heart_rate = ?');
      values.push(data.minHeartRate);
    }
    if (data.bodyTemperature !== undefined) {
      updateFields.push('body_temperature = ?');
      values.push(data.bodyTemperature);
    }
    if (data.handTemp !== undefined) {
      updateFields.push('hand_temp = ?');
      values.push(data.handTemp);
    }
    if (data.chestTemp !== undefined) {
      updateFields.push('chest_temp = ?');
      values.push(data.chestTemp);
    }
    if (data.ankleTemp !== undefined) {
      updateFields.push('ankle_temp = ?');
      values.push(data.ankleTemp);
    }
    if (data.steps !== undefined) {
      updateFields.push('steps = ?');
      values.push(data.steps);
    }
    if (data.caloriesBurned !== undefined) {
      updateFields.push('calories_burned = ?');
      values.push(data.caloriesBurned);
    }
    if (data.stressLevel !== undefined) {
      updateFields.push('stress_level = ?');
      values.push(data.stressLevel);
    }
    if (data.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.distance !== undefined) {
      updateFields.push('distance = ?');
      values.push(data.distance);
    }
    if (data.speed !== undefined) {
      updateFields.push('speed = ?');
      values.push(data.speed);
    }
    if (data.avgSpeed !== undefined) {
      updateFields.push('avg_speed = ?');
      values.push(data.avgSpeed);
    }
    if (data.maxSpeed !== undefined) {
      updateFields.push('max_speed = ?');
      values.push(data.maxSpeed);
    }
    if (data.cadence !== undefined) {
      updateFields.push('cadence = ?');
      values.push(data.cadence);
    }
    if (data.power !== undefined) {
      updateFields.push('power = ?');
      values.push(data.power);
    }
    if (data.avgPower !== undefined) {
      updateFields.push('avg_power = ?');
      values.push(data.avgPower);
    }
    if (data.maxPower !== undefined) {
      updateFields.push('max_power = ?');
      values.push(data.maxPower);
    }
    if (data.cyclingCadence !== undefined) {
      updateFields.push('cycling_cadence = ?');
      values.push(data.cyclingCadence);
    }
    if (data.elevation !== undefined) {
      updateFields.push('elevation = ?');
      values.push(data.elevation);
    }
    if (data.elevationGain !== undefined) {
      updateFields.push('elevation_gain = ?');
      values.push(data.elevationGain);
    }
    if (data.exerciseName !== undefined) {
      updateFields.push('exercise_name = ?');
      values.push(data.exerciseName);
    }
    if (data.sets !== undefined) {
      updateFields.push('sets = ?');
      values.push(data.sets);
    }
    if (data.reps !== undefined) {
      updateFields.push('reps = ?');
      values.push(data.reps);
    }
    if (data.weight !== undefined) {
      updateFields.push('weight = ?');
      values.push(data.weight);
    }
    if (data.restTime !== undefined) {
      updateFields.push('rest_time = ?');
      values.push(data.restTime);
    }

    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(workoutId, userId);

    if (updateFields.length > 1) {
      db.prepare(`
        UPDATE workout_entries 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `).run(...values);
    }

    return this.getWorkoutById(workoutId)!;
  }

  static deleteWorkout(workoutId: string, userId: string): void {
    db.prepare('DELETE FROM workout_entries WHERE id = ? AND user_id = ?').run(workoutId, userId);
  }

  private static mapRowToWorkout(row: any): WorkoutEntry {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      timestamp: row.timestamp,
      type: row.type,
      activityId: row.activity_id,
      duration: row.duration,
      heartRate: row.heart_rate,
      avgHeartRate: row.avg_heart_rate,
      maxHeartRate: row.max_heart_rate,
      minHeartRate: row.min_heart_rate,
      bodyTemperature: row.body_temperature,
      handTemp: row.hand_temp,
      chestTemp: row.chest_temp,
      ankleTemp: row.ankle_temp,
      steps: row.steps,
      caloriesBurned: row.calories_burned,
      stressLevel: row.stress_level,
      notes: row.notes,
      latitude: row.latitude,
      longitude: row.longitude,
      speed: row.speed,
      avgSpeed: row.avg_speed,
      maxSpeed: row.max_speed,
      cadence: row.cadence,
      distance: row.distance,
      power: row.power,
      avgPower: row.avg_power,
      maxPower: row.max_power,
      cyclingCadence: row.cycling_cadence,
      elevation: row.elevation,
      elevationGain: row.elevation_gain,
      exerciseName: row.exercise_name,
      sets: row.sets,
      reps: row.reps,
      weight: row.weight,
      restTime: row.rest_time,
      volume: row.volume,
      trainingLoad: row.training_load,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}



