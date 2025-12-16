import sequelize from '../src/config/database';
import Badge, { BadgeCategory } from '../src/models/Badge';

async function seedBadges() {
    try {
        console.log('🌱 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        const badges = [
            // Streak Badges
            {
                name: 'Primeiro Dia',
                description: 'Complete seu primeiro dia de estudos',
                category: BadgeCategory.STREAK,
                iconUrl: 'https://img.icons8.com/fluency/96/fire-element.png',
                requirement: { type: 'streak', value: 1 },
            },
            {
                name: 'Semana Forte',
                description: 'Mantenha uma streak de 7 dias',
                category: BadgeCategory.STREAK,
                iconUrl: 'https://img.icons8.com/fluency/96/fire.png',
                requirement: { type: 'streak', value: 7 },
            },
            {
                name: 'Dedicação Total',
                description: 'Alcance 30 dias de streak',
                category: BadgeCategory.STREAK,
                iconUrl: 'https://img.icons8.com/fluency/96/trophy.png',
                requirement: { type: 'streak', value: 30 },
            },
            
            // XP Badges
            {
                name: 'Iniciante',
                description: 'Ganhe seus primeiros 100 XP',
                category: BadgeCategory.XP,
                iconUrl: 'https://img.icons8.com/fluency/96/star.png',
                requirement: { type: 'xp', value: 100 },
            },
            {
                name: 'Estudante Dedicado',
                description: 'Acumule 500 XP',
                category: BadgeCategory.XP,
                iconUrl: 'https://img.icons8.com/fluency/96/medal.png',
                requirement: { type: 'xp', value: 500 },
            },
            {
                name: 'Expert em Ascensão',
                description: 'Chegue a 1000 XP',
                category: BadgeCategory.XP,
                iconUrl: 'https://img.icons8.com/fluency/96/crown.png',
                requirement: { type: 'xp', value: 1000 },
            },
            {
                name: 'Mestre do Produto',
                description: 'Alcance 5000 XP',
                category: BadgeCategory.XP,
                iconUrl: 'https://img.icons8.com/fluency/96/diamond.png',
                requirement: { type: 'xp', value: 5000 },
            },
            
            // Lessons Badges
            {
                name: 'Primeira Lição',
                description: 'Complete sua primeira lição',
                category: BadgeCategory.LESSONS,
                iconUrl: 'https://img.icons8.com/fluency/96/book.png',
                requirement: { type: 'lessons', value: 1 },
            },
            {
                name: 'Progredindo',
                description: 'Complete 5 lições',
                category: BadgeCategory.LESSONS,
                iconUrl: 'https://img.icons8.com/fluency/96/graduation-cap.png',
                requirement: { type: 'lessons', value: 5 },
            },
            {
                name: 'Estudante Ativo',
                description: 'Complete 10 lições',
                category: BadgeCategory.LESSONS,
                iconUrl: 'https://img.icons8.com/fluency/96/certificate.png',
                requirement: { type: 'lessons', value: 10 },
            },
            {
                name: 'Maratonista',
                description: 'Complete 25 lições',
                category: BadgeCategory.LESSONS,
                iconUrl: 'https://img.icons8.com/fluency/96/rocket.png',
                requirement: { type: 'lessons', value: 25 },
            },
            
            // Achievement Badges
            {
                name: 'Level Up!',
                description: 'Alcance o nível 5',
                category: BadgeCategory.ACHIEVEMENT,
                iconUrl: 'https://img.icons8.com/fluency/96/lightning-bolt.png',
                requirement: { type: 'level', value: 5 },
            },
            {
                name: 'Persistente',
                description: 'Alcance 3 dias de streak e 200 XP',
                category: BadgeCategory.ACHIEVEMENT,
                iconUrl: 'https://img.icons8.com/fluency/96/muscle.png',
                requirement: { type: 'composite', minStreak: 3, minXp: 200 },
            },
            {
                name: 'Warrior do Produto',
                description: 'Complete 15 lições com 7 dias de streak',
                category: BadgeCategory.ACHIEVEMENT,
                iconUrl: 'https://img.icons8.com/fluency/96/sword.png',
                requirement: { type: 'composite', minLessons: 15, minStreak: 7 },
            },
        ];

        console.log(`\n📦 Seeding ${badges.length} badges...\n`);

        let created = 0;
        let updated = 0;

        for (const badgeData of badges) {
            const [badge, wasCreated] = await Badge.findOrCreate({
                where: { name: badgeData.name },
                defaults: badgeData,
            });

            if (!wasCreated) {
                // Update existing badge
                await badge.update(badgeData);
                console.log(`   🔄 Updated: ${badgeData.name}`);
                updated++;
            } else {
                console.log(`   ✨ Created: ${badgeData.name}`);
                created++;
            }
        }

        console.log(`\n✅ Badge seeding complete!`);
        console.log(`   📊 Created: ${created}`);
        console.log(`   🔄 Updated: ${updated}`);
        console.log(`   📌 Total: ${badges.length}`);

    } catch (error) {
        console.error('❌ Error seeding badges:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the seed function
seedBadges();
