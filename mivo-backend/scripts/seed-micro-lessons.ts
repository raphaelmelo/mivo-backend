import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';

/**
 * Micro-lições estilo Duolingo sobre "Lançamento de Feature"
 * Metodologia: Role-play, andragogia, desafios reais
 * Pouco texto, alta interatividade
 */

const microLessons = [
    // 1. CONCEPT BUILDER - Fundamento teórico
    {
        title: 'Feature Flags: Lançamentos Seguros',
        description: 'Aprenda a técnica essencial para deploys sem medo',
        type: 'concept_builder' as const,
        difficulty: 'beginner' as const,
        xpReward: 50,
        estimatedMinutes: 3,
        isPremium: false,
        order: 1,
        isPublished: true,
        content: {
            concept: {
                emoji: '🚩',
                title: 'Feature Flags',
                explanation: 'Você lança código em produção, mas controla QUEM vê. Ativa/desativa features sem redeploy.',
                example: 'Instagram testou Stories com 5% dos usuários antes do lançamento global.'
            },
            questions: [
                {
                    id: 'q1',
                    question: 'Qual a vantagem de feature flags?',
                    options: [
                        { id: 'a', text: 'Evitar deploys', correct: false },
                        { id: 'b', text: 'Testar com usuários reais sem risco total', correct: true },
                        { id: 'c', text: 'Substituir testes', correct: false }
                    ],
                    explanation: 'Feature flags permitem testar em produção com segurança, rollback instantâneo.'
                },
                {
                    id: 'q2',
                    question: 'Quando usar feature flag?',
                    options: [
                        { id: 'a', text: 'Sempre', correct: false },
                        { id: 'b', text: 'Mudanças críticas ou grandes', correct: true },
                        { id: 'c', text: 'Nunca', correct: false }
                    ],
                    explanation: 'Use para features arriscadas, testes A/B ou lançamentos graduais.'
                }
            ]
        }
    },

    // 2. REAL WORLD CHALLENGE - Cenário prático
    {
        title: 'CEO Pede Feature Urgente',
        description: 'Decisão sob pressão: como responder?',
        type: 'real_world_challenge',
        difficulty: 'intermediate',
        xpReward: 75,
        estimatedMinutes: 4,
        isPremium: false,
        order: 2,
        isPublished: true,
        content: {
            context: {
                role: 'PM de Checkout',
                team: '2 devs + 1 designer',
                sprint: 'Sprint 24 (80% concluída)',
                currentWork: 'Refatoração de pagamento PIX'
            },
            trigger: {
                from: 'CEO (Slack - 19h)',
                context: 'Concorrente lançou "Compre Agora, Pague em 3x"',
                message: 'Precisamos disso AGORA! Clientes perguntando. Podemos ter amanhã?',
                urgency: 'high'
            },
            currentBacklog: [
                'Refatoração PIX (8 dias)',
                'Bug crítico: carrinho duplica itens',
                'Integração com novo gateway'
            ],
            options: [
                {
                    id: 'a',
                    text: 'Comprometer para amanhã',
                    risk: 'Time estressado, qualidade baixa, bug crítico não resolvido',
                    benefit: 'CEO feliz temporariamente'
                },
                {
                    id: 'b',
                    text: 'Dizer "não" sem contexto',
                    risk: 'CEO frustrado, parece que PM não colabora',
                    benefit: 'Protege o time'
                },
                {
                    id: 'c',
                    text: 'Propor MVP em 1 semana + teste com 10%',
                    risk: 'Não é "amanhã", exige convencimento',
                    benefit: 'Entrega rápida E segura. Dados reais antes de escalar'
                },
                {
                    id: 'd',
                    text: 'Pausar tudo e fazer feature em 3 dias',
                    risk: 'Bug crítico piora, dívida técnica cresce',
                    benefit: 'Feature sai rápido'
                }
            ],
            expertFeedback: {
                name: 'Mariana Silva',
                title: 'Head of Product - Nubank',
                feedback: {
                    intro: 'Urgência ≠ Importância. CEOs veem concorrência, PMs veem sistema.',
                    steps: [
                        '1. Validar: "Quantos clientes pediram isso?" (pode ser <5)',
                        '2. Propor: "Versão simples em 1 sem + teste 10% = dado real"',
                        '3. Mostrar risco: "Bug carrinho afeta 30% checkout agora"'
                    ],
                    warning: 'Sempre dizer "sim" destrói credibilidade. Eduque stakeholders.'
                }
            },
            stats: { a: 15, b: 5, c: 65, d: 15 }
        }
    },

    // 3. DECISION MAKER - Simulação de impacto
    {
        title: 'Simulador: Estratégia de Rollout',
        description: 'Suas escolhas afetam usuários, time e negócio',
        type: 'decision_maker',
        difficulty: 'intermediate',
        xpReward: 100,
        estimatedMinutes: 5,
        isPremium: false,
        order: 3,
        isPublished: true,
        content: {
            setup: {
                role: 'PM',
                team: 'Squad de Growth',
                sprint: 'Lançamento do novo onboarding',
                context: 'Feature pronta. Como lançar?',
                velocity: '10k novos users/dia'
            },
            rounds: [
                {
                    name: 'Decisão 1',
                    number: 1,
                    question: 'Estratégia de lançamento?',
                    scenario: 'Onboarding novo reduz 5 telas para 2. Pode aumentar conversão OU confundir.',
                    options: [
                        {
                            id: 'all',
                            text: '100% dos usuários imediatamente',
                            impact: { stakeholders: -2, users: -1, revenue: 1 }
                        },
                        {
                            id: 'ab',
                            text: 'A/B test: 50% novo, 50% antigo',
                            impact: { stakeholders: 1, users: 0, revenue: 0 }
                        },
                        {
                            id: 'gradual',
                            text: 'Gradual: 5% → 25% → 100% em 1 semana',
                            impact: { stakeholders: 2, users: 1, revenue: 1 }
                        }
                    ]
                },
                {
                    name: 'Decisão 2',
                    number: 2,
                    question: 'Bug crítico no dia 2!',
                    scenario: '5% dos users veem tela branca. O que fazer?',
                    options: [
                        {
                            id: 'rollback',
                            text: 'Rollback total imediato',
                            impact: { stakeholders: -1, users: 2, revenue: -1 }
                        },
                        {
                            id: 'wait',
                            text: 'Esperar fix (4h) mantendo feature',
                            impact: { stakeholders: 0, users: -2, revenue: 0 }
                        },
                        {
                            id: 'flag',
                            text: 'Feature flag: desativa só usuários afetados',
                            impact: { stakeholders: 1, users: 1, revenue: 1 }
                        }
                    ]
                },
                {
                    name: 'Decisão 3',
                    number: 3,
                    question: 'Comunicar sucesso?',
                    scenario: 'Conversão subiu 12%! Time quer comemorar.',
                    options: [
                        {
                            id: 'email',
                            text: 'Email toda empresa',
                            impact: { stakeholders: 1, users: 0, revenue: 0 }
                        },
                        {
                            id: 'metrics',
                            text: 'Dashboard + post-mortem detalhado',
                            impact: { stakeholders: 2, users: 0, revenue: 1 }
                        },
                        {
                            id: 'quiet',
                            text: 'Não comunicar (é só mais uma feature)',
                            impact: { stakeholders: -2, users: 0, revenue: 0 }
                        }
                    ]
                }
            ],
            results: {
                perfect: '🏆 Lançamento exemplar! Você equilibrou velocidade, segurança e comunicação.',
                good: '✅ Bom trabalho. Alguns ajustes poderiam melhorar.',
                bad: '⚠️ Lançamento arriscado. Revise estratégias de mitigação de risco.'
            }
        }
    },

    // 4. PEER REVIEW - Análise crítica
    {
        title: 'Review: Plano de Lançamento',
        description: 'Analise o plano de outro PM e dê feedback',
        type: 'peer_review',
        difficulty: 'intermediate',
        xpReward: 60,
        estimatedMinutes: 4,
        isPremium: false,
        order: 4,
        isPublished: true,
        content: {
            intro: {
                persona: 'Lucas',
                role: 'PM Júnior',
                scenario: 'Lucas preparou seu primeiro plano de lançamento. Ajude-o a melhorar.'
            },
            analyze: {
                artifact: {
                    type: 'document',
                    title: 'Plano de Lançamento - Dark Mode',
                    sections: [
                        {
                            title: 'Objetivo',
                            content: 'Lançar dark mode para todos os usuários até sexta-feira.'
                        },
                        {
                            title: 'Rollout',
                            content: 'Deploy sexta 18h. Se der problema, rollback segunda-feira.'
                        },
                        {
                            title: 'Comunicação',
                            content: 'Post no Instagram anunciando a novidade.'
                        }
                    ]
                }
            },
            problems: [
                {
                    id: 'p1',
                    text: 'Deploy sexta 18h é arriscado (fim de semana sem suporte)',
                    correct: true
                },
                {
                    id: 'p2',
                    text: 'Faltam métricas de sucesso',
                    correct: true
                },
                {
                    id: 'p3',
                    text: 'Dark mode é feature inútil',
                    correct: false
                },
                {
                    id: 'p4',
                    text: 'Não há rollout gradual',
                    correct: true
                }
            ],
            expertFeedback: {
                name: 'Carla Mendes',
                role: 'Staff PM - iFood',
                feedback: 'Nunca faça deploy grande na sexta! Adicione: métricas (% adoção, bugs), rollout gradual (5%→50%→100%), e plano B claro.',
                tips: [
                    'Deploy terça/quarta para ter tempo de reagir',
                    'Defina "sucesso" em números: ex. <1% bugs, >30% adoção',
                    'Feature flag permite rollback em segundos'
                ]
            }
        }
    },

    // 5. COMMUNITY QUEST - Colaboração
    {
        title: 'Squad: Definir Roadmap de Feature',
        description: 'Decisões em equipe sobre prioridades',
        type: 'community_quest',
        difficulty: 'intermediate',
        xpReward: 80,
        estimatedMinutes: 5,
        isPremium: false,
        order: 5,
        isPublished: true,
        content: {
            intro: {
                mission: 'Definir funcionalidade principal de um app de finanças pessoais',
                goal: 'Squad decide em conjunto a melhor estratégia'
            },
            squad: {
                members: [
                    { name: 'Ana', role: 'UX Designer', trait: 'Focada em usabilidade' },
                    { name: 'João', role: 'Engenheiro', trait: 'Pensa em escalabilidade' },
                    { name: 'Carla', role: 'Dados', trait: 'Orientada por métricas' }
                ]
            },
            challenge: {
                day1: {
                    topic: 'Core Feature',
                    question: 'Qual funcionalidade principal?',
                    options: [
                        { id: 'goals', text: 'Metas financeiras personalizadas' },
                        { id: 'invest', text: 'Recomendação de investimentos (IA)' },
                        { id: 'social', text: 'Comparação com amigos (gamificação)' }
                    ],
                    chat: [
                        { user: 'Ana', text: 'Metas são visuais e motivadoras!' },
                        { user: 'João', text: 'IA de investimento é complexa demais para MVP...' },
                        { user: 'Carla', text: 'Social pode viralizar, mas é arriscado (privacidade)' }
                    ]
                },
                day2: {
                    topic: 'Estratégia de Validação',
                    question: 'Como validar antes de construir?',
                    options: [
                        { id: 'prototype', text: 'Protótipo clickável + 20 entrevistas' },
                        { id: 'landing', text: 'Landing page fake + anúncios' },
                        { id: 'mvp', text: 'MVP em 2 semanas + beta fechado' }
                    ],
                    chat: [
                        { user: 'Ana', text: 'Protótipo é barato e rápido!' },
                        { user: 'João', text: 'Landing page valida demanda real (€€)' },
                        { user: 'Carla', text: 'MVP dá dados reais de uso' }
                    ]
                }
            },
            results: {
                success: 'Squad definiu estratégia validada! Próximo passo: construir.',
                feedback: 'Decisões colaborativas geram mais buy-in do time.'
            }
        }
    }
];

async function seedMicroLessons() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco');

        // Limpar lições existentes
        await Lesson.destroy({ where: {}, force: true });
        console.log('🗑️  Lições antigas removidas');

        // Inserir micro-lições
        await Lesson.bulkCreate(microLessons as any);
        console.log(`✅ ${microLessons.length} micro-lições inseridas`);

        // Verificar
        const count = await Lesson.count();
        console.log(`📊 Total de lições no banco: ${count}`);

        console.log('\n🎓 Jornada criada: "Lançamento de Feature"');
        console.log('   1. Concept Builder → Feature Flags');
        console.log('   2. Real World Challenge → Pressão do CEO');
        console.log('   3. Decision Maker → Simulador de Rollout');
        console.log('   4. Peer Review → Análise de Plano');
        console.log('   5. Community Quest → Squad Define Roadmap');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedMicroLessons();
