import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as leagueService from '../services/leagueService';

/**
 * Get league ranking for the user's current league
 */
export const getLeagueRanking = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const rankingData = await leagueService.getLeagueRanking(userId);
        res.json(rankingData);
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

        const leagueInfo = await leagueService.getUserLeagueInfo(userId);
        res.json(leagueInfo);
    } catch (error) {
        console.error('Error fetching user league info:', error);
        res.status(500).json({ message: 'Error fetching user league info' });
    }
};

