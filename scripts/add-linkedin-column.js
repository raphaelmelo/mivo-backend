const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('users');

    if (!tableInfo.linkedinId) {
      console.log('➕ Adding linkedinId column to users table...');
      await queryInterface.addColumn('users', 'linkedinId', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      });
      console.log('✅ linkedinId column added successfully');
    } else {
      console.log('ℹ️ linkedinId column already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
