import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum BadgeCategory {
  STREAK = 'streak',
  XP = 'xp',
  LESSONS = 'lessons',
  ACHIEVEMENT = 'achievement',
  SPECIAL = 'special'
}

interface BadgeAttributes {
  id: number;
  name: string;
  description: string;
  category: BadgeCategory;
  iconUrl: string;
  requirement: any; // JSON with badge unlock criteria
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id' | 'isActive'> {}

class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: BadgeCategory;
  public iconUrl!: string;
  public requirement!: any;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Badge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(BadgeCategory)),
      allowNull: false,
    },
    iconUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    requirement: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'JSON criteria for unlocking badge (e.g., {type: "streak", value: 7})',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'badges',
    timestamps: true,
    indexes: [
      {
        fields: ['category'],
      },
    ],
  }
);

export default Badge;
