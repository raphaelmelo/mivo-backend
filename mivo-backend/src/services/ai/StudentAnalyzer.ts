import { MetricsCollector } from './MetricsCollector';
import {
    StudentMetrics,
    TrendAnalysis,
    ConsistencyScore,
    ProgressData,
} from './types';
import * as stats from 'simple-statistics';

/**
 * StudentAnalyzer Service
 * 
 * Main service for analyzing student performance and calculating
 * various metrics like completion rate, average time, consistency,
 * and performance trends.
 */
export class StudentAnalyzer {
    private metricsCollector: MetricsCollector;

    constructor() {
        this.metricsCollector = new MetricsCollector();
    }

    /**
     * Get comprehensive metrics for a student
     */
    async getStudentMetrics(userId: number): Promise<StudentMetrics> {
        const lessonsStats = await this.metricsCollector.aggregateLessonStats(userId);
        const completionRate = await this.calculateCompletionRate(userId);
        const averageTime = lessonsStats.averageTime;
        const consistency = await this.analyzeConsistency(userId);
        const trend = await this.detectTrends(userId);
        const lastActivity = await this.getLastActivityDate(userId);

        return {
            userId,
            completionRate,
            averageTimePerLesson: averageTime,
            consistencyScore: consistency.score,
            currentStreak: consistency.currentStreak,
            totalLessonsCompleted: lessonsStats.completedLessons,
            totalLessonsStarted: lessonsStats.totalLessons,
            trend: trend.direction,
            lastActivityDate: lastActivity,
        };
    }

    /**
     * Calculate completion rate (percentage of started lessons that were completed)
     */
    async calculateCompletionRate(userId: number): Promise<number> {
        const stats = await this.metricsCollector.aggregateLessonStats(userId);

        if (stats.totalLessons === 0) return 0;

        const rate = (stats.completedLessons / stats.totalLessons) * 100;
        return Math.round(rate * 10) / 10; // Round to 1 decimal
    }

    /**
     * Calculate average time spent per lesson (in minutes)
     */
    async calculateAverageTime(userId: number): Promise<number> {
        const stats = await this.metricsCollector.aggregateLessonStats(userId);
        return stats.averageTime;
    }

    /**
     * Analyze study consistency and calculate consistency score
     */
    async analyzeConsistency(userId: number): Promise<ConsistencyScore> {
        const completedLessons = await this.metricsCollector.getCompletedLessonsChronologically(userId);

        if (completedLessons.length === 0) {
            return {
                score: 0,
                currentStreak: 0,
                longestStreak: 0,
                averageGapDays: 0,
                studyFrequency: 0,
            };
        }

        // Calculate streaks
        const { currentStreak, longestStreak } = this.calculateStreaks(completedLessons);

        // Calculate average gap between sessions
        const averageGapDays = this.calculateAverageGap(completedLessons);

        // Calculate study frequency (sessions per week)
        const studyFrequency = this.calculateStudyFrequency(completedLessons);

        // Calculate overall consistency score (0-100)
        const score = this.calculateConsistencyScore(
            currentStreak,
            longestStreak,
            averageGapDays,
            studyFrequency
        );

        return {
            score,
            currentStreak,
            longestStreak,
            averageGapDays,
            studyFrequency,
        };
    }

    /**
     * Detect performance trends using linear regression
     */
    async detectTrends(userId: number): Promise<TrendAnalysis> {
        const completedLessons = await this.metricsCollector.getCompletedLessonsChronologically(userId);

        if (completedLessons.length < 3) {
            return {
                direction: 'stable',
                confidence: 0,
                recentPerformance: [],
                slope: 0,
            };
        }

        // Get recent scores (last 10 lessons or all if less)
        const recentCount = Math.min(10, completedLessons.length);
        const recentLessons = completedLessons.slice(-recentCount);
        const recentPerformance = recentLessons
            .filter(l => l.score !== null)
            .map(l => l.score!);

        if (recentPerformance.length < 2) {
            return {
                direction: 'stable',
                confidence: 0,
                recentPerformance,
                slope: 0,
            };
        }

        // Prepare data for linear regression
        const dataPoints = recentPerformance.map((score, index) => [index, score]);

        // Calculate linear regression
        const regression = stats.linearRegression(dataPoints);
        const regressionLine = stats.linearRegressionLine(regression);
        const slope = regression.m;

        // Determine trend direction
        const direction: 'improving' | 'stable' | 'declining' =
            slope > 2 ? 'improving' :
                slope < -2 ? 'declining' :
                    'stable';

        // Calculate confidence (R-squared)
        const rSquared = stats.rSquared(dataPoints, regressionLine);
        const confidence = Math.min(1, Math.max(0, rSquared));

        return {
            direction,
            confidence,
            recentPerformance,
            slope,
        };
    }

    /**
     * Get the last activity date for a user
     */
    private async getLastActivityDate(userId: number): Promise<Date | null> {
        const progressData = await this.metricsCollector.collectUserProgressData(userId);

        if (progressData.length === 0) return null;

        const completedLessons = progressData.filter(p => p.isCompleted && p.completedAt);

        if (completedLessons.length === 0) return null;

        // Sort by completedAt descending
        completedLessons.sort((a, b) => {
            const dateA = a.completedAt?.getTime() || 0;
            const dateB = b.completedAt?.getTime() || 0;
            return dateB - dateA;
        });

        return completedLessons[0].completedAt;
    }

    /**
     * Calculate current and longest streaks
     */
    private calculateStreaks(completedLessons: ProgressData[]): {
        currentStreak: number;
        longestStreak: number;
    } {
        if (completedLessons.length === 0) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        const studyDates = completedLessons
            .filter(l => l.completedAt)
            .map(l => {
                const date = new Date(l.completedAt!);
                // Normalize to midnight UTC for day comparison
                return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            });

        // Remove duplicates and sort
        const uniqueDates = Array.from(new Set(studyDates.map(d => d.getTime())))
            .map(t => new Date(t))
            .sort((a, b) => a.getTime() - b.getTime());

        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayTime = today.getTime();

        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = uniqueDates[i - 1];
            const currDate = uniqueDates[i];
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        // Calculate current streak (only if recent activity)
        const lastStudyDate = uniqueDates[uniqueDates.length - 1];
        const daysSinceLastStudy = Math.round((todayTime - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceLastStudy <= 1) {
            // Count backwards from last date to find current streak
            currentStreak = 1;
            for (let i = uniqueDates.length - 2; i >= 0; i--) {
                const diffDays = Math.round(
                    (uniqueDates[i + 1].getTime() - uniqueDates[i].getTime()) / (1000 * 60 * 60 * 24)
                );
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        } else {
            currentStreak = 0;
        }

        return { currentStreak, longestStreak };
    }

    /**
     * Calculate average gap between study sessions (in days)
     */
    private calculateAverageGap(completedLessons: ProgressData[]): number {
        if (completedLessons.length < 2) return 0;

        const studyDates = completedLessons
            .filter(l => l.completedAt)
            .map(l => new Date(l.completedAt!).getTime())
            .sort((a, b) => a - b);

        const gaps = [];
        for (let i = 1; i < studyDates.length; i++) {
            const gapMillis = studyDates[i] - studyDates[i - 1];
            const gapDays = gapMillis / (1000 * 60 * 60 * 24);
            gaps.push(gapDays);
        }

        const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
        return Math.round(averageGap * 10) / 10;
    }

    /**
     * Calculate study frequency (sessions per week)
     */
    private calculateStudyFrequency(completedLessons: ProgressData[]): number {
        if (completedLessons.length === 0) return 0;

        const studyDates = completedLessons
            .filter(l => l.completedAt)
            .map(l => new Date(l.completedAt!));

        if (studyDates.length === 0) return 0;

        const firstDate = studyDates[0];
        const lastDate = studyDates[studyDates.length - 1];
        const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        const weeks = daysDiff / 7;

        if (weeks < 0.1) return studyDates.length * 7; // Less than a week, extrapolate

        const frequency = studyDates.length / weeks;
        return Math.round(frequency * 10) / 10;
    }

    /**
     * Calculate consistency score (0-100)
     */
    private calculateConsistencyScore(
        currentStreak: number,
        longestStreak: number,
        averageGapDays: number,
        studyFrequency: number
    ): number {
        // Weights for different factors
        const streakWeight = 0.3;
        const longestStreakWeight = 0.2;
        const gapWeight = 0.3;
        const frequencyWeight = 0.2;

        // Normalize values (0-1)
        const normalizedCurrentStreak = Math.min(1, currentStreak / 30); // 30 days = max
        const normalizedLongestStreak = Math.min(1, longestStreak / 60); // 60 days = max
        const normalizedGap = Math.max(0, 1 - averageGapDays / 7); // 7 days = 0 score
        const normalizedFrequency = Math.min(1, studyFrequency / 7); // 7 sessions/week = max

        const score =
            streakWeight * normalizedCurrentStreak +
            longestStreakWeight * normalizedLongestStreak +
            gapWeight * normalizedGap +
            frequencyWeight * normalizedFrequency;

        return Math.round(score * 100);
    }
}

export default StudentAnalyzer;
