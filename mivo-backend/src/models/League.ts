import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum LeagueTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

interface LeagueAttributes {
  id: number;
  name: string;
  tier: LeagueTier;
  minXp: number;
  maxXp: number;
  iconUrl: string;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeagueCreationAttributes extends Optional<LeagueAttributes, 'id' | 'isActive'> {}

class League extends Model<LeagueAttributes, LeagueCreationAttributes> implements LeagueAttributes {
  public id!: number;
  public name!: string;
  public tier!: LeagueTier;
  public minXp!: number;
  public maxXp!: number;
  public iconUrl!: string;
  public description!: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

League.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tier: {
      type: DataTypes.ENUM(...Object.values(LeagueTier)),
      allowNull: false,
      unique: true,
    },
    minXp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxXp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    iconUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'leagues',
    timestamps: true,
    indexes: [
      {
        fields: ['tier'],
      },
      {
        fields: ['minXp', 'maxXp'],
      },
    ],
  }
);

export default League;
