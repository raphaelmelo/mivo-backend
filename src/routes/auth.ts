import { Router } from 'express';
import { register, login, getProfile, updateProfile, getMe } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
