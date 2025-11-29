import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import UserBadge from '../models/UserBadge';
import Badge from '../models/Badge';
import * as badgeService from '../services/badgeService';

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
    return badgeService.checkAndAwardBadges(userId);
};

