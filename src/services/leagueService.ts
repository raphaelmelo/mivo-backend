import League from '../models/League';
import User from '../models/User';
import { Op } from 'sequelize';

export class LeagueService {
    /**
     * Updates the user's league based on their total XP.
     * Bronze: 0 - 499
     * Silver: 500 - 1499
     * Gold: 1500 - 2999
     * Platinum: 3000 - 9999
     * Diamond: 10000+
     */
    static async updateUserLeague(user: User): Promise<void> {
        const leagues = await League.findAll({ order: [['minXp', 'ASC']] });
        if (!leagues.length) return;

        let targetLeague = leagues[0]; // Default to lowest

        for (const league of leagues) {
            if (user.xp >= league.minXp) {
                targetLeague = league;
            } else {
                break; // XP is not enough for next tiers
            }
        }

        if (user.leagueId !== targetLeague.id) {
            user.leagueId = targetLeague.id;
            // No save here, caller serves as transaction boundary or saves user
        }
    }

    /**
     * Get top users for a specific league
     */
    static async getLeagueRanking(leagueId: number, limit: number = 50): Promise<User[]> {
        return User.findAll({
            where: { leagueId },
            order: [['xp', 'DESC']],
            limit
        });
    }
}
