import { LessonType } from '../models/Lesson';

export class XPService {
  private static readonly XP_PER_LEVEL = 1000;

  private static readonly BASE_XP: Record<LessonType, number> = {
    [LessonType.CONCEPT_BUILDER]: 50,
    [LessonType.REAL_WORLD_CHALLENGE]: 100,
    [LessonType.PEER_REVIEW]: 75,
    [LessonType.DECISION_MAKER]: 100,
    [LessonType.COMMUNITY_QUEST]: 75
  };

  /**
   * Calculates the base XP for a given lesson type.
   */
  static getBaseXP(type: LessonType): number {
    return this.BASE_XP[type] || 10;
  }

  /**
   * Calculates the streak multiplier based on current streak days.
   * 0-13 days: 1.0x
   * 14-59 days: 1.1x
   * 60-89 days: 1.2x
   * 90+ days: 1.5x
   */
  static getStreakMultiplier(streak: number): number {
    if (streak >= 90) return 1.5;
    if (streak >= 60) return 1.2;
    if (streak >= 14) return 1.1;
    return 1.0;
  }

  /**
   * Calculates the final XP reward including multipliers.
   */
  static calculateLessonXP(type: LessonType, streak: number): { base: number; multiplier: number; total: number } {
    const base = this.getBaseXP(type);
    const multiplier = this.getStreakMultiplier(streak);
    const total = Math.floor(base * multiplier);

    return { base, multiplier, total };
  }

  /**
   * Calculates the user's level based on total XP.
   * Level = (Total XP / 1000) + 1
   */
  static calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / this.XP_PER_LEVEL) + 1;
  }

  /**
   * Checks if the new XP total results in a level up.
   */
  static checkLevelUp(oldXP: number, newXP: number): { leveledUp: boolean; newLevel: number } {
    const oldLevel = this.calculateLevel(oldXP);
    const newLevel = this.calculateLevel(newXP);
    
    return {
      leveledUp: newLevel > oldLevel,
      newLevel
    };
  }
}
