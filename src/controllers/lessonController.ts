import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export const getAllLessons = async (req: Request, res: Response) => {
    try {
        const lessons = await Lesson.findAll({
            order: [['order', 'ASC']],
            where: { isPublished: true }
        });
        res.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Error fetching lessons' });
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
        const { xpEarned } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const lessonId = parseInt(id);

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
                timeSpentMinutes: 0 // TODO: Track time
            }
        });

        let xpToAdd = 0;
        let lessonsCompletedIncrement = 0;

        if (created) {
            // First time completion
            xpToAdd = xpEarned || 0;
            lessonsCompletedIncrement = 1;
        } else if (!progress.isCompleted) {
            // Was started but not completed (shouldn't happen with current logic but safe to handle)
            progress.isCompleted = true;
            progress.completedAt = new Date();
            progress.attempts += 1;
            await progress.save();

            xpToAdd = xpEarned || 0;
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

        if (xpToAdd > 0) {
            user.xp += xpToAdd;
        }

        // Streak logic
        const now = new Date();
        const lastActive = new Date(user.lastActiveDate);
        const diffInMs = now.getTime() - lastActive.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 1) {
            // Consecutive day
            user.streak += 1;
        } else if (diffInDays > 1) {
            // Streak broken
            user.streak = 1;
        } else if (user.streak === 0) {
            // First time
            user.streak = 1;
        }
        // If diffInDays === 0, streak stays the same (already active today)

        user.lastActiveDate = now;

        // Simple level up logic (every 1000 XP)
        const newLevel = Math.floor(user.xp / 1000) + 1;
        const leveledUp = newLevel > user.level;
        if (leveledUp) {
            user.level = newLevel;
        }

        await user.save();

        // Check for new badges (dynamic import to avoid circular dependencies)
        const { checkAndUnlockBadges } = await import('./badgeController');
        const newBadges = await checkAndUnlockBadges(userId);

        res.json({
            message: 'Lesson completed successfully',
            user: {
                xp: user.xp,
                level: user.level,
                lessonsCompleted: user.lessonsCompleted,
                streak: user.streak
            },
            leveledUp,
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
