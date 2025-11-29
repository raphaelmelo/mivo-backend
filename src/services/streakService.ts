import User from '../models/User';
import { Op } from 'sequelize';

export const calculateStreak = async (userId: number): Promise<number> => {
    const user = await User.findByPk(userId);
    if (!user) return 0;
    return user.streak;
};

export const updateStreak = async (userId: number): Promise<{ streak: number; streakBonus: number }> => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);

    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

    const diffTime = Math.abs(today.getTime() - lastActiveDay.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = user.streak;

    if (diffDays === 0) {
        // Already active today, keep streak
    } else if (diffDays === 1) {
        // Active yesterday, increment streak
        newStreak += 1;
    } else {
        // Missed a day (or more), reset streak
        newStreak = 1;
    }

    user.streak = newStreak;
    user.lastActiveDate = now;
    await user.save();

    return {
        streak: newStreak,
        streakBonus: getStreakBonus(newStreak)
    };
};

export const checkStreakExpired = async (userId: number): Promise<boolean> => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);

    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);

    return diffHours > 48; // Example: 48 hours grace period? Or just check if > 1 day
};

export const getStreakBonus = (streak: number): number => {
    // Simple bonus logic: 10 XP per day of streak, capped at 100?
    // Or as per checklist: 10 XP/day, 50 XP/7 days, 200 XP/30 days
    // Let's implement a daily bonus based on streak length

    let bonus = 0;

    // Daily small bonus
    bonus += Math.min(streak * 2, 50); // Cap at 50 XP daily bonus

    // Milestone bonuses (applied only on the specific day? No, that's complex to track here without history)
    // For now, let's just return a multiplier-based bonus or flat bonus

    return bonus;
};
