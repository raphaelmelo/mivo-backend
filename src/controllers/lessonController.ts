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

        // Update user XP and stats
        // Note: In a real app, we should verify if the lesson was actually completed validly
        // and if it wasn't already completed to avoid duplicate XP.
        // For now, we just add the XP as per the MVP requirements.

        user.xp += xpEarned || 0;
        user.lessonsCompleted += 1;

        // Simple level up logic (every 1000 XP)
        const newLevel = Math.floor(user.xp / 1000) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
        }

        await user.save();

        res.json({
            message: 'Lesson completed successfully',
            user: {
                xp: user.xp,
                level: user.level,
                lessonsCompleted: user.lessonsCompleted
            }
        });
    } catch (error) {
        console.error('Error completing lesson:', error);
        res.status(500).json({ message: 'Error completing lesson' });
    }
};
