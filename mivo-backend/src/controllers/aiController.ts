import { Request, Response } from 'express';
import { StudentAnalyzer } from '../services/ai/StudentAnalyzer';
import { MetricsCollector } from '../services/ai/MetricsCollector';

const studentAnalyzer = new StudentAnalyzer();
const metricsCollector = new MetricsCollector();

/**
 * Get comprehensive metrics for a student
 * GET /api/ai/metrics/:userId
 */
export const getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        const metrics = await studentAnalyzer.getStudentMetrics(Number(userId));
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching student metrics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get detailed consistency analysis for a student
 * GET /api/ai/consistency/:userId
 */
export const getConsistency = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        const consistency = await studentAnalyzer.analyzeConsistency(Number(userId));
        res.json(consistency);
    } catch (error) {
        console.error('Error fetching consistency data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get trend analysis for a student
 * GET /api/ai/trends/:userId
 */
export const getTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        const trends = await studentAnalyzer.detectTrends(Number(userId));
        res.json(trends);
    } catch (error) {
        console.error('Error fetching trend data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get recent activity for a student
 * GET /api/ai/activity/:userId?days=30
 */
export const getActivity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days as string) || 30;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        if (days < 1 || days > 365) {
            res.status(400).json({ error: 'Days parameter must be between 1 and 365' });
            return;
        }

        const activity = await metricsCollector.getRecentActivity(Number(userId), days);
        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get lesson statistics for a student
 * GET /api/ai/stats/:userId
 */
export const getLessonStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        const stats = await metricsCollector.aggregateLessonStats(Number(userId));
        res.json(stats);
    } catch (error) {
        console.error('Error fetching lesson stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get personalized recommendations for a student
 * GET /api/ai/recommend/:userId
 */
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        const { RecommendationEngine } = await import('../services/ai/RecommendationEngine');
        const recommendationEngine = new RecommendationEngine();
        const recommendations = await recommendationEngine.getRecommendations(Number(userId));

        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get comprehensive insights dashboard for a student
 * GET /api/ai/insights/:userId
 */
export const getStudentInsights = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ error: 'Invalid userId parameter' });
            return;
        }

        const { AnalyticsEngine } = await import('../services/ai/AnalyticsEngine');
        const analyticsEngine = new AnalyticsEngine();
        const insights = await analyticsEngine.getStudentInsights(Number(userId));

        res.json(insights);
    } catch (error) {
        console.error('Error getting student insights:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get lesson effectiveness analysis
 * GET /api/ai/lesson-effectiveness
 */
export const getLessonEffectiveness = async (req: Request, res: Response): Promise<void> => {
    try {
        const { AnalyticsEngine } = await import('../services/ai/AnalyticsEngine');
        const analyticsEngine = new AnalyticsEngine();
        const effectiveness = await analyticsEngine.analyzeLessonEffectiveness();

        res.json(effectiveness);
    } catch (error) {
        console.error('Error getting lesson effectiveness:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

