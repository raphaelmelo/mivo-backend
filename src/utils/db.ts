import sequelize from '../config/database';

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // console.log('Database connection has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
