import { Router } from 'express';
import { getAllJourneys, getJourneyById, getJourneyLessons } from '../controllers/journeyController';
import { authMiddleware as authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllJourneys);
router.get('/:id', getJourneyById);
router.get('/:id/lessons', getJourneyLessons);

export default router;
