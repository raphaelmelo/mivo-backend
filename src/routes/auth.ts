import { Router } from 'express';
import { register, login, getProfile, updateProfile, getMe, linkedinLogin, linkedinCallback } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/linkedin', linkedinLogin);
router.get('/linkedin/callback', linkedinCallback);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
