import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ProfileService } from '../services/profileService';
import { UserService } from '../services/userService';
import { updateProfileSchema } from '../utils/validation';

export const profileRoutes = Router();

// All profile routes require authentication
profileRoutes.use(authenticate);

// Get current user profile
profileRoutes.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = UserService.getUserById(userId);
    const profile = ProfileService.getProfile(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: profile || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
});

// Update user profile
profileRoutes.put('/me', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validated = updateProfileSchema.parse(req.body);
    
    const profile = ProfileService.upsertProfile(userId, validated);

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
});

// Delete user account
profileRoutes.delete('/me', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Delete profile first (due to foreign key constraint)
    ProfileService.deleteProfile(userId);
    // Delete user
    UserService.deleteUser(userId);

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});




