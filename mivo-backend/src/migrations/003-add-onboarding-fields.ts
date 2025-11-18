import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('users', 'goal', {
    type: DataTypes.ENUM('pleno', 'migrar', 'aprender'),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'currentLevel', {
    type: DataTypes.ENUM('junior', 'pleno', 'senior', 'iniciante'),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'dailyTimeCommitment', {
    type: DataTypes.ENUM('5', '10', '20'),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'company', {
    type: DataTypes.STRING(100),
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'productArea', {
    type: DataTypes.ENUM('b2c', 'b2b', 'marketplace', 'fintech', 'saas'),
    allowNull: true,
  });

  await queryInterface.addIndex('users', ['company']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('users', ['company']);
  await queryInterface.removeColumn('users', 'productArea');
  await queryInterface.removeColumn('users', 'company');
  await queryInterface.removeColumn('users', 'dailyTimeCommitment');
  await queryInterface.removeColumn('users', 'currentLevel');
  await queryInterface.removeColumn('users', 'goal');
}
