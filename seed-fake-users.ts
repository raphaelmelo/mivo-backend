import User from './src/models/User';
import Badge from './src/models/Badge';
import UserBadge from './src/models/UserBadge';
import League from './src/models/League';
import { syncDatabase } from './src/models';
import bcrypt from 'bcryptjs';

const brazilianNames = [
    'Ana Silva', 'Bruno Santos', 'Carlos Oliveira', 'Daniela Costa', 'Eduardo Lima',
    'Fernanda Alves', 'Gabriel Souza', 'Helena Pereira', 'Igor Rodrigues', 'Juliana Ferreira',
    'Leonardo Martins', 'Mariana Gomes', 'Nicolas Ribeiro', 'Olivia Carvalho', 'Pedro Araújo',
    'Rafaela Barbosa', 'Samuel Dias', 'Tatiana Cardoso', 'Vinícius Fernandes', 'Yasmin Rocha',
    'André Mendes', 'Beatriz Castro', 'Caio Monteiro', 'Diana Freitas', 'Enzo Teixeira',
    'Fabiana Pinto', 'Gustavo Ramos', 'Isabela Duarte', 'João Moreira', 'Kamila Azevedo'
];

const companies = [
    'Nubank', 'iFood', 'Mercado Livre', 'Stone', 'Quinto Andar',
    'Loft', 'Creditas', 'Loggi', 'Gympass', 'Vtex',
    'MadeiraMadeira', 'Neon', 'PicPay', 'Conta Azul', 'Meliuz',
    'Enjoei', 'QuintoAndar', 'CargoX', 'GetNinjas', 'Gupy'
];

const productAreas = ['b2c', 'b2b', 'marketplace', 'fintech', 'saas'] as const;
const goals = ['pleno', 'migrar', 'aprender'] as const;
const currentLevels = ['junior', 'pleno', 'senior', 'iniciante'] as const;
const dailyTimes = ['5', '10', '20'] as const;

async function createFakeUsers() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await syncDatabase();

        // Get Bronze league
        const bronzeLeague = await League.findOne({ where: { tier: 'bronze' } });
        const silverLeague = await League.findOne({ where: { tier: 'silver' } });
        const goldLeague = await League.findOne({ where: { tier: 'gold' } });

        if (!bronzeLeague) {
            console.error('❌ Liga Bronze não encontrada! Execute o seed de leagues primeiro.');
            process.exit(1);
        }

        // Get all badges for random assignment
        const allBadges = await Badge.findAll({ where: { isActive: true } });

        console.log('👥 Criando 30 usuários fake...');

        const hashedPassword = await bcrypt.hash('demo123', 10);

        for (let i = 0; i < 30; i++) {
            const name = brazilianNames[i];
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            
            // Distribuição realista de XP e progresso
            const xpBase = Math.floor(Math.random() * 3000);
            const streak = Math.floor(Math.random() * 60);
            const lessonsCompleted = Math.floor(Math.random() * 25);
            const level = Math.floor(xpBase / 1000) + 1;

            // Assign league based on XP
            let leagueId = bronzeLeague.id;
            if (xpBase >= 1500 && goldLeague) {
                leagueId = goldLeague.id;
            } else if (xpBase >= 500 && silverLeague) {
                leagueId = silverLeague.id;
            }

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                xp: xpBase,
                level,
                streak,
                lessonsCompleted,
                lastActiveDate: new Date(),
                isPremium: Math.random() > 0.8, // 20% premium
                leagueId,
                goal: goals[Math.floor(Math.random() * goals.length)],
                currentLevel: currentLevels[Math.floor(Math.random() * currentLevels.length)],
                dailyTimeCommitment: dailyTimes[Math.floor(Math.random() * dailyTimes.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                productArea: productAreas[Math.floor(Math.random() * productAreas.length)]
            });

            // Assign badges based on achievements
            const earnedBadges: number[] = [];

            for (const badge of allBadges) {
                let shouldAward = false;

                switch (badge.category) {
                    case 'streak':
                        if (streak >= 7 && badge.requirement?.includes('7')) shouldAward = true;
                        if (streak >= 30 && badge.requirement?.includes('30')) shouldAward = true;
                        break;
                    case 'xp':
                        const xpReq = parseInt(badge.requirement?.match(/\d+/)?.[0] || '0');
                        if (xpBase >= xpReq) shouldAward = true;
                        break;
                    case 'lessons':
                        const lessonReq = parseInt(badge.requirement?.match(/\d+/)?.[0] || '0');
                        if (lessonsCompleted >= lessonReq) shouldAward = true;
                        break;
                    case 'achievement':
                        const levelReq = parseInt(badge.requirement?.match(/\d+/)?.[0] || '0');
                        if (level >= levelReq) shouldAward = true;
                        break;
                }

                if (shouldAward && !earnedBadges.includes(badge.id)) {
                    await UserBadge.create({
                        userId: user.id,
                        badgeId: badge.id,
                        unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
                    });
                    earnedBadges.push(badge.id);
                }
            }

            console.log(`  ✅ Criado: ${name} | ${xpBase} XP | ${streak} dias | ${earnedBadges.length} badges`);
        }

        console.log('\n🎉 30 usuários fake criados com sucesso!');
        console.log('📊 Estatísticas:');
        
        const totalUsers = await User.count();
        const avgXp = await User.findAll({
            attributes: [[User.sequelize!.fn('AVG', User.sequelize!.col('xp')), 'avgXp']]
        });
        const maxXp = await User.max('xp');
        
        console.log(`   Total de usuários: ${totalUsers}`);
        console.log(`   XP médio: ${Math.round(Number(avgXp[0].get('avgXp')))}`);
        console.log(`   XP máximo: ${maxXp}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuários fake:', error);
        process.exit(1);
    }
}

createFakeUsers();
