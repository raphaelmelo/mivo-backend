import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import * as streakService from '../services/streakService';
import * as userProgressService from '../services/userProgressService';
import * as badgeService from '../services/badgeService';
import * as leagueService from '../services/leagueService';

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
        const { xpEarned, timeSpent } = req.body; // Expect timeSpent from frontend
        const userId = req.userId;
        const lessonId = parseInt(id);

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Mark lesson as completed and check for duplicate XP
        const { isNewCompletion } = await userProgressService.markLessonCompleted(userId, lessonId, {
            timeSpent: timeSpent || 0,
            score: 100 // Default score for now
        });

        let totalXpGained = 0;
        let streakBonus = 0;
        let streakMultiplier = 1;

        // 2. Calculate XP and Streak (only if new completion or if we want to give partial XP for repeats - for now only new)
        if (isNewCompletion) {
            // Update Streak
            const streakResult = await streakService.updateStreak(userId);
            streakBonus = streakResult.streakBonus;

            // Calculate Multiplier based on streak (simple logic for now)
            if (user.streak >= 30) streakMultiplier = 1.5;
            else if (user.streak >= 7) streakMultiplier = 1.2;

            // Base XP from request or default
            const baseXp = xpEarned || 50;

            totalXpGained = Math.floor((baseXp * streakMultiplier) + streakBonus);

            user.xp += totalXpGained;
            user.lessonsCompleted += 1;

            // Level Up Logic
            const newLevel = Math.floor(user.xp / 1000) + 1;
            const leveledUp = newLevel > user.level;
            if (leveledUp) {
                user.level = newLevel;
            }

            await user.save();

            // Update League
            await leagueService.updateUserLeague(userId);
        }

        // 3. Check for Badges
        const newBadges = await badgeService.checkAndAwardBadges(userId);

        res.json({
            message: 'Lesson completed successfully',
            user: {
                xp: user.xp,
                level: user.level,
                lessonsCompleted: user.lessonsCompleted,
                streak: user.streak
            },
            xpGained: totalXpGained,
            xpBreakdown: {
                base: xpEarned || 0,
                streakMultiplier,
                streakBonus,
                total: totalXpGained
            },
            leveledUp: Math.floor(user.xp / 1000) + 1 > (Math.floor((user.xp - totalXpGained) / 1000) + 1), // Recalculate based on diff
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

