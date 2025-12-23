import sequelize from '../src/config/database';
import Lesson from '../src/models/Lesson';

async function debugLessonContent() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        const lessons = await Lesson.findAll({
            where: { type: 'real_world_challenge' }
        });

        if (lessons.length === 0) {
            console.log('❌ No Real World Challenge lessons found.');
        } else {
            console.log(`✅ Found ${lessons.length} Real World Challenge lessons\n`);

            for (const lesson of lessons) {
                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📚 Lesson: ${lesson.title}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

                const content = lesson.content as any;
                console.log('Has stats:', !!content.stats);

                if (content.stats) {
                    console.log('Stats:', JSON.stringify(content.stats, null, 2));
                } else {
                    console.log('⚠️  No stats found - defaulting to 15%');
                    console.log('Options:', content.options?.map((opt: any) => opt.id) || []);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugLessonContent();
