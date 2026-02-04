import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Badge, { BadgeCategory } from '../models/Badge';
import UserBadge from '../models/UserBadge';
import User from '../models/User';
import { BadgeService, UnlockedBadge, BadgeRequirement } from '../services/badgeService';
import { Op } from 'sequelize';

// ============================================================================
// HELPER FUNCTIONS (Business Logic)
// ============================================================================

// Logic moved to BadgeService
// This function is kept for backward compatibility if imported elsewhere, but delegates to service
export const checkAndUnlockBadges = async (userId: number): Promise<UnlockedBadge[]> => {
    const { BadgeService } = await import('../services/badgeService');
    return BadgeService.checkAndUnlockBadges(userId);
};

// ============================================================================
// CONTROLLER ENDPOINTS
// ============================================================================

/**
 * GET /api/badges
 * Get all available badges
 */
export const getAllBadges = async (req: Request, res: Response) => {
    try {
        const badges = await Badge.findAll({
            where: { isActive: true },
            order: [['category', 'ASC'], ['id', 'ASC']],
        });

        res.json({
            success: true,
            count: badges.length,
            badges,
        });
    } catch (error) {
        console.error('Error fetching all badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching badges',
        });
    }
};

/**
 * GET /api/badges/user
 * Get badges for authenticated user
 */
export const getUserBadges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const userBadges = await UserBadge.findAll({
            where: { userId },
            include: [{
                model: Badge,
                as: 'badge',
                where: { isActive: true },
            }],
            order: [['unlockedAt', 'DESC']],
        });

        const badges = userBadges.map(ub => ({
            id: (ub as any).badge.id,
            name: (ub as any).badge.name,
            description: (ub as any).badge.description,
            category: (ub as any).badge.category,
            iconUrl: (ub as any).badge.iconUrl,
            unlockedAt: ub.unlockedAt,
        }));

        res.json({
            success: true,
            count: badges.length,
            badges,
        });
    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user badges',
        });
    }
};

/**
 * GET /api/badges/progress
 * Get badge unlock progress for authenticated user
 */
export const getBadgeProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get badges the user doesn't have yet
        const userBadgeIds = await UserBadge.findAll({
            where: { userId },
            attributes: ['badgeId'],
            raw: true,
        });

        const lockedBadgeIds = userBadgeIds.map(ub => ub.badgeId);

        const lockedBadges = await Badge.findAll({
            where: {
                isActive: true,
                id: {
                    [Op.notIn]: lockedBadgeIds.length > 0 ? lockedBadgeIds : [0],
                },
            },
        });

        // Calculate progress for each locked badge
        const progress = lockedBadges.map(badge => {
            const requirement = badge.requirement as BadgeRequirement;
            let progressPercent = 0;
            let current = 0;
            let target = 0;

            switch (requirement.type) {
                case 'streak':
                    current = user.streak;
                    target = requirement.value || 0;
                    progressPercent = Math.min((current / target) * 100, 100);
                    break;

                case 'xp':
                    current = user.xp;
                    target = requirement.value || 0;
                    progressPercent = Math.min((current / target) * 100, 100);
                    break;

                case 'lessons':
                    current = user.lessonsCompleted;
                    target = requirement.value || 0;
                    progressPercent = Math.min((current / target) * 100, 100);
                    break;

                case 'level':
                    current = user.level;
                    target = requirement.value || 0;
                    progressPercent = Math.min((current / target) * 100, 100);
                    break;

                case 'composite':
                    const progressValues = [];
                    if (requirement.minStreak !== undefined) {
                        progressValues.push(Math.min((user.streak / requirement.minStreak) * 100, 100));
                    }
                    if (requirement.minXp !== undefined) {
                        progressValues.push(Math.min((user.xp / requirement.minXp) * 100, 100));
                    }
                    if (requirement.minLessons !== undefined) {
                        progressValues.push(Math.min((user.lessonsCompleted / requirement.minLessons) * 100, 100));
                    }
                    if (requirement.minLevel !== undefined) {
                        progressValues.push(Math.min((user.level / requirement.minLevel) * 100, 100));
                    }
                    progressPercent = progressValues.length > 0
                        ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
                        : 0;
                    break;
            }

            return {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                category: badge.category,
                iconUrl: badge.iconUrl,
                requirement: badge.requirement,
                progress: Math.round(progressPercent),
                current,
                target,
            };
        });

        res.json({
            success: true,
            count: progress.length,
            progress,
        });
    } catch (error) {
        console.error('Error fetching badge progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching badge progress',
        });
    }
};

/**
 * POST /api/badges/check
 * Manually trigger badge check for authenticated user
 */
export const checkBadges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const newBadges = await checkAndUnlockBadges(userId);

        res.json({
            success: true,
            message: newBadges.length > 0
                ? `Congratulations! You unlocked ${newBadges.length} new badge(s)!`
                : 'No new badges unlocked',
            count: newBadges.length,
            newBadges,
        });
    } catch (error) {
        console.error('Error checking badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking badges',
        });
    }
};
