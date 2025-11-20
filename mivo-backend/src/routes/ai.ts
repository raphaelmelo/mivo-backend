import { Router } from 'express';
import * as aiController from '../controllers/aiController';

const router = Router();

/**
 * AI Analytics Routes
 * 
 * Endpoints for student analytics, metrics, and performance insights
 */

// Get comprehensive student metrics
router.get('/metrics/:userId', aiController.getMetrics);

// Get consistency analysis
router.get('/consistency/:userId', aiController.getConsistency);

// Get trend analysis
router.get('/trends/:userId', aiController.getTrends);

// Get recent activity
router.get('/activity/:userId', aiController.getActivity);

// Get lesson statistics
router.get('/stats/:userId', aiController.getLessonStats);

// Get personalized recommendations
router.get('/recommend/:userId', aiController.getRecommendations);

// Get comprehensive student insights dashboard
router.get('/insights/:userId', aiController.getStudentInsights);

// Get lesson effectiveness analysis
router.get('/lesson-effectiveness', aiController.getLessonEffectiveness);

export default router;

