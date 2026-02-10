import { db } from '../database/init';
import { UserProfile, UpdateProfileRequest } from '../types';
import { randomUUID } from 'crypto';

export class ProfileService {
  // Get user profile
  static getProfile(userId: string): UserProfile | null {
    const row = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as any;
    if (!row) return null;
    return this.mapRowToProfile(row);
  }

  // Create or update user profile
  static upsertProfile(userId: string, data: UpdateProfileRequest): UserProfile {
    const existing = this.getProfile(userId);
    const now = new Date().toISOString();

    if (existing) {
      // Update existing profile
      const updateFields: string[] = [];
      const values: any[] = [];

      if (data.age !== undefined) {
        updateFields.push('age = ?');
        values.push(data.age);
      }
      if (data.height !== undefined) {
        updateFields.push('height = ?');
        values.push(data.height);
      }
      if (data.weight !== undefined) {
        updateFields.push('weight = ?');
        values.push(data.weight);
      }
      if (data.gender !== undefined) {
        updateFields.push('gender = ?');
        values.push(data.gender);
      }
      if (data.activityLevel !== undefined) {
        updateFields.push('activity_level = ?');
        values.push(data.activityLevel);
      }
      if (data.sports !== undefined) {
        updateFields.push('sports = ?');
        values.push(JSON.stringify(data.sports));
      }
      if (data.weeklyWorkouts !== undefined) {
        updateFields.push('weekly_workouts = ?');
        values.push(data.weeklyWorkouts);
      }
      if (data.primaryGoal !== undefined) {
        updateFields.push('primary_goal = ?');
        values.push(data.primaryGoal);
      }
      if (data.dietType !== undefined) {
        updateFields.push('diet_type = ?');
        values.push(data.dietType);
      }
      if (data.allergies !== undefined) {
        updateFields.push('allergies = ?');
        values.push(JSON.stringify(data.allergies));
      }
      if (data.hydrationGoal !== undefined) {
        updateFields.push('hydration_goal = ?');
        values.push(data.hydrationGoal);
      }
      if (data.experienceLevel !== undefined) {
        updateFields.push('experience_level = ?');
        values.push(data.experienceLevel);
      }
      if (data.injuries !== undefined) {
        updateFields.push('injuries = ?');
        values.push(data.injuries);
      }
      if (data.medications !== undefined) {
        updateFields.push('medications = ?');
        values.push(data.medications);
      }
      if (data.sleepHours !== undefined) {
        updateFields.push('sleep_hours = ?');
        values.push(data.sleepHours);
      }
      if (data.stressLevel !== undefined) {
        updateFields.push('stress_level = ?');
        values.push(data.stressLevel);
      }
      if (data.targetWeight !== undefined) {
        updateFields.push('target_weight = ?');
        values.push(data.targetWeight);
      }
      if (data.targetDistance !== undefined) {
        updateFields.push('target_distance = ?');
        values.push(data.targetDistance);
      }
      if (data.targetTime !== undefined) {
        updateFields.push('target_time = ?');
        values.push(data.targetTime);
      }
      if (data.mealPreference !== undefined) {
        updateFields.push('meal_preference = ?');
        values.push(data.mealPreference);
      }
      if (data.restingHeartRate !== undefined) {
        updateFields.push('resting_heart_rate = ?');
        values.push(data.restingHeartRate);
      }
      if (data.bodyTemperature !== undefined) {
        updateFields.push('body_temperature = ?');
        values.push(data.bodyTemperature);
      }

      updateFields.push('updated_at = ?');
      values.push(now);
      values.push(existing.id);

      if (updateFields.length > 1) {
        db.prepare(`
          UPDATE user_profiles 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `).run(...values);
      }

      return this.getProfile(userId)!;
    } else {
      // Create new profile
      const profileId = randomUUID();
      
      db.prepare(`
        INSERT INTO user_profiles (
          id, user_id, age, height, weight, gender, activity_level, sports,
          weekly_workouts, primary_goal, diet_type, allergies, hydration_goal,
          experience_level, injuries, medications, sleep_hours, stress_level,
          target_weight, target_distance, target_time, meal_preference,
          resting_heart_rate, body_temperature,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        userId,
        data.age || null,
        data.height || null,
        data.weight || null,
        data.gender || null,
        data.activityLevel || null,
        data.sports ? JSON.stringify(data.sports) : null,
        data.weeklyWorkouts || null,
        data.primaryGoal || null,
        data.dietType || null,
        data.allergies ? JSON.stringify(data.allergies) : null,
        data.hydrationGoal || null,
        data.experienceLevel || null,
        data.injuries || null,
        data.medications || null,
        data.sleepHours || null,
        data.stressLevel || null,
        data.targetWeight || null,
        data.targetDistance || null,
        data.targetTime || null,
        data.mealPreference || null,
        data.restingHeartRate || null,
        data.bodyTemperature || null,
        now,
        now
      );

      return this.getProfile(userId)!;
    }
  }

  // Delete user profile
  static deleteProfile(userId: string): void {
    db.prepare('DELETE FROM user_profiles WHERE user_id = ?').run(userId);
  }

  // Helper to map database row to UserProfile object
  private static mapRowToProfile(row: any): UserProfile {
    return {
      id: row.id,
      userId: row.user_id,
      age: row.age,
      height: row.height,
      weight: row.weight,
      gender: row.gender,
      activityLevel: row.activity_level,
      sports: row.sports ? JSON.parse(row.sports) : [],
      weeklyWorkouts: row.weekly_workouts,
      primaryGoal: row.primary_goal,
      dietType: row.diet_type,
      allergies: row.allergies ? JSON.parse(row.allergies) : [],
      hydrationGoal: row.hydration_goal,
      experienceLevel: row.experience_level,
      injuries: row.injuries,
      medications: row.medications,
      sleepHours: row.sleep_hours,
      stressLevel: row.stress_level,
      targetWeight: row.target_weight,
      targetDistance: row.target_distance,
      targetTime: row.target_time,
      mealPreference: row.meal_preference,
      restingHeartRate: row.resting_heart_rate,
      bodyTemperature: row.body_temperature,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}


