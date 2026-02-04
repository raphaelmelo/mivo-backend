import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import League from '../models/League';
import { Op } from 'sequelize';

/**
 * Get league ranking for the user's current league
 */
export const getLeagueRanking = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Import service
        const { LeagueService } = await import('../services/leagueService');

        // Ensure user has a league
        if (!user.leagueId) {
            await LeagueService.updateUserLeague(user);
            await user.save();
        }

        // If still no league (shouldn't happen if initialized correctly), fallback
        if (!user.leagueId) {
             const bronzeLeague = await League.findOne({ where: { tier: 'bronze' } });
             if (bronzeLeague) {
                 user.leagueId = bronzeLeague.id;
                 await user.save();
             }
        }
        
        const league = await League.findByPk(user.leagueId || 1);
        if (!league) {
            return res.status(404).json({ message: 'League not found' });
        }

        // Use service to get ranking
        const usersInLeague = await LeagueService.getLeagueRanking(league.id);

        // Find user's rank
        const currentUserRank = usersInLeague.findIndex(u => u.id === userId) + 1;

        res.json({
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
        });
    } catch (error) {
        console.error('Error fetching league ranking:', error);
        res.status(500).json({ message: 'Error fetching league ranking' });
    }
};

/**
 * Get user's current league info (rank, tier, total users)
 */
export const getUserLeagueInfo = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user doesn't have a league, assign Bronze
        if (!user.leagueId) {
            const bronzeLeague = await League.findOne({ where: { tier: 'bronze' } });
            if (bronzeLeague) {
                user.leagueId = bronzeLeague.id;
                await user.save();
            }
        }

        const league = await League.findByPk(user.leagueId || 1);
        if (!league) {
            return res.status(404).json({ message: 'League not found' });
        }

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

        res.json({
            rank,
            tier: league.tier,
            totalUsers
        });
    } catch (error) {
        console.error('Error fetching user league info:', error);
        res.status(500).json({ message: 'Error fetching user league info' });
    }
};
