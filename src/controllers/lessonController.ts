import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export const getAllLessons = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        const lessons = await Lesson.findAll({
            order: [['order', 'ASC']],
            where: { isPublished: true }
        });

        // If user is authenticated, include their progress
        if (userId) {
            const { default: UserProgress } = await import('../models/UserProgress');
            const progressRecords = await UserProgress.findAll({
                where: { userId }
            });

            const progressMap = new Map(
                progressRecords.map(p => [p.lessonId, p])
            );

            const lessonsWithProgress = lessons.map(lesson => {
                const progress = progressMap.get(lesson.id);
                return {
                    ...lesson.toJSON(),
                    isCompleted: progress?.isCompleted || false,
                    completedAt: progress?.completedAt || null
                };
            });

            return res.json(lessonsWithProgress);
        }

        res.json(lessons);
    } catch (error: any) {
        console.error('‼️ ERROR FETCHING LESSONS ‼️');
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('Full error:', JSON.stringify(error, null, 2));
        res.status(500).json({ message: 'Error fetching lessons', error: error?.message });
    }
};

export const getLessonById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const lesson = await Lesson.findByPk(id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ message: 'Error fetching lesson' });
    }
};

export const completeLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // SECURITY: xpEarned from body is IGNORED.
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const lessonId = parseInt(id);
        const lesson = await Lesson.findByPk(lessonId);
        
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Check if lesson is already completed
        const { default: UserProgress } = await import('../models/UserProgress');

        const [progress, created] = await UserProgress.findOrCreate({
            where: { userId, lessonId },
            defaults: {
                userId,
                lessonId,
                isCompleted: true,
                completedAt: new Date(),
                attempts: 1,
                timeSpentMinutes: 0 // TODO: Track time appropriately
            }
        });

        // Import Services dynamically to avoid potential circular dep issues if any (though structured well now)
        const { XPService } = await import('../services/xpService');
        const { StreakService } = await import('../services/streakService');
        const { LeagueService } = await import('../services/leagueService');
        const { BadgeService } = await import('../services/badgeService');

        let xpBreakdown = { base: 0, multiplier: 1, total: 0 };
        let lessonsCompletedIncrement = 0;
        let streakBonus = 0;

        if (created || !progress.isCompleted) {
            // First time completion logic
            
            // 1. Update Streak
            const streakResult = await StreakService.updateStreak(user);
            streakBonus = streakResult.streakBonus;
            
            // 2. Calculate XP based on Lesson Type and Streak
            xpBreakdown = XPService.calculateLessonXP(lesson.type, user.streak);
            
            // 3. Mark progress
            if (!created) {
                progress.isCompleted = true;
                progress.completedAt = new Date();
                progress.attempts += 1;
                await progress.save();
            }
            
            lessonsCompletedIncrement = 1;

        } else {
            // Already completed, just increment attempts
            progress.attempts += 1;
            await progress.save();
            // No XP or lesson count increment for repeats
        }

        if (lessonsCompletedIncrement > 0) {
            user.lessonsCompleted += lessonsCompletedIncrement;
        }

        // Apply XP updates
        const xpToAdd = xpBreakdown.total + streakBonus;
        if (xpToAdd > 0) {
            const oldXP = user.xp;
            user.xp += xpToAdd;
            
            // Check Level Up
            const { leveledUp, newLevel } = XPService.checkLevelUp(oldXP, user.xp);
            if (leveledUp) {
                user.level = newLevel;
            }

            // Update League
            await LeagueService.updateUserLeague(user);
        }

        await user.save();

        // Check for new badges
        const newBadges = await BadgeService.checkAndUnlockBadges(userId);

        res.json({
            message: 'Lesson completed successfully',
            user: {
                xp: user.xp,
                level: user.level,
                lessonsCompleted: user.lessonsCompleted,
                streak: user.streak
            },
            xpGained: xpToAdd, // Total gained this session
            xpBreakdown: {
                base: xpBreakdown.base,
                streakMultiplier: xpBreakdown.multiplier,
                streakBonus: streakBonus,
                total: xpToAdd
            },
            leveledUp: XPService.checkLevelUp(user.xp - xpToAdd, user.xp).leveledUp, // Recalc purely for response flag if needed or reuse
            newBadges: newBadges.map(badge => ({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                category: badge.category,
                iconUrl: badge.iconUrl
            }))
        });
    } catch (error) {
        console.error('Error completing lesson:', error);
        res.status(500).json({ message: 'Error completing lesson' });
    }
};
