import Badge, { BadgeCategory } from '../models/Badge';
import UserBadge from '../models/UserBadge';
import User from '../models/User';

export interface BadgeRequirement {
    type: 'streak' | 'xp' | 'lessons' | 'level' | 'composite';
    value?: number;
    minStreak?: number;
    minXp?: number;
    minLessons?: number;
    minLevel?: number;
}

export interface UnlockedBadge {
    id: number;
    name: string;
    description: string;
    category: string;
    iconUrl: string;
    unlockedAt: Date;
}

export class BadgeService {
    /**
     * Check and unlock badges for a user.
     * Logic extracted from BadgeController.
     */
    static async checkAndUnlockBadges(userId: number): Promise<UnlockedBadge[]> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const allBadges = await Badge.findAll({
            where: { isActive: true },
        });

        const existingUserBadges = await UserBadge.findAll({
            where: { userId },
            attributes: ['badgeId'],
        });
        const existingBadgeIds = existingUserBadges.map(ub => ub.badgeId);

        const newlyUnlockedBadges: UnlockedBadge[] = [];

        for (const badge of allBadges) {
            // Skip if user already has this badge
            if (existingBadgeIds.includes(badge.id)) {
                continue;
            }

            // Check if requirement is met
            const requirement = badge.requirement as BadgeRequirement;
            if (this.isRequirementMet(user, requirement)) {
                const now = new Date();
                await UserBadge.create({
                    userId,
                    badgeId: badge.id,
                    unlockedAt: now,
                });

                newlyUnlockedBadges.push({
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    category: badge.category,
                    iconUrl: badge.iconUrl,
                    unlockedAt: now,
                });
            }
        }

        return newlyUnlockedBadges;
    }

    private static isRequirementMet(user: User, requirement: BadgeRequirement): boolean {
        switch (requirement.type) {
            case 'streak':
                return user.streak >= (requirement.value || 0);

            case 'xp':
                return user.xp >= (requirement.value || 0);

            case 'lessons':
                return user.lessonsCompleted >= (requirement.value || 0);

            case 'level':
                return user.level >= (requirement.value || 0);

            case 'composite':
                const checks = [];
                if (requirement.minStreak !== undefined) {
                    checks.push(user.streak >= requirement.minStreak);
                }
                if (requirement.minXp !== undefined) {
                    checks.push(user.xp >= requirement.minXp);
                }
                if (requirement.minLessons !== undefined) {
                    checks.push(user.lessonsCompleted >= requirement.minLessons);
                }
                if (requirement.minLevel !== undefined) {
                    checks.push(user.level >= requirement.minLevel);
                }
                return checks.length > 0 && checks.every(c => c);

            default:
                return false;
        }
    }

    /**
     * Get all badges unlocked by a user
     */
    static async getUserBadges(userId: number): Promise<UnlockedBadge[]> {
        const userBadges = await UserBadge.findAll({
            where: { userId },
            include: [{
                model: Badge,
                as: 'badge',
                where: { isActive: true },
            }],
            order: [['unlockedAt', 'DESC']],
        });

        return userBadges.map(ub => ({
            id: (ub as any).badge.id,
            name: (ub as any).badge.name,
            description: (ub as any).badge.description,
            category: (ub as any).badge.category,
            iconUrl: (ub as any).badge.iconUrl,
            unlockedAt: ub.unlockedAt,
        }));
    }
}
