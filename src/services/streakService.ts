import User from '../models/User';

export class StreakService {
  /**
   * Updates the user's streak based on the last active date.
   * Returns validation of the streak update.
   */
  static async updateStreak(user: User): Promise<{ streak: number; streakBonus: number; broken: boolean }> {
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);
    
    // Reset time components to compare just dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    
    const diffInMs = today.getTime() - lastDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let streakBonus = 0;
    let broken = false;

    if (diffInDays === 1) {
      // Consecutive day - increment streak
      user.streak += 1;
      
      // Check for milestone bonuses
      streakBonus = this.getStreakMilestoneBonus(user.streak);
      
    } else if (diffInDays > 1) {
      // Streak broken (missed at least one whole day)
      user.streak = 1; // Reset to 1 (today counts)
      broken = true;
    } else if (user.streak === 0) {
      // First activity ever
      user.streak = 1;
    }
    // If diffInDays === 0, user already active today, no change

    user.lastActiveDate = now;
    
    // We don't save here to allow transaction control in controller
    return { streak: user.streak, streakBonus, broken };
  }

  /**
   * Returns bonus XP for hitting specific streak milestones.
   * 7 days: 50 XP
   * 30 days: 200 XP
   */
  static getStreakMilestoneBonus(streak: number): number {
    if (streak === 30) return 200;
    if (streak === 7) return 50;
    return 0;
  }
}
