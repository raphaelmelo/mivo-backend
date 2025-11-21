import { Router } from 'express';
import { getAllLessons, getLessonById, completeLesson } from '../controllers/lessonController';
import { authMiddleware as authenticateToken } from '../middlewares/auth';

const router = Router();

// Public routes (or protected? usually protected)
router.use(authenticateToken);

router.get('/', getAllLessons);
router.get('/:id', getLessonById);
router.post('/:id/complete', completeLesson);

export default router;
