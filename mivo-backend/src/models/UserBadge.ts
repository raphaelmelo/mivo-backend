import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserBadgeAttributes {
  id: number;
  userId: number;
  badgeId: number;
  unlockedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserBadgeCreationAttributes extends Optional<UserBadgeAttributes, 'id' | 'unlockedAt'> {}

class UserBadge extends Model<UserBadgeAttributes, UserBadgeCreationAttributes> implements UserBadgeAttributes {
  public id!: number;
  public userId!: number;
  public badgeId!: number;
  public unlockedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserBadge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    badgeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'badges',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    unlockedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_badges',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'badgeId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['badgeId'],
      },
    ],
  }
);

export default UserBadge;
