import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { registerSchema, loginSchema } from '../utils/validation';

export const authRoutes = Router();

// Register endpoint
authRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    const { user, token } = await UserService.register({
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      password: validated.password,
      authProvider: validated.authProvider,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        authProvider: user.authProvider,
      },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Login endpoint
authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    const { user, token } = await UserService.login({
      email: validated.email,
      phone: validated.phone,
      password: validated.password,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        authProvider: user.authProvider,
      },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// Google OAuth callback (placeholder - will be implemented later)
authRoutes.get('/google/callback', (req: Request, res: Response) => {
  res.json({ message: 'Google OAuth not yet implemented' });
});




