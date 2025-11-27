import sequelize from './src/config/database';

const addColumn = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        console.log('🔄 Adding lessonsCompleted column...');
        await sequelize.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "lessonsCompleted" INTEGER NOT NULL DEFAULT 0;
    `);

        console.log('✅ Column added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addColumn();
