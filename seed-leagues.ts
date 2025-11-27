import League, { LeagueTier } from './src/models/League';
import { syncDatabase } from './src/models';

async function seedLeagues() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await syncDatabase();

        console.log('🏆 Criando ligas...');

        const leagues = [
            {
                name: 'Liga Bronze',
                tier: 'bronze' as LeagueTier,
                minXp: 0,
                maxXp: 499,
                iconUrl: '🥉',
                description: 'Início da jornada',
                isActive: true
            },
            {
                name: 'Liga Prata',
                tier: 'silver' as LeagueTier,
                minXp: 500,
                maxXp: 1499,
                iconUrl: '🥈',
                description: 'Progresso consistente',
                isActive: true
            },
            {
                name: 'Liga Ouro',
                tier: 'gold' as LeagueTier,
                minXp: 1500,
                maxXp: 2999,
                iconUrl: '🥇',
                description: 'Excelência',
                isActive: true
            },
            {
                name: 'Liga Platina',
                tier: 'platinum' as LeagueTier,
                minXp: 3000,
                maxXp: 9999,
                iconUrl: '💎',
                description: 'Elite',
                isActive: true
            },
            {
                name: 'Liga Diamante',
                tier: 'diamond' as LeagueTier,
                minXp: 10000,
                maxXp: 999999,
                iconUrl: '💠',
                description: 'Lendário',
                isActive: true
            }
        ];

        for (const league of leagues) {
            const existing = await League.findOne({ where: { tier: league.tier } });
            if (!existing) {
                await League.create(league);
                console.log(`  ✅ ${league.name} criada`);
            } else {
                console.log(`  ⏭️  ${league.name} já existe`);
            }
        }

        console.log('\n✅ Ligas criadas com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar ligas:', error);
        process.exit(1);
    }
}

seedLeagues();
