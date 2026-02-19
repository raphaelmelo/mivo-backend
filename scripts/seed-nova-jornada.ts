import sequelize from '../src/config/database';
import Journey from '../src/models/Journey';
import Lesson from '../src/models/Lesson';
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

        // 1. Limpar Jornadas Antigas (IDs 2 a 12) e suas lições primeiro
        // (Isso é feito implicitamente ao re-inserir, mas podemos ser explícitos se quisermos garantir limpeza)
        // Por segurança, vamos deletar lições primeiro, depois jornadas extras.
        
        console.log('\n🧹 Limpando jornadas antigas (IDs 2-20)...');
        // Vamos assumir que queremos limpar tudo exceto a ID 1, ou recriá-la.
        // Como o ID é serial, upsert cuida do 1. Vamos deletar > 1.
        const { Op } = require('sequelize');
        
        // 1. Limpar TUDO (Lições e Jornadas) para garantir estado limpo
        console.log('\n🧹 Limpando TODAS as lições e jornadas antigas...');
        
        // Remove ALL lessons
        await Lesson.destroy({
            where: {},
            // truncate: true, // Causing locks?
        });
        console.log('   ✅ Tabela de lições limpa.');

        // Remove ALL journeys
        await Journey.destroy({
            where: {},
            // truncate: true,
        });
        console.log('   ✅ Tabela de jornadas limpa.');

        // 2. Criar/Atualizar a Jornada Principal
        console.log('\n📚 Criando/Atualizando Jornada Principal...');
        for (const journey of journeysData) {
            await Journey.upsert(journey);
            console.log(`   ✅ Jornada ${journey.id}: ${journey.name}`);
        }

        // 3. Ler JSON de Lições
        const jsonPath1 = path.join(__dirname, '../bd_lessons/nova-jornada-part1.json');
        
        // Verifique se existem outras partes se necessário
        // const jsonPath2 = path.join(__dirname, '../bd_lessons/nova-jornada-part2.json');

        const lessonsData1 = JSON.parse(fs.readFileSync(jsonPath1, 'utf-8'));
        // const lessonsData2 = fs.existsSync(jsonPath2) ? JSON.parse(fs.readFileSync(jsonPath2, 'utf-8')) : [];

        // Combinar todas as lições
        const allLessons = [...lessonsData1];
        
        // Ordenar as lições para garantir a sequência correta
        // Ordem original: journeyOrder (agrupamento anterior) -> order (sequência dentro do grupo)
        allLessons.sort((a, b) => {
             if (a.journeyOrder !== b.journeyOrder) {
                 return a.journeyOrder - b.journeyOrder;
             }
             return a.order - b.order;
        });

        console.log(`\n📖 Lendo e processando ${allLessons.length} lições.`);

        // 4. Inserir Lições na Jornada 1
        console.log('\n📝 Inserindo lições na Jornada 1...');

        // Limpar lições existentes da Jornada 1 para evitar duplicatas ou lixo
        await Lesson.destroy({ where: { journeyId: 1 } });
        console.log('   🗑️  Lições antigas da Jornada 1 removidas.');

        let globalOrder = 1;

        for (const lesson of allLessons) {
            
            const { journeyOrder, ...lessonData } = lesson; // Remove journeyOrder, we don't need it anymore

            // Transform content to match project standard
            const transformedContent = transformLessonContent(lesson);

            await Lesson.create({
                ...lessonData,
                content: transformedContent,
                journeyId: 1, // Todas vão para a Jornada 1
                order: globalOrder++ // Nova ordem sequencial global
            });
            // console.log(`      Inserida: ${globalOrder-1}. ${lessonData.title}`);
        }
        console.log(`   ✅ ${allLessons.length} lições inseridas e reordenadas.`);

        console.log('\n🎉 Seed concluído com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedNovaJornada();
