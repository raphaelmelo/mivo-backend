import User from '../models/User';
import League from '../models/League';
import { Op } from 'sequelize';

export const getLeagueRanking = async (userId: number) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // If user doesn't have a league, assign Bronze (league ID 1)
    if (!user.leagueId) {
        const bronzeLeague = await League.findOne({ where: { tier: 'bronze' } });
        if (bronzeLeague) {
            user.leagueId = bronzeLeague.id;
            await user.save();
        }
    }

    const league = await League.findByPk(user.leagueId || 1);
    if (!league) throw new Error('League not found');

    // Get all users in the same league, ordered by XP
    const usersInLeague = await User.findAll({
        where: { leagueId: league.id },
        order: [['xp', 'DESC']],
        limit: 50 // Top 50 users in league
    });

    // Find user's rank
    const currentUserRank = usersInLeague.findIndex(u => u.id === userId) + 1;

    return {
        tier: league.tier,
        name: league.name,
        currentUserRank,
        users: usersInLeague.map((u, index) => ({
            rank: index + 1,
            name: u.name,
            xp: u.xp,
            streak: u.streak,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
            userId: u.id,
            isCurrentUser: u.id === userId
        }))
    };
};

export const getUserLeagueInfo = async (userId: number) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // If user doesn't have a league, assign Bronze
    if (!user.leagueId) {
        const bronzeLeague = await League.findOne({ where: { tier: 'bronze' } });
        if (bronzeLeague) {
            user.leagueId = bronzeLeague.id;
            await user.save();
        }
    }

    const league = await League.findByPk(user.leagueId || 1);
    if (!league) throw new Error('League not found');

    // Count total users in league
    const totalUsers = await User.count({ where: { leagueId: league.id } });

    // Get user's rank in league
    const higherRankedUsers = await User.count({
        where: {
            leagueId: league.id,
            xp: { [Op.gt]: user.xp }
        }
    });
    const rank = higherRankedUsers + 1;

    return {
        rank,
        tier: league.tier,
        totalUsers
    };
};

export const updateUserLeague = async (userId: number) => {
    // Logic to promote/demote user based on XP or weekly performance
    // For MVP, maybe just check total XP thresholds?
    // Checklist says: "Bronze -> Prata -> Ouro -> Platina -> Diamante"

    const user = await User.findByPk(userId);
    if (!user) return;

    // Simple threshold logic for now
    let newTier = 'bronze';
    if (user.xp >= 10000) newTier = 'diamond';
    else if (user.xp >= 3000) newTier = 'platinum';
    else if (user.xp >= 1500) newTier = 'gold';
    else if (user.xp >= 500) newTier = 'silver';

    let currentLeague = null;
    if (user.leagueId) {
        currentLeague = await League.findByPk(user.leagueId);
    }

    if (!currentLeague || currentLeague.tier !== newTier) {
        const newLeague = await League.findOne({ where: { tier: newTier } });
        if (newLeague) {
            user.leagueId = newLeague.id;
            await user.save();
        }
    }
};
