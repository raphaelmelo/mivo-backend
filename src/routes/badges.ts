import { Router } from 'express';
import { getUserBadges, getAllBadges } from '../controllers/badgeController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// All badge routes require authentication
router.use(authMiddleware);

// Get user's badges (with earned status)
router.get('/user', getUserBadges);

// Get all available badges (for display purposes)
router.get('/all', getAllBadges);

export default router;
