import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: Date;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  leagueId: number | null;
  // Onboarding profile data
  goal: 'pleno' | 'migrar' | 'aprender' | null;
  currentLevel: 'junior' | 'pleno' | 'senior' | 'iniciante' | null;
  dailyTimeCommitment: '5' | '10' | '20' | null;
  company: string | null;
  productArea: 'b2c' | 'b2b' | 'marketplace' | 'fintech' | 'saas' | null;
  lessonsCompleted: number;
  linkedinId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'xp' | 'level' | 'streak' | 'lastActiveDate' | 'isPremium' | 'premiumExpiresAt' | 'leagueId' | 'goal' | 'currentLevel' | 'dailyTimeCommitment' | 'company' | 'productArea' | 'lessonsCompleted' | 'linkedinId'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public xp!: number;
  public level!: number;
  public streak!: number;
  public lastActiveDate!: Date;
  public isPremium!: boolean;
  public premiumExpiresAt!: Date | null;
  public leagueId!: number | null;
  public goal!: 'pleno' | 'migrar' | 'aprender' | null;
  public currentLevel!: 'junior' | 'pleno' | 'senior' | 'iniciante' | null;
  public dailyTimeCommitment!: '5' | '10' | '20' | null;
  public company!: string | null;
  public productArea!: 'b2c' | 'b2b' | 'marketplace' | 'fintech' | 'saas' | null;
  public lessonsCompleted!: number;
  public linkedinId!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastActiveDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    premiumExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'leagues',
        key: 'id',
      },
    },
    goal: {
      type: DataTypes.ENUM('pleno', 'migrar', 'aprender'),
      allowNull: true,
    },
    currentLevel: {
      type: DataTypes.ENUM('junior', 'pleno', 'senior', 'iniciante'),
      allowNull: true,
    },
    dailyTimeCommitment: {
      type: DataTypes.ENUM('5', '10', '20'),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    productArea: {
      type: DataTypes.ENUM('b2c', 'b2b', 'marketplace', 'fintech', 'saas'),
      allowNull: true,
    },
    lessonsCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    linkedinId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['leagueId'],
      },
      {
        fields: ['company'],
      },
    ],
  }
);

export default User;
