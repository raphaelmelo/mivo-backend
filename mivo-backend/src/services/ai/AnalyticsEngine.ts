import { StudentAnalyzer } from './StudentAnalyzer';
import { MetricsCollector } from './MetricsCollector';
import RecommendationEngine from './RecommendationEngine';
import UserProgress from '../../models/UserProgress';
import Lesson from '../../models/Lesson';
import {
    StudentInsights,
    LessonEffectiveness,
    LessonEffectivenessReport,
} from './types';
import { Op } from 'sequelize';

/**
 * AnalyticsEngine Service
 * 
 * Provides comprehensive analytics for students and lessons:
 * - Student Insights Dashboard: Aggregates all student metrics and recommendations
 * - Lesson Effectiveness Analysis: Analyzes lesson difficulty and dropout rates
 */
export class AnalyticsEngine {
    private studentAnalyzer: StudentAnalyzer;
    private metricsCollector: MetricsCollector;
    private recommendationEngine: RecommendationEngine;

    constructor() {
        this.studentAnalyzer = new StudentAnalyzer();
        this.metricsCollector = new MetricsCollector();
        this.recommendationEngine = new RecommendationEngine();
    }

    /**
     * Get comprehensive insights dashboard for a student
     * Aggregates all relevant metrics, trends, consistency, recommendations, and activity
     */
    async getStudentInsights(userId: number): Promise<StudentInsights> {
        // Fetch all data concurrently for better performance
        const [metrics, consistency, trends, recommendations, recentActivity] = await Promise.all([
            this.studentAnalyzer.getStudentMetrics(userId),
            this.studentAnalyzer.analyzeConsistency(userId),
            this.studentAnalyzer.detectTrends(userId),
            this.recommendationEngine.getRecommendations(userId),
            this.metricsCollector.getRecentActivity(userId, 30),
        ]);

        return {
            userId,
            metrics,
            consistency,
            trends,
            recommendations: recommendations.recommendations,
            recentActivity,
            generatedAt: new Date(),
        };
    }

    /**
     * Analyze lesson effectiveness across all lessons
     * Identifies lessons with high dropout rates, difficulty mismatches, etc.
     */
    async analyzeLessonEffectiveness(): Promise<LessonEffectivenessReport> {
        // Get all published lessons
        const lessons = await Lesson.findAll({
            where: { isPublished: true },
            order: [['order', 'ASC']],
            raw: true,
        });

        const totalLessons = lessons.length;
        const allLessons: LessonEffectiveness[] = [];

        // Analyze each lesson
        for (const lesson of lessons) {
            const effectiveness = await this.analyzeSingleLesson(lesson.id);
            if (effectiveness) {
                allLessons.push(effectiveness);
            }
        }

        const analyzedLessons = allLessons.length;
        const lessonsNeedingReview = allLessons.filter(l => l.needsReview);

        return {
            totalLessons,
            analyzedLessons,
            lessonsNeedingReview,
            allLessons,
            generatedAt: new Date(),
        };
    }

    /**
     * Analyze effectiveness of a single lesson
     */
    private async analyzeSingleLesson(lessonId: number): Promise<LessonEffectiveness | null> {
        // Get lesson details
        const lesson = await Lesson.findByPk(lessonId, { raw: true });
        if (!lesson) return null;

        // Get all progress records for this lesson
        const progressRecords = await UserProgress.findAll({
            where: { lessonId },
            raw: true,
        });

        // No data to analyze
        if (progressRecords.length === 0) {
            return {
                lessonId,
                lessonTitle: lesson.title,
                difficulty: lesson.difficulty,
                estimatedMinutes: lesson.estimatedMinutes,
                totalStudents: 0,
                completionRate: 0,
                dropoutRate: 0,
                averageAttempts: 0,
                averageTimeSpent: 0,
                averageScore: 0,
                timeEfficiencyRatio: 0,
                difficultyRating: 'as_expected',
                needsReview: false,
            };
        }

        // Calculate metrics
        const totalStudents = progressRecords.length;
        const completedCount = progressRecords.filter(p => p.isCompleted).length;
        const completionRate = (completedCount / totalStudents) * 100;
        const dropoutRate = 100 - completionRate;

        const averageAttempts = progressRecords.reduce((sum, p) => sum + p.attempts, 0) / totalStudents;

        const completedRecords = progressRecords.filter(p => p.isCompleted);
        const averageTimeSpent = completedRecords.length > 0
            ? completedRecords.reduce((sum, p) => sum + p.timeSpentMinutes, 0) / completedRecords.length
            : 0;

        const recordsWithScore = completedRecords.filter(p => p.score !== null);
        const averageScore = recordsWithScore.length > 0
            ? recordsWithScore.reduce((sum, p) => sum + (p.score || 0), 0) / recordsWithScore.length
            : 0;

        // Calculate time efficiency ratio (actual time vs estimated time)
        const timeEfficiencyRatio = lesson.estimatedMinutes > 0
            ? averageTimeSpent / lesson.estimatedMinutes
            : 1;

        // Determine difficulty rating based on completion rate and average score
        let difficultyRating: 'easier_than_expected' | 'as_expected' | 'harder_than_expected';

        if (completionRate >= 80 && averageScore >= 80) {
            difficultyRating = 'easier_than_expected';
        } else if (completionRate < 60 || averageScore < 60) {
            difficultyRating = 'harder_than_expected';
        } else {
            difficultyRating = 'as_expected';
        }

        // Flag lesson as needing review if:
        // - Dropout rate > 30%
        // - Completion rate < 50%
        // - Average attempts > 3 (students struggling)
        const needsReview = dropoutRate > 30 || completionRate < 50 || averageAttempts > 3;

        return {
            lessonId,
            lessonTitle: lesson.title,
            difficulty: lesson.difficulty,
            estimatedMinutes: lesson.estimatedMinutes,
            totalStudents,
            completionRate: Math.round(completionRate * 10) / 10,
            dropoutRate: Math.round(dropoutRate * 10) / 10,
            averageAttempts: Math.round(averageAttempts * 10) / 10,
            averageTimeSpent: Math.round(averageTimeSpent * 10) / 10,
            averageScore: Math.round(averageScore * 10) / 10,
            timeEfficiencyRatio: Math.round(timeEfficiencyRatio * 100) / 100,
            difficultyRating,
            needsReview,
        };
    }
}

export default AnalyticsEngine;
