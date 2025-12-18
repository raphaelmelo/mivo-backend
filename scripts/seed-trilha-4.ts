import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';
import fs from 'fs';
import path from 'path';

const lessonsPath = path.join(__dirname, '../bd_lessons/trilha-4.json');
const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8')).slice(5);

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

async function seedTrilha4() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco');

        let createdCount = 0;

        for (const lesson of lessonsData) {
            // Check if exists just in case to avoid unique constraint errors if any
            const exists = await Lesson.findOne({ where: { title: lesson.title } });
            if (!exists) {
                // Transform content to match project standard
                const transformedContent = transformLessonContent(lesson);

                await Lesson.create({
                    ...lesson,
                    content: transformedContent
                });
                createdCount++;
            }
        }

        console.log(`✅ ${createdCount} lições da Trilha 4 inseridas`);

        // Verificar
        const count = await Lesson.count();
        console.log(`📊 Total de lições no banco: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedTrilha4();
