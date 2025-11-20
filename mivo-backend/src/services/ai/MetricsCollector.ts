import UserProgress from '../../models/UserProgress';
import { ProgressData, LessonStats, Activity } from './types';
import { Op } from 'sequelize';

/**
 * MetricsCollector Service
 * 
 * Responsible for collecting and aggregating raw metrics data
 * from the UserProgress model.
 */
export class MetricsCollector {
    /**
     * Collect all progress data for a specific user
     */
    async collectUserProgressData(userId: number): Promise<ProgressData[]> {
        const progressRecords = await UserProgress.findAll({
            where: { userId },
            order: [['createdAt', 'ASC']],
            raw: true,
        });

        return progressRecords as unknown as ProgressData[];
    }

    /**
     * Aggregate lesson statistics for a user
     */
    async aggregateLessonStats(userId: number): Promise<LessonStats> {
        const progressRecords = await this.collectUserProgressData(userId);

        const totalLessons = progressRecords.length;
        const completedLessons = progressRecords.filter(p => p.isCompleted).length;
        const inProgressLessons = totalLessons - completedLessons;

        const completedRecords = progressRecords.filter(p => p.isCompleted && p.score !== null);
        const averageScore = completedRecords.length > 0
            ? completedRecords.reduce((sum, p) => sum + (p.score || 0), 0) / completedRecords.length
            : 0;

        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
        const averageTime = completedLessons > 0 ? totalTimeSpent / completedLessons : 0;

        return {
            totalLessons,
            completedLessons,
            inProgressLessons,
            averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
            averageTime: Math.round(averageTime * 10) / 10,
            totalTimeSpent,
        };
    }

    /**
     * Get recent activity data for the last N days
     */
    async getRecentActivity(userId: number, days: number = 30): Promise<Activity[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const progressRecords = await UserProgress.findAll({
            where: {
                userId,
                completedAt: {
                    [Op.gte]: cutoffDate,
                },
                isCompleted: true,
            },
            order: [['completedAt', 'ASC']],
            raw: true,
        }) as unknown as ProgressData[];

        // Group by date
        const activityMap = new Map<string, Activity>();

        progressRecords.forEach(record => {
            if (!record.completedAt) return;

            const dateKey = record.completedAt.toISOString().split('T')[0];

            if (!activityMap.has(dateKey)) {
                activityMap.set(dateKey, {
                    date: new Date(dateKey),
                    lessonsCompleted: 0,
                    timeSpent: 0,
                    averageScore: 0,
                });
            }

            const activity = activityMap.get(dateKey)!;
            activity.lessonsCompleted += 1;
            activity.timeSpent += record.timeSpentMinutes;
            if (record.score !== null) {
                activity.averageScore += record.score;
            }
        });

        // Calculate average scores
        return Array.from(activityMap.values()).map(activity => ({
            ...activity,
            averageScore: activity.lessonsCompleted > 0
                ? Math.round((activity.averageScore / activity.lessonsCompleted) * 10) / 10
                : 0,
        }));
    }

    /**
     * Get completed lessons in chronological order
     */
    async getCompletedLessonsChronologically(userId: number): Promise<ProgressData[]> {
        const progressRecords = await UserProgress.findAll({
            where: {
                userId,
                isCompleted: true,
            },
            order: [['completedAt', 'ASC']],
            raw: true,
        });

        return progressRecords as unknown as ProgressData[];
    }
}

export default MetricsCollector;
