import sequelize from '../config/database';

async function fixUsersSchema() {
    try {
        console.log('🔄 Conectando ao banco de dados para ajuste de schema...');
        await sequelize.authenticate();
        console.log('✅ Conectado.');

        console.log('📦 Alterando coluna "password" para permitir valores nulos...');
        
        // Comando SQL puro para alterar a restrição da coluna
        await sequelize.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL;');
        
        console.log('✅ Coluna "password" agora permite valores NULL.');
        
        console.log('\n🎉 Ajuste de schema concluído com sucesso!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erro ao ajustar o schema:', error.message);
        process.exit(1);
    }
}

fixUsersSchema();
