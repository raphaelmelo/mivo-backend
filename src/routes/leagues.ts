import { Router } from 'express';
import { getLeagueRanking, getUserLeagueInfo } from '../controllers/leagueController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// All league routes require authentication
router.use(authMiddleware);

// Get league ranking (top 50 users in user's league)
router.get('/ranking', getLeagueRanking);

// Get user's league info (rank, tier, total)
router.get('/user', getUserLeagueInfo);

export default router;
