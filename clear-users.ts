import User from './src/models/User';
import UserBadge from './src/models/UserBadge';
import UserProgress from './src/models/UserProgress';
import { syncDatabase } from './src/models';

async function clearUsers() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await syncDatabase();

        console.log('🗑️  Deletando progresso dos usuários...');
        await UserProgress.destroy({ where: {}, truncate: true });

        console.log('🗑️  Deletando badges dos usuários...');
        await UserBadge.destroy({ where: {}, truncate: true });

        console.log('🗑️  Deletando todos os usuários...');
        const deletedCount = await User.destroy({ where: {}, truncate: true, cascade: true });

        console.log(`✅ ${deletedCount} usuários foram deletados com sucesso!`);
        console.log('✅ Banco de dados limpo!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao limpar usuários:', error);
        process.exit(1);
    }
}

clearUsers();
