import { Engine } from 'json-rules-engine';
import { StudentAnalyzer } from './StudentAnalyzer';
import {
    Recommendation,
    RecommendationResult,
    StudentMetrics,
} from './types';

/**
 * RecommendationEngine Service
 * 
 * Generates personalized recommendations for students based on
 * their performance metrics using a rule-based system.
 */
export class RecommendationEngine {
    private engine: Engine;
    private studentAnalyzer: StudentAnalyzer;

    constructor() {
        this.engine = new Engine();
        this.studentAnalyzer = new StudentAnalyzer();
        this.initializeRules();
    }

    /**
     * Get personalized recommendations for a student
     */
    async getRecommendations(userId: number): Promise<RecommendationResult> {
        // Get student metrics
        const metrics = await this.studentAnalyzer.getStudentMetrics(userId);

        // Run rules engine
        const { events } = await this.engine.run(metrics);

        // Convert events to recommendations
        const recommendations: Recommendation[] = events
            .filter(event => event.params) // Filter out events without params
            .map(event => ({
                type: event.params!.type,
                priority: event.params!.priority,
                title: event.params!.title,
                description: event.params!.description,
                action: event.params!.action,
                badge: event.params!.badge,
            }));

        // Sort by priority (high > medium > low)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        // Limit to top 5 recommendations
        const limitedRecommendations = recommendations.slice(0, 5);

        return {
            userId,
            recommendations: limitedRecommendations,
            generatedAt: new Date(),
            metrics,
        };
    }

    /**
     * Initialize all pedagogical rules
     */
    private initializeRules(): void {
        this.addProgressionRules();
        this.addInterventionRules();
        this.addEngagementRules();
    }

    /**
     * Add progression rules (when to advance difficulty)
     */
    private addProgressionRules(): void {
        // Rule 1: Ready for Advanced
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'completionRate',
                        operator: 'greaterThanInclusive',
                        value: 80,
                    },
                    {
                        fact: 'averageTimePerLesson',
                        operator: 'greaterThan',
                        value: 0, // Has data
                    },
                    {
                        fact: 'consistencyScore',
                        operator: 'greaterThanInclusive',
                        value: 70,
                    },
                ],
            },
            event: {
                type: 'progression',
                params: {
                    type: 'progression',
                    priority: 'high',
                    title: 'Pronto para Desafios Avançados! 🚀',
                    description: 'Você está performando excepcionalmente bem. Que tal tentar lições mais desafiadoras?',
                    action: 'unlock_advanced_content',
                },
            },
        });

        // Rule 2: Steady Progress
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'completionRate',
                        operator: 'greaterThanInclusive',
                        value: 60,
                    },
                    {
                        fact: 'trend',
                        operator: 'equal',
                        value: 'improving',
                    },
                ],
            },
            event: {
                type: 'progression',
                params: {
                    type: 'progression',
                    priority: 'medium',
                    title: 'Continue Evoluindo! 📈',
                    description: 'Suas notas estão melhorando. Continue nesse ritmo!',
                },
            },
        });
    }

    /**
     * Add intervention rules (when to suggest review/help)
     */
    private addInterventionRules(): void {
        // Rule 3: Needs Review
        this.engine.addRule({
            conditions: {
                any: [
                    {
                        fact: 'completionRate',
                        operator: 'lessThan',
                        value: 40,
                    },
                    {
                        fact: 'totalLessonsCompleted',
                        operator: 'greaterThan',
                        value: 0,
                    },
                ],
            },
            event: {
                type: 'intervention',
                params: {
                    type: 'intervention',
                    priority: 'high',
                    title: 'Hora de Revisar! 📚',
                    description: 'Parece que alguns conceitos precisam de reforço. Que tal revisar lições anteriores?',
                    action: 'suggest_review',
                },
            },
        });

        // Rule 4: Inconsistent Study
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'currentStreak',
                        operator: 'equal',
                        value: 0,
                    },
                    {
                        fact: 'totalLessonsCompleted',
                        operator: 'greaterThan',
                        value: 0,
                    },
                ],
            },
            event: {
                type: 'intervention',
                params: {
                    type: 'intervention',
                    priority: 'medium',
                    title: 'Retome seus Estudos! ⏰',
                    description: 'Faz um tempo desde sua última lição. Mantenha o hábito vivo!',
                    action: 'encourage_return',
                },
            },
        });

        // Rule 5: Declining Performance
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'trend',
                        operator: 'equal',
                        value: 'declining',
                    },
                    {
                        fact: 'totalLessonsCompleted',
                        operator: 'greaterThan',
                        value: 5,
                    },
                ],
            },
            event: {
                type: 'intervention',
                params: {
                    type: 'intervention',
                    priority: 'high',
                    title: 'Ajuste sua Estratégia 🎯',
                    description: 'Suas notas têm caído. Tente revisar conceitos fundamentais.',
                    action: 'suggest_fundamentals',
                },
            },
        });
    }

    /**
     * Add engagement rules (badges and rewards)
     */
    private addEngagementRules(): void {
        // Rule 6: Week Warrior
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'currentStreak',
                        operator: 'greaterThanInclusive',
                        value: 7,
                    },
                    {
                        fact: 'currentStreak',
                        operator: 'lessThan',
                        value: 30,
                    },
                ],
            },
            event: {
                type: 'engagement',
                params: {
                    type: 'engagement',
                    priority: 'medium',
                    title: 'Badge Desbloqueado! 🏆',
                    description: '7 dias consecutivos de estudo!',
                    badge: {
                        id: 'week_warrior',
                        name: 'Guerreiro Semanal',
                        description: 'Completou 7 dias seguidos',
                        icon: '🔥',
                    },
                },
            },
        });

        // Rule 7: Month Master
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'currentStreak',
                        operator: 'greaterThanInclusive',
                        value: 30,
                    },
                ],
            },
            event: {
                type: 'engagement',
                params: {
                    type: 'engagement',
                    priority: 'high',
                    title: 'Badge Épico Desbloqueado! 👑',
                    description: '30 dias consecutivos! Você é dedicação pura!',
                    badge: {
                        id: 'month_master',
                        name: 'Mestre do Mês',
                        description: 'Completou 30 dias seguidos',
                        icon: '👑',
                    },
                },
            },
        });

        // Rule 8: Perfectionist
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'completionRate',
                        operator: 'equal',
                        value: 100,
                    },
                    {
                        fact: 'totalLessonsCompleted',
                        operator: 'greaterThanInclusive',
                        value: 10,
                    },
                ],
            },
            event: {
                type: 'engagement',
                params: {
                    type: 'engagement',
                    priority: 'high',
                    title: 'Badge Perfeccionista! ⭐',
                    description: '100% de completude em todas as lições!',
                    badge: {
                        id: 'perfectionist',
                        name: 'Perfeccionista',
                        description: 'Completou todas as lições iniciadas',
                        icon: '⭐',
                    },
                },
            },
        });

        // Rule 9: Fast Learner
        this.engine.addRule({
            conditions: {
                all: [
                    {
                        fact: 'averageTimePerLesson',
                        operator: 'lessThan',
                        value: 10,
                    },
                    {
                        fact: 'averageTimePerLesson',
                        operator: 'greaterThan',
                        value: 0,
                    },
                    {
                        fact: 'totalLessonsCompleted',
                        operator: 'greaterThan',
                        value: 5,
                    },
                ],
            },
            event: {
                type: 'engagement',
                params: {
                    type: 'engagement',
                    priority: 'medium',
                    title: 'Badge Aprendiz Rápido! ⚡',
                    description: 'Alta performance em pouco tempo!',
                    badge: {
                        id: 'fast_learner',
                        name: 'Aprendiz Rápido',
                        description: 'Aprende rápido e bem',
                        icon: '⚡',
                    },
                },
            },
        });
    }
}

export default RecommendationEngine;
