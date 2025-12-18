import sequelize from '../src/config/database';
import Journey from '../src/models/Journey';
import Lesson from '../src/models/Lesson';
import fs from 'fs';
import path from 'path';

const journeysData = [
    {
        id: 1,
        name: 'Fundamentos da Estratégia',
        description: 'Conceitos fundamentais e ferramentas de avaliação estratégica.',
        icon: '♟️',
        order: 1,
        isPublished: true
    },
    {
        id: 2,
        name: 'Tipos e Técnicas de Estratégia',
        description: 'Diferentes tipos de estratégia e ferramentas de construção.',
        icon: '🛠️',
        order: 2,
        isPublished: true
    },
    {
        id: 3,
        name: 'OKRs: Definição e Priorização',
        description: 'Definição e priorização de objetivos e resultados chave.',
        icon: '🎯',
        order: 3,
        isPublished: true
    },
    {
        id: 4,
        name: 'KPIs',
        description: 'Indicadores chave de performance e métricas.',
        icon: '📊',
        order: 4,
        isPublished: true
    },
    {
        id: 5,
        name: 'Conceitos de Product Market Fit',
        description: 'Entendendo e alcançando o ajuste do produto ao mercado.',
        icon: '🧩',
        order: 5,
        isPublished: true
    },
    {
        id: 6,
        name: 'NPS e MVP no PMF',
        description: 'Métricas de lealdade e validação com MVP.',
        icon: '❤️',
        order: 6,
        isPublished: true
    },
    {
        id: 7,
        name: 'Ciclo de Vida de Produto',
        description: 'Etapas do ciclo de vida do produto e estratégias.',
        icon: '🔄',
        order: 7,
        isPublished: true
    },
    {
        id: 8,
        name: 'Métricas do Ciclo de Vida',
        description: 'Métricas específicas para cada fase do ciclo de vida.',
        icon: '📉',
        order: 8,
        isPublished: true
    },
    {
        id: 9,
        name: 'Visão de Produto',
        description: 'Definindo e comunicando a visão do produto.',
        icon: '🔭',
        order: 9,
        isPublished: true
    },
    {
        id: 10,
        name: 'ROI',
        description: 'Cálculo e importância do Retorno sobre Investimento.',
        icon: '💰',
        order: 10,
        isPublished: true
    },
    {
        id: 11,
        name: 'Customer Development',
        description: 'Processo de desenvolvimento de clientes e validação.',
        icon: '👥',
        order: 11,
        isPublished: true
    },
    {
        id: 12,
        name: 'Answer First/Last & JTBD',
        description: 'Metodologias de validação e Jobs to be Done.',
        icon: '✅',
        order: 12,
        isPublished: true
    }
];

function transformLessonContent(lesson: any) {
    const { type, content } = lesson;

    if (type === 'real_world_challenge') {
        // Transform expertFeedback
        if (typeof content.expertFeedback === 'string') {
            content.expertFeedback = {
                name: 'Expert',
                role: 'Senior PM',
                feedback: content.expertFeedback
            };
        }

        // Transform trigger
        if (typeof content.trigger === 'string') {
            content.trigger = {
                from: 'Stakeholder',
                message: content.trigger,
                urgency: 'high'
            };
        }
    } else if (type === 'peer_review') {
        if (content.expertFeedback && !content.expertFeedback.tips) {
            content.expertFeedback.tips = [
                "Foque em métricas claras",
                "Considere o impacto no longo prazo",
                "Valide com stakeholders"
            ];
        }
    } else if (type === 'community_quest') {
        if (!content.squad || !content.squad.members) {
            content.squad = {
                members: [
                    { name: 'Alex', role: 'PM', trait: 'Analítico' },
                    { name: 'Bia', role: 'Designer', trait: 'Criativa' },
                    { name: 'Dani', role: 'Dev', trait: 'Pragmático' }
                ]
            };
        }
        if (!content.results || !content.results.success) {
            content.results = {
                ...content.results,
                success: 'Missão concluída com sucesso! Seu squad aprendeu muito com as decisões tomadas.'
            };
        }
    } else if (type === 'decision_maker') {
        if (content.setup) {
            content.setup.team = content.setup.team || 'Core Team';
            content.setup.sprint = content.setup.sprint || 'Atual';
        }
        if (content.rounds) {
            content.rounds.forEach((round: any) => {
                round.scenario = round.scenario || round.question || 'Analise as opções e tome sua decisão.';
            });
        }
        if (!content.results) {
            content.results = {
                perfect: 'Excelente trabalho!',
                good: 'Bom trabalho!',
                bad: 'Pode melhorar.'
            };
        }
    }

    return content;
}

async function seedNovaJornada() {
    try {
        console.log('🌱 Conectando ao banco...');
        await sequelize.authenticate();
        console.log('✅ Conectado.');

        // Sync para garantir tabelas
        await sequelize.sync({ alter: true });

        // 1. Criar Jornadas
        console.log('\n📚 Criando/Atualizando jornadas...');
        for (const journey of journeysData) {
            await Journey.upsert(journey);
            console.log(`   ✅ Jornada ${journey.id}: ${journey.name}`);
        }

        // 2. Ler JSON de Lições
        const jsonPath1 = path.join(__dirname, '../bd_lessons/nova-jornada-part1.json');
        // const jsonPath2 = path.join(__dirname, '../bd_lessons/nova-jornada-part2.json');

        const lessonsData1 = JSON.parse(fs.readFileSync(jsonPath1, 'utf-8'));
        // const lessonsData2 = JSON.parse(fs.readFileSync(jsonPath2, 'utf-8'));

        const lessonsData = [...lessonsData1];
        console.log(`\n📖 Lendo ${lessonsData.length} lições de nova-jornada-part1.json`);

        // 3. Inserir Lições
        console.log('\n📝 Inserindo lições...');

        // Limpar lições existentes destas jornadas
        await Lesson.destroy({ where: { journeyId: journeysData.map(j => j.id) } });
        console.log('   🗑️  Lições antigas destas jornadas removidas.');

        for (const lesson of lessonsData) {
            const journeyId = lesson.journeyOrder;

            if (!journeyId) {
                console.warn(`   ⚠️ Lição "${lesson.title}" sem journeyOrder. Pulando.`);
                continue;
            }

            const { journeyOrder, ...lessonData } = lesson;

            // Transform content to match project standard
            const transformedContent = transformLessonContent(lesson);

            await Lesson.create({
                ...lessonData,
                content: transformedContent,
                journeyId: journeyId
            });
        }
        console.log(`   ✅ ${lessonsData.length} lições inseridas.`);

        console.log('\n🎉 Seed concluído com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedNovaJornada();
