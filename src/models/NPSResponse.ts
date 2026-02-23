import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NPSResponseAttributes {
  id: number;
  userId: number;
  score: number;
  feedback: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NPSResponseCreationAttributes extends Optional<NPSResponseAttributes, 'id' | 'feedback'> { }

class NPSResponse extends Model<NPSResponseAttributes, NPSResponseCreationAttributes> implements NPSResponseAttributes {
  public id!: number;
  public userId!: number;
  public score!: number;
  public feedback!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NPSResponse.init(
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
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 10,
      },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'nps_responses',
    timestamps: true,
  }
);

export default NPSResponse;
