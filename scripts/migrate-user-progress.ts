import sequelize from '../src/config/database';
import User from '../src/models/User';
import UserProgress from '../src/models/UserProgress';
import Lesson from '../src/models/Lesson';
import { Op } from 'sequelize';

async function migrateUserProgress() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Find users with lessons completed but no progress records
        const users = await User.findAll({
            where: { lessonsCompleted: { [Op.gt]: 0 } }
        });

        console.log(`\n📊 Found ${users.length} users with completed lessons\n`);

        for (const user of users) {
            const existingProgress = await UserProgress.count({
                where: { userId: user.id }
            });

            if (existingProgress > 0) {
                console.log(`✓ User ${user.email} already has progress records (${existingProgress})`);
                continue;
            }

            console.log(`\n🔧 Migrating progress for ${user.email}`);
            console.log(`   Lessons completed: ${user.lessonsCompleted}`);

            // Get first N lessons (ordered by order field)
            const lessons = await Lesson.findAll({
                where: { isPublished: true },
                order: [['order', 'ASC']],
                limit: user.lessonsCompleted
            });

            console.log(`   Creating ${lessons.length} progress records...`);

            for (const lesson of lessons) {
                await UserProgress.create({
                    userId: user.id,
                    lessonId: lesson.id,
                    isCompleted: true,
                    completedAt: user.createdAt, // Approximate date
                    attempts: 1,
                    timeSpentMinutes: 0
                });
            }

            console.log(`   ✅ Created ${lessons.length} progress records`);
        }

        console.log('\n🎉 Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

migrateUserProgress();
