import { db } from '../database/init';
import { randomUUID } from 'crypto';

export interface SampleInput {
  timestamp: string;
  activityId?: number;
  heart_rate?: number;
  hand_temp?: number;
  chest_temp?: number;
  ankle_temp?: number;
  steps?: number;
  distance?: number;
  calories_burned?: number;
  active_minutes?: number;
  sleep_minutes?: number;
  stress_level?: number;
  acc_x?: number;
  acc_y?: number;
  acc_z?: number;
  gyro_x?: number;
  gyro_y?: number;
  gyro_z?: number;
}

export class SampleService {
  static bulkInsert(userId: string, items: SampleInput[]): number {
    const stmt = db.prepare(`
      INSERT INTO smartwatch_samples (
        id, user_id, timestamp, activity_id, heart_rate, hand_temp, chest_temp, ankle_temp,
        steps, distance, calories_burned, active_minutes, sleep_minutes, stress_level,
        acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction((rows: SampleInput[]) => {
      for (const r of rows) {
        stmt.run(
          randomUUID(),
          userId,
          r.timestamp,
          r.activityId ?? null,
          r.heart_rate ?? null,
          r.hand_temp ?? null,
          r.chest_temp ?? null,
          r.ankle_temp ?? null,
          r.steps ?? null,
          r.distance ?? null,
          r.calories_burned ?? null,
          r.active_minutes ?? null,
          r.sleep_minutes ?? null,
          r.stress_level ?? null,
          r.acc_x ?? null,
          r.acc_y ?? null,
          r.acc_z ?? null,
          r.gyro_x ?? null,
          r.gyro_y ?? null,
          r.gyro_z ?? null,
        );
      }
    });

    tx(items);
    return items.length;
  }
}
