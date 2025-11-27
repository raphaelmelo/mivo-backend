import fs from 'fs';
import path from 'path';
import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';

const seedDir = path.join(__dirname, '../lessons-seed');
const types = ['concept-builder', 'real-world-challenge', 'decision-maker', 'peer-review', 'community-quest'];

async function seedLessons() {
    try {
        console.log('🌱 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // Optional: Sync models if needed (be careful in production)
        // await sequelize.sync({ alter: true });

        let totalImported = 0;

        for (const typeDirName of types) {
            const typeDir = path.join(seedDir, typeDirName);
            if (!fs.existsSync(typeDir)) {
                console.warn(`⚠️  Directory not found: ${typeDirName}`);
                continue;
            }

            const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
            console.log(`\n📂 Processing ${typeDirName} (${files.length} files)...`);

            for (const file of files) {
                const filePath = path.join(typeDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lessonData = JSON.parse(content);

                // Ensure type matches the enum in the model (snake_case)
                // The JSONs already have snake_case types, but let's be sure

                try {
                    // Check if lesson exists by title to avoid duplicates
                    const existingLesson = await Lesson.findOne({ where: { title: lessonData.title } });

                    if (existingLesson) {
                        console.log(`   🔄 Updating: ${lessonData.title}`);
                        await existingLesson.update(lessonData);
                    } else {
                        console.log(`   ✨ Creating: ${lessonData.title}`);
                        await Lesson.create(lessonData);
                    }
                    totalImported++;
                } catch (err: any) {
                    console.error(`   ❌ Error importing ${file}: ${err.message}`);
                }
            }
        }

        console.log('\n----------------------------------------');
        console.log(`🎉 Seed complete! Total lessons processed: ${totalImported}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal error during seed:', error);
        process.exit(1);
    }
}

seedLessons();
