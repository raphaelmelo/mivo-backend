import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import Badge from '../models/Badge';
import UserBadge from '../models/UserBadge';

// Type for UserBadge with included Badge
interface UserBadgeWithBadge extends UserBadge {
    badge?: Badge;
}

/**
 * Get all badges with user's earned status
 */
export const getUserBadges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Get all badges with user's unlock status
        const userBadges = await UserBadge.findAll({
            where: { userId },
            include: [{
                model: Badge,
                as: 'badge',
                required: true
            }]
        }) as UserBadgeWithBadge[];

        res.json({
            badges: userBadges.map(ub => ({
                id: ub.id,
                userId: ub.userId,
                badgeId: ub.badgeId,
                earnedAt: ub.unlockedAt,
                badge: {
                    id: ub.badge?.id,
                    name: ub.badge?.name,
                    description: ub.badge?.description,
                    category: ub.badge?.category,
                    iconUrl: ub.badge?.iconUrl,
                    requirement: ub.badge?.requirement,
                    isActive: ub.badge?.isActive
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({ message: 'Error fetching badges' });
    }
};

/**
 * Get all available badges (admin/debug)
 */
export const getAllBadges = async (req: AuthRequest, res: Response) => {
    try {
        const badges = await Badge.findAll({
            where: { isActive: true }
        });

        res.json({ badges });
    } catch (error) {
        console.error('Error fetching all badges:', error);
        res.status(500).json({ message: 'Error fetching badges' });
    }
};

/**
 * Check and award badges based on user progress
 * This should be called after completing a lesson or any action that might unlock badges
 */
export const checkAndAwardBadges = async (userId: number): Promise<Badge[]> => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return [];

        const newBadges: Badge[] = [];
        const allBadges = await Badge.findAll({ where: { isActive: true } });

        for (const badge of allBadges) {
            // Check if user already has this badge
            const existingBadge = await UserBadge.findOne({
                where: {
                    userId,
                    badgeId: badge.id
                }
            });

            if (existingBadge) continue; // Already has this badge

            // Check if user meets the requirements
            let shouldAward = false;

            switch (badge.category) {
                case 'streak':
                    // Example: "Maintain a 7-day streak"
                    if (user.streak >= 7 && badge.requirement?.includes('7')) {
                        shouldAward = true;
                    }
                    if (user.streak >= 30 && badge.requirement?.includes('30')) {
                        shouldAward = true;
                    }
                    break;

                case 'xp':
                    // Example: "Reach 1000 XP"
                    const xpRequirement = parseInt(badge.requirement?.match(/\d+/)?.[0] || '0');
                    if (user.xp >= xpRequirement) {
                        shouldAward = true;
                    }
                    break;

                case 'lessons':
                    // Example: "Complete 10 lessons"
                    const lessonRequirement = parseInt(badge.requirement?.match(/\d+/)?.[0] || '0');
                    if (user.lessonsCompleted >= lessonRequirement) {
                        shouldAward = true;
                    }
                    break;

                case 'achievement':
                    // Example: "Reach level 5"
                    const levelRequirement = parseInt(badge.requirement?.match(/\d+/)?.[0] || '0');
                    if (user.level >= levelRequirement) {
                        shouldAward = true;
                    }
                    break;

                default:
                    // Special badges handled separately
                    break;
            }

            if (shouldAward) {
                await UserBadge.create({
                    userId,
                    badgeId: badge.id,
                    unlockedAt: new Date()
                });
                newBadges.push(badge);
            }
        }

        return newBadges;
    } catch (error) {
        console.error('Error checking badges:', error);
        return [];
    }
};
