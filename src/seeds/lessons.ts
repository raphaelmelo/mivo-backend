import sequelize from '../config/database';
import Journey from '../models/Journey';
import Lesson from '../models/Lesson';
import fs from 'fs';
import path from 'path';

const journeysData = [
    {
        id: 1,
        name: 'Jornada Completa: Product Discovery',
        description: 'Uma jornada completa passando por todos os fundamentos de Product Discovery, desde a concepção até a validação.',
        icon: '🚀',
        order: 1,
        isPublished: true
    }
];

function transformLessonContent(lesson: any) {
    const { type, content } = lesson;

    if (type === 'real_world_challenge') {
        if (typeof content.expertFeedback === 'string') {
            content.expertFeedback = {
                name: 'Expert',
                role: 'Senior PM',
                feedback: content.expertFeedback
            };
        }
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

async function seedLessons() {
    try {
        console.log('🌱 Conectando ao banco...');
        await sequelize.authenticate();
        
        // 1. Limpar TODAS as lições e jornadas antigas
        console.log('\n🧹 Limpando lições e jornadas antigas...');
        await Lesson.destroy({ where: {} });
        await Journey.destroy({ where: {} });

        // 2. Criar Jornada Principal
        console.log('\n📚 Criando Jornada Principal...');
        for (const journey of journeysData) {
            await Journey.create(journey);
            console.log(`   ✅ Jornada ${journey.id}: ${journey.name}`);
        }

        // 3. Ler JSON de Lições
        // Em prod/Docker, o caminho base é /app. dist/seeds/lessons.js -> ../../bd_lessons/
        const isProd = __filename.endsWith('.js');
        const basePath = isProd ? path.join(__dirname, '../../') : path.join(__dirname, '../../');
        const jsonPath = path.join(basePath, 'bd_lessons/nova-jornada-part1.json');

        console.log(`\n📖 Lendo lições de: ${jsonPath}`);
        if (!fs.existsSync(jsonPath)) {
            throw new Error(`Arquivo não encontrado: ${jsonPath}`);
        }

        const lessonsRaw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        
        // 4. Pegar exatamente 31 lições como solicitado
        const lessonsToSeed = lessonsRaw.slice(0, 31);
        console.log(`   ✅ Processando as primeiras ${lessonsToSeed.length} lições.`);

        // 5. Inserir Lições na Jornada 1
        let globalOrder = 1;
        for (const lesson of lessonsToSeed) {
            const { journeyOrder, ...lessonData } = lesson;
            const transformedContent = transformLessonContent(lesson);

            await Lesson.create({
                ...lessonData,
                content: transformedContent,
                journeyId: 1,
                order: globalOrder++
            });
        }

        console.log(`\n🎉 Seed concluído! ${lessonsToSeed.length} lições inseridas na Jornada 1.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}

seedLessons();
