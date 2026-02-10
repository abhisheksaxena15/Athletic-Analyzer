import { db } from '../database/init';
import { randomUUID } from 'crypto';

export interface SleepLogEntry {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalSleep: number;
  deepSleep?: number;
  remSleep?: number;
  lightSleep?: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  disturbances?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class SleepService {
  static createSleepLog(userId: string, data: Partial<SleepLogEntry>): SleepLogEntry {
    const sleepId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO sleep_logs (
        id, user_id, date, bedtime, wake_time, total_sleep,
        deep_sleep, rem_sleep, light_sleep, sleep_quality,
        disturbances, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sleepId,
      userId,
      data.date || now.split('T')[0],
      data.bedtime!,
      data.wakeTime!,
      data.totalSleep!,
      data.deepSleep || null,
      data.remSleep || null,
      data.lightSleep || null,
      data.sleepQuality!,
      data.disturbances || null,
      data.notes || null,
      now,
      now
    );

    return this.getSleepLogById(sleepId)!;
  }

  static getSleepLogById(sleepId: string): SleepLogEntry | null {
    const row = db.prepare('SELECT * FROM sleep_logs WHERE id = ?').get(sleepId) as any;
    if (!row) return null;
    return this.mapRowToSleep(row);
  }

  static getSleepLogsByUser(userId: string, limit: number = 100, offset: number = 0): SleepLogEntry[] {
    const rows = db.prepare(`
      SELECT * FROM sleep_logs 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset) as any[];
    
    return rows.map(row => this.mapRowToSleep(row));
  }

  static updateSleepLog(sleepId: string, userId: string, data: Partial<SleepLogEntry>): SleepLogEntry {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (data.bedtime !== undefined) {
      updateFields.push('bedtime = ?');
      values.push(data.bedtime);
    }
    if (data.wakeTime !== undefined) {
      updateFields.push('wake_time = ?');
      values.push(data.wakeTime);
    }
    if (data.totalSleep !== undefined) {
      updateFields.push('total_sleep = ?');
      values.push(data.totalSleep);
    }
    if (data.deepSleep !== undefined) {
      updateFields.push('deep_sleep = ?');
      values.push(data.deepSleep);
    }
    if (data.remSleep !== undefined) {
      updateFields.push('rem_sleep = ?');
      values.push(data.remSleep);
    }
    if (data.lightSleep !== undefined) {
      updateFields.push('light_sleep = ?');
      values.push(data.lightSleep);
    }
    if (data.sleepQuality !== undefined) {
      updateFields.push('sleep_quality = ?');
      values.push(data.sleepQuality);
    }
    if (data.disturbances !== undefined) {
      updateFields.push('disturbances = ?');
      values.push(data.disturbances);
    }
    if (data.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(data.notes);
    }

    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(sleepId, userId);

    if (updateFields.length > 1) {
      db.prepare(`
        UPDATE sleep_logs 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `).run(...values);
    }

    return this.getSleepLogById(sleepId)!;
  }

  static deleteSleepLog(sleepId: string, userId: string): void {
    db.prepare('DELETE FROM sleep_logs WHERE id = ? AND user_id = ?').run(sleepId, userId);
  }

  private static mapRowToSleep(row: any): SleepLogEntry {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      bedtime: row.bedtime,
      wakeTime: row.wake_time,
      totalSleep: row.total_sleep,
      deepSleep: row.deep_sleep,
      remSleep: row.rem_sleep,
      lightSleep: row.light_sleep,
      sleepQuality: row.sleep_quality,
      disturbances: row.disturbances,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}



