import sequelize from '../src/config/database';
import Journey from '../src/models/Journey';
import Lesson from '../src/models/Lesson';

const journeysData = [
    {
        id: 1,
        name: 'Fundamentos PMM',
        description: 'Entenda o papel do Product Marketing Manager e sua importância estratégica',
        icon: '🎯',
        order: 1,
        isPublished: true
    },
    {
        id: 2,
        name: 'Posicionamento',
        description: 'Domine ICP, competição e definição de mensagem',
        icon: '🧭',
        order: 2,
        isPublished: true
    },
    {
        id: 3,
        name: 'Go-to-Market',
        description: 'Estratégias de GTM, canais e lançamento',
        icon: '🚀',
        order: 3,
        isPublished: true
    },
    {
        id: 4,
        name: 'Sales Enablement',
        description: 'Habilite vendas, gere pipeline e alinhe times',
        icon: '💼',
        order: 4,
        isPublished: true
    },
    {
        id: 5,
        name: 'Pricing & Packaging',
        description: 'Precificação estratégica e empacotamento de ofertas',
        icon: '💰',
        order: 5,
        isPublished: true
    },
    {
        id: 6,
        name: 'Growth & PLG',
        description: 'Product-Led Growth, expansão e engajamento',
        icon: '📈',
        order: 6,
        isPublished: true
    },
    {
        id: 7,
        name: 'Branding & Cultura',
        description: 'Marca, linguagem e storytelling',
        icon: '✨',
        order: 7,
        isPublished: true
    },
    {
        id: 8,
        name: 'Métricas & Feedback',
        description: 'Análise de resultados e feedback loop',
        icon: '📊',
        order: 8,
        isPublished: true
    }
];

// Mapeamento: order da lição -> journeyId
// Lições 1-5 = Journey 1, 6-10 = Journey 2, etc.
const lessonOrderToJourneyId: Record<number, number> = {
    // Journey 1: Fundamentos PMM (lições order 1-5)
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
    // Journey 2: Posicionamento (lições order 6-10)
    6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
    // Journey 3: Go-to-Market (lições order 11-15)
    11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
    // Journey 4: Sales Enablement (lições order 16-20)
    16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
    // Journey 5: Pricing & Packaging (lições order 21-25)
    21: 5, 22: 5, 23: 5, 24: 5, 25: 5,
    // Journey 6: Growth & PLG (lições order 26-30)
    26: 6, 27: 6, 28: 6, 29: 6, 30: 6,
    // Journey 7: Branding & Cultura (lições order 31-35)
    31: 7, 32: 7, 33: 7, 34: 7, 35: 7,
    // Journey 8: Métricas & Feedback (lições order 36-40)
    36: 8, 37: 8, 38: 8, 39: 8, 40: 8
};

async function seedJourneys() {
    try {
        console.log('🌱 Conectando ao banco...');
        await sequelize.authenticate();
        console.log('✅ Conectado.');

        // Sync para criar tabela journeys
        await sequelize.sync({ alter: true });
        console.log('✅ Tabelas sincronizadas.');

        // Criar jornadas
        console.log('\n📚 Criando jornadas...');
        for (const journey of journeysData) {
            const [created, isNew] = await Journey.findOrCreate({
                where: { id: journey.id },
                defaults: journey
            });
            console.log(`   ${isNew ? '✅ Criada' : '⏭️  Existe'}: ${journey.name}`);
        }

        // Atualizar lições com journeyId
        console.log('\n🔗 Vinculando lições às jornadas...');
        const lessons = await Lesson.findAll();

        let updated = 0;
        for (const lesson of lessons) {
            const journeyId = lessonOrderToJourneyId[lesson.order];
            if (journeyId && lesson.journeyId !== journeyId) {
                lesson.journeyId = journeyId;
                await lesson.save();
                updated++;
            }
        }
        console.log(`   ✅ ${updated} lições atualizadas com journeyId`);

        // Resumo
        console.log('\n📊 Resumo:');
        for (const journey of journeysData) {
            const count = await Lesson.count({ where: { journeyId: journey.id } });
            console.log(`   ${journey.icon} ${journey.name}: ${count} lições`);
        }

        console.log('\n🎉 Seed de jornadas concluído!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

seedJourneys();
