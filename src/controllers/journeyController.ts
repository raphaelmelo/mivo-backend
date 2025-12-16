import { Request, Response } from 'express';
import Journey from '../models/Journey';
import Lesson from '../models/Lesson';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export const getAllJourneys = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        const journeys = await Journey.findAll({
            order: [['order', 'ASC']],
            where: { isPublished: true }
        });

        // Get lessons with user progress for each journey
        const { default: UserProgress } = await import('../models/UserProgress');

        const journeysWithProgress = await Promise.all(
            journeys.map(async (journey) => {
                const lessons = await Lesson.findAll({
                    where: {
                        journeyId: journey.id,
                        isPublished: true
                    },
                    attributes: ['id', 'title', 'type', 'order', 'xpReward', 'estimatedMinutes'], // Select needed fields
                    order: [['order', 'ASC']]
                });

                const lessonsWithStatus = await Promise.all(lessons.map(async (lesson) => {
                    const progress = await UserProgress.findOne({
                        where: {
                            userId,
                            lessonId: lesson.id,
                            isCompleted: true
                        }
                    });

                    return {
                        ...lesson.toJSON(),
                        isCompleted: !!progress,
                        isLocked: false // Will be calculated in frontend or here if preferred
                    };
                }));

                // Calculate completed count based on actual progress
                const completedCount = lessonsWithStatus.filter(l => l.isCompleted).length;

                return {
                    ...journey.toJSON(),
                    lessons: lessonsWithStatus, // Return lessons with status
                    totalLessons: lessons.length,
                    completedLessons: completedCount
                };
            })
        );

        res.json(journeysWithProgress);
    } catch (error) {
        console.error('Error fetching journeys:', error);
        res.status(500).json({ message: 'Error fetching journeys' });
    }
};

export const getJourneyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const journey = await Journey.findByPk(id);

        if (!journey) {
            return res.status(404).json({ message: 'Journey not found' });
        }

        const lessons = await Lesson.findAll({
            where: {
                journeyId: journey.id,
                isPublished: true
            },
            order: [['order', 'ASC']]
        });

        res.json({
            ...journey.toJSON(),
            lessons
        });
    } catch (error) {
        console.error('Error fetching journey:', error);
        res.status(500).json({ message: 'Error fetching journey' });
    }
};

export const getJourneyLessons = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const lessons = await Lesson.findAll({
            where: {
                journeyId: id,
                isPublished: true
            },
            order: [['order', 'ASC']]
        });

        res.json(lessons);
    } catch (error) {
        console.error('Error fetching journey lessons:', error);
        res.status(500).json({ message: 'Error fetching journey lessons' });
    }
};
