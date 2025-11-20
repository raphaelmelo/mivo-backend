/**
 * TypeScript type definitions for the Lean AI Engine
 * 
 * These types define the structure of student metrics, analytics,
 * and recommendations used throughout the AI system.
 */

export interface StudentMetrics {
    userId: number;
    completionRate: number; // Percentage (0-100)
    averageTimePerLesson: number; // Minutes
    consistencyScore: number; // Score (0-100)
    currentStreak: number; // Days
    totalLessonsCompleted: number;
    totalLessonsStarted: number;
    trend: 'improving' | 'stable' | 'declining';
    lastActivityDate: Date | null;
}

export interface TrendAnalysis {
    direction: 'improving' | 'stable' | 'declining';
    confidence: number; // 0-1
    recentPerformance: number[]; // Array of recent scores
    slope: number; // Linear regression slope
}

export interface ConsistencyScore {
    score: number; // 0-100
    currentStreak: number; // Days
    longestStreak: number; // Days
    averageGapDays: number; // Average days between sessions
    studyFrequency: number; // Sessions per week
}

export interface ProgressData {
    id: number;
    userId: number;
    lessonId: number;
    isCompleted: boolean;
    completedAt: Date | null;
    score: number | null;
    timeSpentMinutes: number;
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface LessonStats {
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    averageScore: number;
    averageTime: number;
    totalTimeSpent: number;
}

export interface Activity {
    date: Date;
    lessonsCompleted: number;
    timeSpent: number;
    averageScore: number;
}

export interface StudentProfile {
    userId: number;
    metrics: StudentMetrics;
    consistency: ConsistencyScore;
    trend: TrendAnalysis;
    recentActivity: Activity[];
}

// ===== Phase 2: Intelligence - Recommendation Types =====

export interface Recommendation {
    type: 'progression' | 'intervention' | 'engagement';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action?: string;
    badge?: BadgeRecommendation;
}

export interface BadgeRecommendation {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface RecommendationResult {
    userId: number;
    recommendations: Recommendation[];
    generatedAt: Date;
    metrics: StudentMetrics;
}

// ===== Phase 3: Analytics - Dashboard and Effectiveness Types =====

export interface StudentInsights {
    userId: number;
    metrics: StudentMetrics;
    consistency: ConsistencyScore;
    trends: TrendAnalysis;
    recommendations: Recommendation[];
    recentActivity: Activity[];
    generatedAt: Date;
}

export interface LessonEffectiveness {
    lessonId: number;
    lessonTitle: string;
    difficulty: string;
    estimatedMinutes: number;

    // Performance metrics
    totalStudents: number;
    completionRate: number;
    dropoutRate: number;
    averageAttempts: number;
    averageTimeSpent: number;
    averageScore: number;

    // Analysis
    timeEfficiencyRatio: number; // actualTime / estimatedTime
    difficultyRating: 'easier_than_expected' | 'as_expected' | 'harder_than_expected';
    needsReview: boolean; // true if dropout rate > 30% or completion rate < 50%
}

export interface LessonEffectivenessReport {
    totalLessons: number;
    analyzedLessons: number;
    lessonsNeedingReview: LessonEffectiveness[];
    allLessons: LessonEffectiveness[];
    generatedAt: Date;
}
