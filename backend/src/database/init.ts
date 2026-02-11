import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/athlete_performance.db';

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  console.log('📦 Initializing database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT,
      name TEXT NOT NULL,
      google_id TEXT UNIQUE,
      auth_provider TEXT NOT NULL DEFAULT 'email',
      email_verified INTEGER DEFAULT 0,
      phone_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      age INTEGER,
      height REAL,
      weight REAL,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'athlete')),
      sports TEXT,
      weekly_workouts TEXT,
      primary_goal TEXT,
      diet_type TEXT,
      allergies TEXT,
      hydration_goal REAL,
      experience_level TEXT,
      injuries TEXT,
      medications TEXT,
      sleep_hours REAL,
      stress_level TEXT,
      target_weight REAL,
      target_distance REAL,
      target_time INTEGER,
      meal_preference TEXT,
      resting_heart_rate INTEGER,
      body_temperature REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Workout entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      timestamp TEXT,
      type TEXT NOT NULL CHECK(type IN ('running', 'cycling', 'weightlifting', 'other')),
      activity_id INTEGER,
      duration INTEGER NOT NULL,
      
      -- Common fields
      heart_rate INTEGER,
      avg_heart_rate INTEGER,
      max_heart_rate INTEGER,
      min_heart_rate INTEGER,
      body_temperature REAL,
      hand_temp REAL,
      chest_temp REAL,
      ankle_temp REAL,
      steps INTEGER,
      calories_burned REAL,
      stress_level INTEGER,
      notes TEXT,
      
      -- Running specific
      latitude REAL,
      longitude REAL,
      speed REAL,
      avg_speed REAL,
      max_speed REAL,
      cadence INTEGER,
      distance REAL,
      
      -- Cycling specific
      power INTEGER,
      avg_power INTEGER,
      max_power INTEGER,
      cycling_cadence INTEGER,
      elevation REAL,
      elevation_gain REAL,
      
      -- Weightlifting specific
      exercise_name TEXT,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      rest_time INTEGER,
      volume REAL,
      training_load REAL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sleep logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      bedtime TEXT NOT NULL,
      wake_time TEXT NOT NULL,
      total_sleep REAL NOT NULL,
      deep_sleep REAL,
      rem_sleep REAL,
      light_sleep REAL,
      sleep_quality INTEGER NOT NULL CHECK(sleep_quality BETWEEN 1 AND 5),
      disturbances INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Smartwatch data samples table (for CSV uploads)
  db.exec(`
    CREATE TABLE IF NOT EXISTS smartwatch_samples (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      activity_id INTEGER,
      heart_rate INTEGER,
      hand_temp REAL,
      chest_temp REAL,
      ankle_temp REAL,
      steps INTEGER,
      distance REAL,
      calories_burned REAL,
      active_minutes INTEGER,
      sleep_minutes INTEGER,
      stress_level INTEGER,
      acc_x REAL,
      acc_y REAL,
      acc_z REAL,
      gyro_x REAL,
      gyro_y REAL,
      gyro_z REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workout_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workout_entries(date);
    CREATE INDEX IF NOT EXISTS idx_sleep_user_id ON sleep_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_sleep_date ON sleep_logs(date);
    CREATE INDEX IF NOT EXISTS idx_samples_user_id ON smartwatch_samples(user_id);
    CREATE INDEX IF NOT EXISTS idx_samples_timestamp ON smartwatch_samples(timestamp);
  `);

  console.log('✅ Database initialized successfully');
}
