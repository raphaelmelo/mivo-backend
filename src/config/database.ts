import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();


const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ FATAL ERROR: DATABASE_URL environment variable is not defined.");
  if (process.env.NODE_ENV === 'production') {
    console.error("Please configure the DATABASE_URL in your deployment environment (e.g. Coolify/Render variables).");
    process.exit(1); 
  } else {
    console.warn("⚠️  Running without DATABASE_URL. Database connection will likely fail.");
  }
}

const dbUrl = DATABASE_URL || '';
const isRenderDB = dbUrl.includes('render.com');

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: (process.env.DB_SSL === 'true' || isRenderDB) ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
