import sequelize from '../src/config/database';
import User from '../src/models/User';
import UserProgress from '../src/models/UserProgress';
import { Op } from 'sequelize';

async function checkUserProgress() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Find user with XP > 0
        const users = await User.findAll({
            where: { xp: { [Op.gt]: 0 } },
            limit: 5
        });

        for (const user of users) {
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`👤 User: ${user.name} (${user.email})`);
            console.log(`   XP: ${user.xp}`);
            console.log(`   Lessons Completed: ${user.lessonsCompleted}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            const progress = await UserProgress.findAll({
                where: { userId: user.id }
            });

            console.log(`   UserProgress records: ${progress.length}`);

            if (progress.length > 0) {
                progress.forEach(p => {
                    console.log(`   - Lesson ${p.lessonId}: ${p.isCompleted ? '✅' : '⏳'}`);
                });
            } else {
                console.log(`   ⚠️  No UserProgress records found!`);
                console.log(`   🔧 User completed ${user.lessonsCompleted} lessons but has no progress tracking`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUserProgress();
