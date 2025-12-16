import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum LessonType {
  CONCEPT_BUILDER = 'concept_builder',
  DECISION_MAKER = 'decision_maker',
  REAL_WORLD_CHALLENGE = 'real_world_challenge',
  PEER_REVIEW = 'peer_review',
  COMMUNITY_QUEST = 'community_quest'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

interface LessonAttributes {
  id: number;
  journeyId: number | null;
  title: string;
  description: string;
  type: LessonType;
  difficulty: DifficultyLevel;
  xpReward: number;
  content: any; // JSON content structure
  estimatedMinutes: number;
  isPremium: boolean;
  order: number;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'journeyId' | 'isPremium' | 'isPublished'> { }

class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  public id!: number;
  public journeyId!: number | null;
  public title!: string;
  public description!: string;
  public type!: LessonType;
  public difficulty!: DifficultyLevel;
  public xpReward!: number;
  public content!: any;
  public estimatedMinutes!: number;
  public isPremium!: boolean;
  public order!: number;
  public isPublished!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    journeyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'journeys',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(LessonType)),
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM(...Object.values(DifficultyLevel)),
      allowNull: false,
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    estimatedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'lessons',
    timestamps: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['difficulty'],
      },
      {
        fields: ['order'],
      },
      {
        fields: ['journeyId'],
      },
    ],
  }
);

export default Lesson;
