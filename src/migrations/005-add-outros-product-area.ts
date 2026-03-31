import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `ALTER TYPE "enum_users_productArea" ADD VALUE IF NOT EXISTS 'outros';`
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // PostgreSQL does not support removing values from ENUMs directly.
  // A full migration would require creating a new type and swapping columns.
}
