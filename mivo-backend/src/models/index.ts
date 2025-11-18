import sequelize from '../config/database';
import User from './User';
import Lesson from './Lesson';
import UserProgress from './UserProgress';
import Badge from './Badge';
import UserBadge from './UserBadge';
import League from './League';

// Define relationships

// User <-> League (Many-to-One)
User.belongsTo(League, { foreignKey: 'leagueId', as: 'league' });
League.hasMany(User, { foreignKey: 'leagueId', as: 'users' });

// User <-> UserProgress <-> Lesson (Many-to-Many through UserProgress)
User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progress' });
UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Lesson.hasMany(UserProgress, { foreignKey: 'lessonId', as: 'progress' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// User <-> UserBadge <-> Badge (Many-to-Many through UserBadge)
User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'userId', as: 'badges' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badgeId', as: 'users' });

User.hasMany(UserBadge, { foreignKey: 'userId', as: 'userBadges' });
UserBadge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Badge.hasMany(UserBadge, { foreignKey: 'badgeId', as: 'userBadges' });
UserBadge.belongsTo(Badge, { foreignKey: 'badgeId', as: 'badge' });

// Sync database function
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await sequelize.sync({ force });
    console.log(`✅ Database synced ${force ? '(forced)' : '(safe)'}.`);

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export {
  sequelize,
  User,
  Lesson,
  UserProgress,
  Badge,
  UserBadge,
  League,
};
