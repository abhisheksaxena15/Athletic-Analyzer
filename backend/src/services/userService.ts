import { db } from '../database/init';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { User, UserProfile, RegisterRequest, LoginRequest } from '../types';
import { randomUUID } from 'crypto';

export class UserService {
  // Register a new user
  static async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const userId = randomUUID();
    const now = new Date().toISOString();

    // Check if user already exists
    if (data.email) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
      if (existingEmail) {
        throw new Error('Email already registered');
      }
    }

    if (data.phone) {
      const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(data.phone);
      if (existingPhone) {
        throw new Error('Phone number already registered');
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, name, auth_provider, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      data.email || null,
      data.phone || null,
      passwordHash,
      data.name,
      data.authProvider,
      now,
      now
    );

    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    return { user, token };
  }

  // Login user
  static async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    let userWithHash: (User & { passwordHash?: string }) | null = null;

    if (data.email) {
      const row = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email) as any;
      if (row) {
        userWithHash = this.mapRowToUser(row);
      }
    } else if (data.phone) {
      const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(data.phone) as any;
      if (row) {
        userWithHash = this.mapRowToUser(row);
      }
    }

    if (!userWithHash) {
      throw new Error('Invalid credentials');
    }

    // Check password if user has one
    if (userWithHash.authProvider !== 'google' && userWithHash.passwordHash) {
      const isValid = await comparePassword(data.password, userWithHash.passwordHash);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
    }

    // Return user without passwordHash
    const { passwordHash, ...user } = userWithHash;

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    return { user, token };
  }

  // Get user by ID
  static getUserById(userId: string): User | null {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!row) return null;
    return this.mapRowToUser(row);
  }

  // Get user by email
  static getUserByEmail(email: string): User | null {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!row) return null;
    return this.mapRowToUser(row);
  }

  // Get user by phone
  static getUserByPhone(phone: string): User | null {
    const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;
    if (!row) return null;
    return this.mapRowToUser(row);
  }

  // Delete user
  static deleteUser(userId: string): void {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  }

  // Helper to map database row to User object
  private static mapRowToUser(row: any): User & { passwordHash?: string } {
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      name: row.name,
      googleId: row.google_id,
      authProvider: row.auth_provider,
      emailVerified: row.email_verified === 1,
      phoneVerified: row.phone_verified === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      passwordHash: row.password_hash, // Internal use only
    };
  }
}

