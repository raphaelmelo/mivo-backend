import sequelize from '../src/config/database';

async function migrateJourneyId() {
    try {
        console.log('🔄 Conectando ao banco...');
        await sequelize.authenticate();
        console.log('✅ Conectado.');

        // 1. Criar tabela journeys se não existir
        console.log('\n📦 Criando tabela journeys...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS journeys (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                icon VARCHAR(50) NOT NULL DEFAULT '📚',
                "order" INTEGER NOT NULL DEFAULT 0,
                "isPublished" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabela journeys criada.');

        // 2. Adicionar coluna journeyId na tabela lessons se não existir
        console.log('\n📦 Adicionando coluna journeyId em lessons...');
        try {
            await sequelize.query(`
                ALTER TABLE lessons 
                ADD COLUMN IF NOT EXISTS "journeyId" INTEGER REFERENCES journeys(id);
            `);
            console.log('✅ Coluna journeyId adicionada.');
        } catch (e: any) {
            if (e.message.includes('already exists')) {
                console.log('⏭️  Coluna journeyId já existe.');
            } else {
                throw e;
            }
        }

        // 3. Criar índice se não existir
        console.log('\n📦 Criando índice em journeyId...');
        try {
            await sequelize.query(`
                CREATE INDEX IF NOT EXISTS "lessons_journey_id" ON lessons ("journeyId");
            `);
            console.log('✅ Índice criado.');
        } catch (e: any) {
            console.log('⏭️  Índice já existe:', e.message);
        }

        console.log('\n🎉 Migração concluída!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
}

migrateJourneyId();
