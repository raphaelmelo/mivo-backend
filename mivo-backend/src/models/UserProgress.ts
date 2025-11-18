import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserProgressAttributes {
  id: number;
  userId: number;
  lessonId: number;
  isCompleted: boolean;
  completedAt: Date | null;
  score: number | null;
  timeSpentMinutes: number;
  attempts: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserProgressCreationAttributes extends Optional<UserProgressAttributes, 'id' | 'isCompleted' | 'completedAt' | 'score' | 'timeSpentMinutes' | 'attempts'> {}

class UserProgress extends Model<UserProgressAttributes, UserProgressCreationAttributes> implements UserProgressAttributes {
  public id!: number;
  public userId!: number;
  public lessonId!: number;
  public isCompleted!: boolean;
  public completedAt!: Date | null;
  public score!: number | null;
  public timeSpentMinutes!: number;
  public attempts!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProgress.init(
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
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    timeSpentMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_progress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lessonId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['lessonId'],
      },
    ],
  }
);

export default UserProgress;
